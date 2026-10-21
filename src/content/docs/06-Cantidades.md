# 06 - Cantidades, atenuación e inversión

Este es el corazón del asset: un rumor que **deforma el dato** sin inventar el hecho.
"Eliminó a 10 bandidos con su espada" puede pasar por "2 bandidos" y, si el diseñador
declaró una variante opuesta, acabar en "intentó salvar al rey contra 100 soldados".
La cifra no siempre sube: **también baja**. Y el verbo o el paciente sólo cambian cuando
existe una variante escrita a mano en la biblioteca.

No hay que escribir una tabla de cantidades. Declaras **un dato base** y Ecos calcula
todas las versiones del rumor con una curva automática, determinista y explicable. La
tabla exacta sigue existiendo como override opcional, pero no es el camino normal.

---

## 1. Por qué la cantidad vive en la acción

La cantidad pertenece al **hecho declarado**, no al evento. "Abatir a distancia" siempre
ocurre desde 500 m en tu juego; "diezmar a los bandidos" siempre empieza con 10. Por eso
se declara una vez en `EcosAccion` y el trigger sólo envía el id:

```csharp
EcosSystem.RegistrarEvento("A", "abatir_distancia", "objetivo", 80);
//                                       ^ el dato (500 m) ya está en la acción
```

Ventajas:

- El diseñador declara el hecho una sola vez.
- El `EcoEvento` sigue siendo pequeño e inmutable.
- La curva se puede probar sin escena (`Window ? Ecos ? Consola de Ecos`).

**Limitación:** la misma acción siempre tiene la misma cantidad base. Si necesitas
"robar 10" y "robar 100" con el mismo verbo, declara dos acciones (`robar_10`,
`robar_100`) o crea un compositor propio que lea la cantidad del contexto. La primera
opción es la recomendada: mantiene el dato en datos.

---

## 2. Los campos que importan

| Campo | Tipo | Efecto | Ejemplo |
| --- | --- | --- | --- |
| `CantidadBase` | int | **Único dato obligatorio.** Cifra real del hecho. `0` = la acción no lleva cantidad. | `500` |
| `UnidadCantidad` | string | Qué se cuenta. Vacío = no se muestra la cifra. | `metros` |
| `PreposicionCantidad` | string | Cómo entra en la frase cuando va aparte. | `desde` |
| `CantidadComoObjeto` | bool | La cantidad **es** el objeto directo. | `true` |
| `CantidadEsRecuento` | bool | La cifra es un recuento aunque se diga aparte ("..., con 10 soldados"). | `true` |
| `ContenedoresPorNivel` | string[5] | Colectivo opcional que envuelve la cifra. | `un grupo de` |
| `InstrumentosPorNivel` | string[5] | Instrumento opcional con el que ocurre. | `con su espada` |
| `CantidadesPorNivel` | int[5] | **Override opcional.** Sólo si necesitas cifras exactas. | `{500,700,900,1100,1300}` |
| `AccionInversaId` | string | Variante opuesta declarada para el nivel Distorsionado. | `salvar_rey` |
| `ObjetoInversoId` | string | Objeto que usa la variante inversa. Vacío = conservar el del eco. | `@Rey` |
| `Transitiva` | bool | Si es false, no hay objeto directo. | `true` |

Los arrays, cuando los uses, tienen **5 posiciones** en este orden:

```
[0] Literal  [1] Suavizado  [2] Adornado  [3] Exagerado  [4] Distorsionado
```

Si un array es más corto, las posiciones que faltan se tratan como vacías.

`CantidadEsRecuento` es importante: una cifra puede ser un recuento aunque no sea el
objeto gramatical. "Con 10 soldados" es un recuento; "desde 500 metros" es una medida.
La curva de recuentos es mucho más agresiva que la de medidas. Si
`CantidadComoObjeto = true`, se asume recuento aunque `CantidadEsRecuento` quede en false.

---

## 3. La cifra se calcula sola y no es monótona

`EcosEscaladorCantidades` recibe la acción y el eco, y devuelve una cifra para el nivel
actual. **No necesita que el diseñador escriba los números de cada nivel.**

La dirección se decide así:

| Nivel | Dirección por defecto |
| --- | --- |
| Literal | Neutro: el dato intacto. |
| Suavizado | **Atenuar**: se pierden detalles. |
| Adornado | Exagerar, salvo intención `Lamento` (atenúa). |
| Exagerado | Exagerar, salvo intención `Lamento` (atenúa). |
| Distorsionado | Exagerar, salvo `Lamento`; si la acción declara `AccionInversaId`, **Invertir**. |

La curva base, antes de intensidad, intención, saltos y oyente:

| Nivel | Recuento al atenuar | Recuento al exagerar | Medida al atenuar | Medida al exagerar |
| --- | --- | --- | --- | --- |
| Literal | ×1 | ×1 | ×1 | ×1 |
| Suavizado | ×0,20 | ×1,60 | ×0,80 | ×1,15 |
| Adornado | ×0,12 | ×3,20 | ×0,65 | ×1,50 |
| Exagerado | ×0,07 | ×6,40 | ×0,50 | ×2,20 |
| Distorsionado | ×0,04 | ×10,00 | ×0,35 | ×3,20 |

Después se aplican cuatro matices pequeños:

1. **Intensidad del hecho:** entre ×0,90 y ×1,10 según `EcoEvento.Intensidad`.
2. **Intención del narrador:** alarde +8 %, amenaza +6 %, chisme +4 %, lamento -8 %.
3. **Saltos:** si la dirección es atenuar, resta hasta un 15 %; si es exagerar, suma
   hasta un 15 %. La dirección elegida se refuerza; no se invierte por accidente.
4. **Oyente:** ±8 % determinista si `VariacionPorOyente` está activo. El mismo hecho
   puede sonar a 100 o a 115 soldados; sigue siendo reproducible con la misma semilla.

El resultado se redondea a **cifras que un narrador diría de verdad**: decenas,
cincuentas o centenas, no "1.137 bandidos".

### Ejemplo real: la distancia de la demo

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde"
    // Sin CantidadesPorNivel: la curva automática hace el resto.
}
```

Con `intensidad = 75` e `intencion = Amenaza`, la salida es:

| Nivel | Frase |
| --- | --- |
| Literal | "eliminó al objetivo desde 500 metros" |
| Suavizado | "eliminó al objetivo desde 450 metros" |
| Adornado | "eliminó al objetivo desde 850 metros" |
| Exagerado | "eliminó al objetivo desde 1.200 metros" |
| Distorsionado | "eliminó al objetivo desde 1.800 metros" |

El descenso de 500 a 450 es deliberado: el nivel Suavizado pierde detalle. Después la
cifra recupera y crece. Esa forma —baja y luego sube— es la deformación; una línea recta
siempre creciente era el bug de la versión anterior.

### Ejemplo real: el recuento de la demo

```csharp
new EcosAccion
{
    Id = "diezmar_bandidos",
    VerboSingular = "eliminó a",
    CantidadBase = 10,
    UnidadCantidad = "bandidos",
    CantidadComoObjeto = true,
    ContenedoresPorNivel = new[]
    {
        "un grupo de", "una banda de", "una hueste de", "un ejército de", "un pelotón de"
    }
    // Sin CantidadesPorNivel.
}
```

Con `intensidad = 60` e `intencion = Alarde`, la cifra pasa por **10 → 2 → 35 → 70 → 110**.
El contenedor cambia de "grupo" a "pelotón"; el verbo y el paciente no. La caída a 2 en
Suavizado es información que se pierde, no un error de redondeo.

> **Cero Alucinaciones:** la curva no inventa un hecho nuevo. Transforma el dato que el
> diseñador declaró. La cifra sigue siendo explicable: nivel × dirección × intensidad ×
> intención × oyente.

### ¿Y el modelo de IA?

El modelo semántico (ONNX o el proveedor hash de respaldo) **no escribe la cifra**. En
1.2.0 el proveedor Sentis aporta **embeddings** para mapear acciones a categorías
elementales; no decide el nivel ni la intención. Esas dos etiquetas salen de
`IEcosDegradador` e `IEcosClasificadorIntencion`, con heurísticas deterministas de fábrica
que puedes sustituir por un clasificador BYOM. El escalador convierte las etiquetas en un
número. Esa separación es deliberada:

- el modelo (o el proveedor hash) aporta la lectura semántica;
- los clasificadores aportan nivel e intención;
- el motor aporta la aritmética determinista;
- el diseñador aporta el dato real y, si quiere, la variante inversa.

Así la cifra puede subir o bajar sin que un modelo generativo invente un número que
contradiga el mundo. La inversión tampoco la inventa el modelo: está declarada en la
biblioteca. Si tu modelo BYOM implementa un cabezal de clasificación, enchúfalo con
`EcosRuntimeBuilder.ConDegradador` y `ConClasificadorIntencion`; el compositor y la curva
no cambian (ver [10 — Modelo semántico](10-SemanticaONNX.md#9-cambiar-de-modelo-o-usar-uno-propio)).

---

## 4. Inversión: cuando el relato gira

Una cantidad que baja no explica el ejemplo completo. A veces el rumor no sólo cambia de
magnitud: cambia de **acción**. "Cometió regicidio con 10 soldados" puede convertirse en
"intentó salvar al rey contra 100 soldados". Eso no se genera: se declara.

### 4.1. Declarar el hecho original

```csharp
new EcosAccion
{
    Id = "regicidio",
    VerboSingular = "cometió regicidio",
    VerboPlural = "cometieron regicidio",
    CantidadBase = 10,
    UnidadCantidad = "soldados",
    PreposicionCantidad = "con",
    CantidadEsRecuento = true,
    AccionInversaId = "salvar_rey",   // variante opuesta
    ObjetoInversoId = "@Rey",         // objeto de la variante
    Valencia = -100
}
```

### 4.2. Declarar la variante opuesta

```csharp
new EcosAccion
{
    Id = "salvar_rey",
    VerboSingular = "intentó salvar a",
    VerboPlural = "intentaron salvar a",
    CantidadBase = 100,
    UnidadCantidad = "soldados",
    PreposicionCantidad = "contra",
    CantidadEsRecuento = true,
    Valencia = 80
}
```

La variante es una acción completa: tiene su verbo, su valencia, su cantidad y su
preposición. El motor no improvisa ninguna de esas piezas.

### 4.3. Qué hace el pipeline

En el nivel **Distorsionado**, `EcosReglaDeformacionNarrativa` (prioridad 120) comprueba
si la acción actual declara `AccionInversaId` y si la variante existe. Si existe:

- cambia `AccionId` por el de la variante;
- cambia `ObjetoId` por `ObjetoInversoId` (o conserva el actual si está vacío);
- si el pipeline tiene registro de categorías, cambia `CategoriaId` a la de la variante
  (por ejemplo, de `muerte` a `pacifico`);
- marca `DireccionDeformacion = Invertir`;
- conserva el hecho original en `AccionOriginalId` y `ObjetoOriginalId`.

Con la semilla de ejemplo (4242), la biblioteca de demo y las plantillas por defecto, el
resultado real es:

```
Literal:        "Qué desgracia, Aldric cometió regicidio, con 10 soldados, esta misma mañana."
Suavizado:      "No hay consuelo: creo que Aldric cometió regicidio, con 2 soldados, más o menos, y nadie hizo nada."
Distorsionado:  "Que quede claro: un forastero intentó salvar al rey, contra 100 soldados. Que venga alguien a negarlo."
```

En Distorsionado el sujeto ya pasó por la regla de anonimización (prioridad 50), por eso
puede aparecer como "un forastero". Lo importante es el núcleo: el verbo cambió a la
variante declarada, el objeto es el rey y la cifra es la de la variante (100). Con otra
semilla cambian prefijos y coletillas, no el hecho ni la inversión.

`EcoEvento.EsInversion` es true cuando `AccionId` ya no coincide con
`AccionOriginalId`. La ficha del sujeto, la UI o tu propio gameplay pueden consultar ese
dato para saber que están ante una versión deformada, no ante el hecho original.

### 4.4. Reglas de seguridad

- **Una sola inversión por cadena.** Si `EsInversion` ya es true, la regla no vuelve a
  girar el relato.
- **Sin variante declarada no hay inversión.** El nivel Distorsionado sólo atenúa o
  exagera. La inversión nunca se inventa en runtime.
- **La variante inversa declara su propia cifra.** `CantidadBase = 100` se usa tal cual
  en el momento del giro; no se multiplica otra vez por la curva. Si quieres que la
  variante también se exagere, dale su propio `CantidadesPorNivel` o crea otra variante.
- **El hecho original no se pierde.** `AccionOriginalId` y `ObjetoOriginalId` permiten
  auditar qué ocurrió de verdad y qué versión está contando cada NPC.
- **La contradicción se declara sola.** `EcosRelacionesAcciones` trata
  `AccionInversaId` como antagonista, aunque no repitas la relación en `AntagonistaDe`.
- **Pipeline propio:** si construyes un `EcosPipeline` a mano, añade
  `new EcosReglaDeformacionNarrativa(biblioteca)` después de la degradación. El pipeline
  por defecto ya la incluye.

### 4.5. Qué significa "Cero Alucinaciones" ahora

Antes decíamos "el verbo y el paciente nunca cambian". Con inversión eso ya no es exacto.
La regla correcta es:

> **Ningún modelo escribe texto ni inventa un verbo, un paciente o una cifra. Toda
> variante —incluida la inversa— está declarada en la biblioteca. El hecho original se
> conserva para poder auditar la deformación.**

Eso sigue siendo cero alucinaciones: no hay generación libre. Hay transformación
determinista sobre datos que el diseñador escribió.

---

## 5. Override opcional: cifras exactas

`CantidadesPorNivel` sigue existiendo para casos muy concretos: una distancia que no debe
superar un límite, un recuento histórico que debe ser exacto o una escalera que quieres
controlar al milímetro.

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde",
    CantidadesPorNivel = new[] { 500, 700, 900, 1100, 1300 }
}
```

Si una posición es `0` o el array está vacío, esa posición cae a la curva automática. El
override **no es necesario** para que la deformación funcione; úsalo sólo cuando el dato
tenga que ser exacto por diseño. En una variante inversa, un override explícito también
manda sobre la cifra declarada.

---

## 6. Modo A - cantidad aparte

`CantidadComoObjeto = false` (por defecto).

La cifra se guarda en `EcosPlanFrase.Cantidad` y se inserta en el token `{magnitud}`:

```
PreposicionCantidad + " " + cifra + " " + UnidadCantidad
```

**Qué hace el compositor si la plantilla no tiene `{magnitud}`:** inserta el token justo
detrás de `{objeto}`. Por eso la cifra aparece incluso en plantillas que "omiten
detalles".

**Sin preposición:** deja `PreposicionCantidad = ""` y saldrá "... 500 metros".

---

## 7. Modo B - cantidad como objeto

`CantidadComoObjeto = true`.

La cantidad **sustituye** al objeto del eco. El objeto declarado en el trigger se ignora
(y puede ser `@Nadie`). Se compone así:

```
[ContenedorPorNivel + " "] + cifra + " " + UnidadCantidad
```

**Sin contenedor:** deja `ContenedoresPorNivel` vacío y saldrá "eliminó a 10 bandidos".
Es perfectamente válido; el contenedor sólo añade sabor.

**Concordancia:** el contenedor debe concordar con la unidad. "un grupo de 10 bandidos"
(masculino plural), "una marea de 130 prisioneros" (femenino singular, pero la unidad
manda). El compositor no corrige gramática: escribe lo que declaras.

---

## 8. Instrumento

`InstrumentosPorNivel` se añade **al final del objeto** (o al objeto compuesto):

```
plan.Objeto = plan.Objeto + ", " + instrumento
```

Por eso se ve en **todas** las plantillas: el objeto es el único slot que nunca falta.

```csharp
InstrumentosPorNivel = new[]
{
    "con su espada", "con su espada", "sin ayuda de nadie",
    "con las manos desnudas", "con las manos desnudas"
}
```

Resultado completo de la hazaña:

```
v0: eliminó a un grupo de 10 bandidos, con su espada
v1: eliminó a una banda de 2 bandidos, con su espada
v2: eliminó a una hueste de 35 bandidos, sin ayuda de nadie
v3: eliminó a un ejército de 70 bandidos, con las manos desnudas
v4: eliminó a un pelotón de 110 bandidos, con las manos desnudas
```

La plantilla del nivel puede añadir prefijos, adverbios y coletillas alrededor, pero
esas tres piezas (cifra + colectivo + instrumento) permanecen.

**Sin instrumento:** deja el array vacío. No se añade coma ni hueco.

**Ojo con la coma:** si tu plantilla ya termina el objeto con puntuación, el instrumento
quedará detrás de la coma. Ejemplo: `{objeto}.` + instrumento → "... bandidos., con su
espada". Deja la puntuación en `{sufijo}` o `{coletilla}`, no en `{objeto}`.

---

## 9. Qué ve la UI: `EcosPlanFrase`

Si necesitas pintar la frase por partes (subtítulos, color, traducción), usa
`EcosSystem.Planificar`:

| Campo | Contenido con cantidad aparte | Contenido con cantidad como objeto |
| --- | --- | --- |
| `Objeto` | "el objetivo" | "un pelotón de 110 bandidos, con las manos desnudas" |
| `Cantidad` | "desde 1.800 metros" | `""` (la cifra ya está en `Objeto`) |
| `Verbo` | "eliminó a" | "eliminó a" |
| `Direccion` | `Atenuar`, `Exagerar` o `Invertir` | igual |

`Direccion` permite que la UI explique el rumor ("atenuado", "exagerado", "invertido")
sin recalcular la curva.

---

## 10. Bilingüe

La cifra es un número; no se traduce. Lo que sí se traduce es la unidad, la preposición,
el contenedor y el instrumento:

| Español | Inglés |
| --- | --- |
| `UnidadCantidad = "metros"` | `"meters"` |
| `PreposicionCantidad = "desde"` | `"from"` |
| `Contenedor = "un pelotón de"` | `"a platoon of"` |
| `Instrumento = "con las manos desnudas"` | `"bare-handed"` |

Mantén los mismos ids de acción y los mismos valores base en ambas bibliotecas. La curva
es la misma; sólo cambia el vocabulario.

---

## 11. Problemas frecuentes

| Síntoma | Causa | Arreglo |
| --- | --- | --- |
| No aparece ninguna cifra | `CantidadBase = 0` y `UnidadCantidad` vacío. | Declara al menos `CantidadBase` y `UnidadCantidad`. |
| No aparece la cifra (ni la unidad) | `UnidadCantidad` vacío. | Rellénalo (`metros`, `bandidos`); sin unidad no se muestra la cifra. |
| La cifra no cambia entre niveles | `CantidadComoObjeto` o el nivel no se está actualizando. | Comprueba el nivel en la consola; usa el override sólo si hace falta. |
| La cifra es siempre la misma para todos los NPCs | `VariacionPorOyente` desactivado. | Actívalo si quieres redondeos distintos por oyente. |
| El objeto del trigger no sale | `CantidadComoObjeto = true` lo sustituye. | Es el comportamiento esperado. |
| La cifra baja en Suavizado | La dirección por defecto de ese nivel es atenuar. | Es intencionado; usa `DireccionDeformacion` o un override si no lo quieres. |
| La inversión no ocurre | Falta `AccionInversaId`, la variante no existe o el pipeline es propio. | Declara la variante y añade `EcosReglaDeformacionNarrativa`. |
| La inversión ocurre dos veces | La acción inversa apunta de vuelta al original. | Deja `AccionInversaId` vacío en la variante; `EsInversion` ya bloquea el segundo giro. |

---

## 12. Prueba rápida

1. Abre `Window ? Ecos ? Consola de Ecos`.
2. Emite `abatir_distancia` con intensidad 75.
3. Recorre los cinco niveles.
4. Comprueba que la cifra baja en Suavizado y luego sube.

**Esperado:** 500 → 450 → 850 → 1.200 → 1.800 metros (sin variación por oyente).

Para un recuento, emite `diezmar_bandidos` con intensidad 60: 10 → 2 → 35 → 70 → 110
bandidos. El contenedor y el instrumento cambian, pero el hecho sigue siendo el mismo mientras no se dispare una inversión declarada.

Para la inversión, emite `regicidio` con intención `Lamento` y recorre los niveles hasta
Distorsionado. Si `regicidio` declara `AccionInversaId = "salvar_rey"`, la frase final
será "intentó salvar al rey, contra 100 soldados". Si no lo declara, no habrá inversión.
