# 05 — Biblioteca y textos

La biblioteca es el **diccionario** del sistema. No contiene lógica: sólo datos que el
compositor elige y concatena. Todo se edita en `EcosBibliotecaAsset` o, en código, en
`EcosBibliotecaFragmentos`.

> **Cero Alucinaciones en una frase:** si una palabra no está en la biblioteca, el motor
> no la inventa. Muestra el id crudo (`quemar`, `aldea`) para que veas el hueco.

---

## 1. Crear la biblioteca

- **Inspector:** `Assets ▸ Create ▸ Ecos ▸ Biblioteca de Fragmentos`.
- **Conjunto completo:** `Assets ▸ Create ▸ Ecos ▸ Conjunto completo de assets` (crea
  config, biblioteca y categorías de una vez).
- **Código:** `EcosBibliotecaFragmentos.CrearPorDefecto()` (incluye un vocabulario
  mínimo en español listo para probar).

En el asset, cada lista tiene su cabecera y su tooltip. En código, las listas son
públicas: puedes añadir entradas y llamar a `Invalidar()` para refrescar los índices.

```csharp
var biblioteca = EcosBibliotecaFragmentos.CrearPorDefecto();
biblioteca.Acciones.Add(new EcosAccion { /* ... */ });
biblioteca.Objetos.Add(new EcosObjeto { /* ... */ });
biblioteca.Invalidar();   // reconstruye índices en la próxima consulta
```

---

## 2. Sujetos (`EcosSujeto`)

Quién protagoniza el hecho.

| Campo | Tipo | Para qué | Ejemplo |
| --- | --- | --- | --- |
| `Id` | string | Clave estable que viaja en el eco. | `@JugadorA`, `@Herrero` |
| `Nombre` | string | Nombre propio en la frase. | `Aldric`, `el herrero` |
| `NombreVago` | string | Nombre cuando el oyente no conoce al sujeto o el eco está anonimizado. | `un forastero`, `alguien` |
| `NombreColectivo` | string | Variante para sujetos colectivos. Vacío = usa `Nombre`. | `la guardia` |
| `Genero` | enum | Concordancia de artículos/adjetivos. | `Masculino`, `Femenino` |
| `Numero` | enum | Singular/plural; decide `VerboSingular` o `VerboPlural`. | `Singular` |
| `EsJugador` | bool | Los jugadores se consideran conocidos desde el inicio. | `true` para `@JugadorA` |
| `IdentidadRevelable` | bool | Si es true, el nombre sólo se revela cuando el oyente lo conoce. | `true` |

### Ejemplo: añadir al herrero

```csharp
biblioteca.Sujetos.Add(new EcosSujeto
{
    Id = "@Herrero",
    Nombre = "el herrero",
    NombreVago = "un hombre de manos curtidas",
    Genero = EcosGenero.Masculino,
    Numero = EcosNumero.Singular,
    EsJugador = false,
    IdentidadRevelable = true
});
biblioteca.Invalidar();
```

**Qué esperar:**

- Si el oyente conoce `@Herrero`: *"el herrero quemó la aldea"*.
- Si no lo conoce y `saltosParaAnonimizar = 0` o el nivel es `Distorsionado`:
  *"un hombre de manos curtidas quemó la aldea"*.
- Si el id no existe: *"@Herrero quemó la aldea"* (fallback honesto).

---

## 3. Acciones (`EcosAccion`)

El verbo **ya conjugado** y el dato cuantitativo del hecho.

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `Id` | string | Clave que envían triggers/código (`quemar`). Sin espacios. |
| `Infinitivo` | string | Texto para tooltips/editores (`quemar`, `abatir a distancia`). |
| `VerboSingular` | string | Pretérito 3ª singular (`quemó`). |
| `VerboPlural` | string | Pretérito 3ª plural (`quemaron`). |
| `Participio` | string | Para construcciones pasivas futuras (`quemado`). |
| `Transitiva` | bool | Si es false, la frase no lleva objeto directo. |
| `Categoria` | string | Clave elemental (`fuego`); vacío = se resuelve por embeddings. |
| `IntencionSugerida` | enum | Intención que el narrador tiende a usar con esta acción. |
| `ObjetoPorDefecto` | string | Objeto si el eco no trae uno; vacío = `@Nadie`. |
| `SinonimoInfinitivo` | string | Sinónimo para el mapeo semántico (`asesinar` → `matar`). |
| `Valencia` | int -100..100 | Valor moral para la ficha del sujeto. |
| `Peso` | float 0..1 | Cuánto pesa en la reputación. |
| `AntagonistaDe` | string[] | Acciones con las que se contradice sobre el mismo paciente. |
| `CantidadBase` | int | Dato cuantitativo base. `0` = sin cantidad. |
| `UnidadCantidad` | string | `metros`, `bandidos`, `días`. Vacío = no se muestra. |
| `PreposicionCantidad` | string | `desde`, `a`, `contra`. Vacío = sin preposición. |
| `CantidadesPorNivel` | int[5] | Cifra exacta por nivel; manda sobre la base. |
| `ContenedoresPorNivel` | string[5] | Colectivo por nivel (`un grupo de` → `un pelotón de`). |
| `InstrumentosPorNivel` | string[5] | Instrumento por nivel (`con su espada` → `con las manos desnudas`). |
| `CantidadComoObjeto` | bool | La cantidad sustituye al objeto directo. |

La cantidad se explica a fondo en [06 — Cantidades](06-Cantidades.md).

### Ejemplo: "envenenar el pozo"

```csharp
biblioteca.Acciones.Add(new EcosAccion
{
    Id = "envenenar_pozo",
    Infinitivo = "envenenar el pozo",
    VerboSingular = "envenenó",
    VerboPlural = "envenenaron",
    Participio = "envenenado",
    Transitiva = true,
    Categoria = "veneno",
    IntencionSugerida = EcosIntencion.Advertencia,
    Valencia = -80,
    Peso = 0.9f
});
biblioteca.Invalidar();
```

Con `objetoId = pozo` y la plantilla por defecto:

| Nivel | Frase esperada (aproximada) |
| --- | --- |
| Literal | "El herrero envenenó el pozo." |
| Suavizado | "Dicen que el herrero envenenó el pozo, más o menos." |
| Adornado | "Juran que el herrero envenenó el pozo en plena noche." |
| Exagerado | "No me lo creo, pero el herrero envenenó el pozo sin piedad." |
| Distorsionado | "El herrero envenenó el pozo con ayuda del demonio… y nadie hizo nada." |

Las palabras concretas dependen de tus listas `Prefijos`, `Sufijos`, `Adverbios` y de
la plantilla; lo importante es que **el verbo y el paciente no cambian**.

---

## 4. Objetos (`EcosObjeto`)

Paciente u objeto directo, con su concordancia.

| Campo | Tipo | Para qué | Ejemplo |
| --- | --- | --- | --- |
| `Id` | string | Clave del eco. | `aldea`, `pozo`, `@Prisioneros` |
| `Nombre` | string | Nombre sin artículo. | `aldea`, `avión de papel` |
| `Articulo` | string | Artículo determinado. Vacío = sin artículo. | `la`, `el`, `los` |
| `Genero` | enum | Concordancia. | `Femenino` |
| `Numero` | enum | Singular/plural. | `Singular` |
| `ArticuloIndeterminado` | string | Para futuras plantillas. | `una`, `un` |

```csharp
biblioteca.Objetos.Add(new EcosObjeto
{
    Id = "pozo",
    Nombre = "pozo",
    Articulo = "el",
    ArticuloIndeterminado = "un",
    Genero = EcosGenero.Masculino,
    Numero = EcosNumero.Singular
});
biblioteca.Invalidar();
```

**Truco:** para un objeto sin artículo ("se transformó en avión de papel") deja
`Articulo = ""`. El compositor usará sólo `Nombre`.

**Objeto especial:** `@Nadie` no pinta nada. Es el valor por defecto de `objetoId` en
triggers y en `RegistrarEvento`.

---

## 5. Modificadores por nivel (`EcosModificadoresNivel`)

Un bloque por nivel. Aquí vive el "tono" de la exageración.

| Campo | Tipo | Para qué | Ejemplo |
| --- | --- | --- | --- |
| `Nivel` | enum | Nivel al que pertenece. | `Adornado` |
| `Prefijos` | string[] | Abre la frase. | `Dicen que`, `Juran que` |
| `Sufijos` | string[] | Cierra la frase. | `y nadie hizo nada` |
| `Adverbios` | string[] | Modifica el verbo. | `sin piedad`, `en plena noche` |
| `ProbabilidadPrefijo` | float 0..1 | Probabilidad de aplicar prefijo. | `0.5` |
| `ProbabilidadColor` | float 0..1 | Probabilidad de añadir color elemental. | `0.3` |
| `MagnitudBaja` | string[] | Adjetivo para intensidad 0..33. | `un poco` |
| `MagnitudMedia` | string[] | Adjetivo para intensidad 34..66. | `con muchas ganas` |
| `MagnitudAlta` | string[] | Adjetivo para intensidad 67..100. | `de forma desmedida` |

**Importante:** la banda de magnitud la elige la **intensidad del hecho**, no el nivel.
Si la banda está vacía, el compositor prueba las otras dos antes de rendirse: así la
exageración nunca se queda en un adjetivo de cola.

---

## 6. Plantillas (`EcosPlantillaFrase`)

La estructura de la frase por `(Nivel, Intención)`.

```
Formato = "{atribucion}{sujeto} {verbo}{objeto}{magnitud}{adverbio}{sufijo}{coletilla}"
```

| Token | Se sustituye por |
| --- | --- |
| `{atribucion}` | "Dicen que", "Juro por…" según intención. |
| `{sujeto}` | Nombre o nombre vago. |
| `{verbo}` | Verbo conjugado. |
| `{objeto}` | Objeto con artículo (o cantidad como objeto). |
| `{prefijo}` | Prefijo del nivel. |
| `{adverbio}` | Adverbio del nivel. |
| `{magnitud}` | Adjetivo de magnitud **o** cantidad aparte (la cantidad tiene prioridad). |
| `{color}` | Color elemental de la categoría. |
| `{sufijo}` | Sufijo del nivel. |
| `{coletilla}` | Cierre según intención. |

Resolución de plantilla:

1. Busca exactamente `(Nivel, Intención)`.
2. Si no existe, usa `(Nivel, Neutral)`.
3. Si tampoco, usa la plantilla por defecto.

**Protección de la cantidad:** si la plantilla del nivel no tiene `{magnitud}` y el eco
trae cantidad, el compositor **inserta** `{magnitud}` justo detrás de `{objeto}`. La
cantidad no se pierde jamás.

### Ejemplo: plantilla de lamento

```csharp
biblioteca.Plantillas.Add(new EcosPlantillaFrase
{
    Nivel = EcosNivelExageracion.Adornado,
    Intencion = EcosIntencion.Lamento,
    Formato = "{atribucion}{sujeto} {verbo}{objeto}{magnitud}, {adverbio}. {coletilla}"
});
```

---

## 7. Atribuciones y coletillas

| Clase | Campo | Para qué |
| --- | --- | --- |
| `EcosAtribucionIntencion` | `Intencion`, `Frases[]` | Apertura según la voz. |
| `EcosColetillaIntencion` | `Intencion`, `Frases[]` | Cierre según la voz. |

Se eligen al azar de forma determinista con la semilla del eco. Si una intención no
tiene frases, el hueco queda vacío (no se inventa nada).

---

## 8. Validación y avisos

El editor de la biblioteca muestra avisos cuando:

- Hay ids duplicados.
- Una acción apunta a una categoría inexistente.
- Faltan niveles en `ModificadoresPorNivel` (se usa un bloque vacío).
- Hay plantillas con tokens desconocidos (se dejan tal cual).

En runtime, las señales de un hueco son:

- `EcosPlanFrase.AccionDesconocida == true` → falta la acción.
- La frase contiene un id crudo (`quemar`, `aldea`) → falta esa entrada.
- `EcosPlanFrase.SujetoAnonimizado == true` → el oyente no conocía al sujeto (no es un
  error, es la regla de nombres vagos).
- El objeto sale como id crudo → falta esa entrada en `Objetos`.

---

## 9. Bilingüe (español + inglés)

El modelo de embeddings es multilingüe: entiende "quemó la aldea" y "burned the
village" como vecinos. La biblioteca, en cambio, es **texto**: necesita dos juegos de
datos con **los mismos ids**.

Patrón recomendado:

1. Duplica el asset: `EcosBiblioteca_ES` y `EcosBiblioteca_EN`.
2. Mantén idénticos `Id`, `Categoria`, `IntencionSugerida`, `Valencia`, `Peso` y toda
   la parte numérica (`CantidadBase`, `CantidadesPorNivel`, `ContenedoresPorNivel`,
   `InstrumentosPorNivel`).
3. Traduce sólo lo visible: `Nombre`, `NombreVago`, `VerboSingular`, `VerboPlural`,
   `UnidadCantidad`, `Prefijos`, `Sufijos`, `Adverbios`, `Plantillas`, atribuciones y
   coletillas.
4. Al arrancar, inyecta la biblioteca del idioma activo en el bootstrap.

```csharp
public EcosBibliotecaAsset bibliotecaEspanol;
public EcosBibliotecaAsset bibliotecaIngles;

void Awake()
{
    bool enIngles = Application.systemLanguage == SystemLanguage.English;
    biblioteca = enIngles ? bibliotecaIngles : bibliotecaEspanol;
}
```

**Unidades:** traduce también `UnidadCantidad` (`metros`/`meters`) y los colectivos
(`un pelotón de`/`a platoon of`). La cifra es la misma; sólo cambia la palabra.

**Ojo con la concordancia:** el inglés no tiene género gramatical, pero el compositor
sigue usando `Genero` para los artículos españoles. Rellena los artículos ingleses
("the", "a") en la biblioteca EN y deja `Genero` como esté: no estorba.

---

## 10. Checklist para una acción nueva

1. `Id` único y estable (sin espacios).
2. `VerboSingular` y `VerboPlural` conjugados (no infinitivos).
3. `Categoria` existente en el registro (o vacía para usar embeddings).
4. `Valencia` y `Peso` si quieres que mueva la ficha del sujeto.
5. Si lleva cifra: `CantidadBase`, `UnidadCantidad` y, si quieres control total,
   `CantidadesPorNivel`.
6. Si la cifra es el paciente: `CantidadComoObjeto = true` + `ContenedoresPorNivel`.
7. Si lleva instrumento: `InstrumentosPorNivel` (5 entradas).
8. `Invalidar()` si editas en runtime.
9. Prueba en `Window ▸ Ecos ▸ Consola de Ecos ▸ Laboratorio de frases`.
"})
