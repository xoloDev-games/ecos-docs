# 09 — NPCs y perfiles

Un NPC es, para Ecos, **un perfil + una memoria + una suscripción a un canal**. El
componente `EcosMemoriaNpc` une las tres cosas; el asset `EcosPerfilNpcAsset` define la
personalidad.

---

## 1. `EcosPerfilNpcAsset` (Inspector)

Crea uno con `Assets ▸ Create ▸ Ecos ▸ Perfil de NPC`. Varios NPCs pueden compartirlo
("aldeano común", "guardia", "chismoso del mercado").

| Campo | Rango | Efecto | Valores típicos |
| --- | --- | --- | --- |
| `id` | string | Id estable. Vacío = nombre del GameObject. | `Herrero` |
| `nombre` | string | Nombre visible en frases/logs. | `el herrero` |
| `locuacidad` | 0..1 | Probabilidad de repetir + distorsión. | `0,8` cotilla / `0,2` muro |
| `credulidad` | 0..1 | Cuánto se cree lo que le cuentan. | `0,9` crédulo / `0,3` escéptico |
| `memoria` | 0..1 | Retención; alarga la vida del eco. | `0,8` cronista / `0,2` despistado |
| `autoridad` | 0..1 | Proyecta credibilidad y degrada menos. | `0,9` capitán / `0,2` don nadie |
| `sesgoExageracion` | -1..1 | >0 exagera, <0 minimiza. | `0,7` fanfarrón / `-0,5` prudente |
| `sesgoIntencion` | -1..1 | -1 lamenta, +1 amenaza. | `0,6` matón / `-0,6` plañidera |
| `sesgoVelocidad` | -1..1 | >0 adelanta el salto, <0 lo retrasa. | `0,5` urgente / `-0,5` lento |
| `sesgoElemental` | string | Categoría que le obsesiona. | `fuego` |
| `radioEscucha` | 0..200 | Distancia máxima para oír. `0` = sin límite. | `8` en una aldea |
| `capacidadMemoria` | 1..256 | Ecos que retiene. | `24` aldeano / `128` cronista |
| `conocidos` | List\<string\> | Sujetos que conoce de primera mano. | `@JugadorA`, `@Alcalde` |

### Cómo se traduce a comportamiento

- **Contagio:** `locuacidad`, `credulidad` y `autoridad` entran en la fórmula de
  probabilidad ([04](04-Configuracion.md)). Un NPC con `locuacidad = 0` **nunca**
  repropaga (aunque reciba).
- **Distorsión:** `locuacidad` y `sesgoExageracion` suman presión; `autoridad` y
  `memoria` restan.
- **Intención:** `sesgoIntencion` empuja el clasificador hacia `Lamento` o `Amenaza`.
- **Velocidad:** `sesgoVelocidad` mueve el retardo del siguiente salto. Se ignora con
  `intervaloDeformacion > 0`.
- **Anonimización:** si el oyente no tiene al sujeto en `conocidos`, se usa
  `NombreVago` (a partir de `saltosParaAnonimizar`).

---

## 2. Perfiles de ejemplo

### Aldeano común

```csharp
id = "Aldeano";
nombre = "un aldeano";
locuacidad = 0.55f;
credulidad = 0.7f;
memoria = 0.4f;
autoridad = 0.3f;
sesgoExageracion = 0.1f;
sesgoIntencion = 0f;
sesgoVelocidad = 0f;
capacidadMemoria = 16;
```

**Esperado:** repite a menudo, se cree casi todo, olvida pronto. El rumor se deforma
por acumulación, no por malicia.

### Tabernero cotilla

```csharp
id = "Tabernero";
nombre = "el tabernero";
locuacidad = 0.95f;
credulidad = 0.8f;
memoria = 0.7f;
autoridad = 0.4f;
sesgoExageracion = 0.6f;
sesgoIntencion = 0.2f;
sesgoVelocidad = 0.4f;
capacidadMemoria = 48;
```

**Esperado:** la cadena se acelera y sube de nivel antes. Es el "amplificador" del
pueblo.

### Capitán de la guardia

```csharp
id = "Capitan";
nombre = "el capitán";
locuacidad = 0.5f;
credulidad = 0.35f;
memoria = 0.9f;
autoridad = 0.95f;
sesgoExageracion = -0.4f;
sesgoIntencion = 0.5f;
sesgoVelocidad = -0.2f;
sesgoElemental = "orden";
capacidadMemoria = 96;
```

**Esperado:** habla poco, exige pruebas, recuerda mucho y **degrada menos**. Si repite,
la versión es más fiable (aunque más amenazante).

### Fuente (jugador / mundo)

Para un jugador no necesitas un perfil de NPC: `EcosPerfilNpc.CrearFuente("@JugadorA")`
crea uno neutro con autoridad 0,6. El bootstrap lo hace solo si
`autoRegistrarPerfilesFuente = true`.

---

## 3. `EcosMemoriaNpc` (componente)

| Campo | Para qué |
| --- | --- |
| `perfil` | Asset de personalidad. Si es null, usa el nombre del GameObject. |
| `scope` | Canal en el que participa. |
| `participarEnDifusion` | Si true, se registra en el censo y repropaga. |
| `maximoRecuerdos` | Tamaño de la memoria local. |
| `onEcoEscuchado` | Frase compuesta con su perfil. |
| `onRecuerdoRelevante` | El recuerdo de mayor peso (intensidad × confianza). |
| `logEcos` | Log de cada eco. |

### Ciclo de vida

```
OnEnable  -> construye perfil, registra NPC, se suscribe al canal
RecibirEco -> guarda en memoria + evento
OnDisable -> se desuscribe y se desregistra
```

### API útil

```csharp
memoria.Contar(0);                    // el más reciente
memoria.ContarLoMasRelevante();       // el de mayor peso
memoria.TryRecuerdoMasRelevante(out eco);
memoria.OlvidarTodo();
memoria.DispararRecuerdoRelevante();  // invoca onRecuerdoRelevante
```

`Contar()` usa `EcosSystem.Narrar(eco, Perfil)`: la frase se compone **con la personalidad
de ese NPC**, no con la del jugador.

---

## 4. Conocidos y nombres vagos

`Conocidos` es lo que separa "el herrero" de "un forastero".

```csharp
perfil.conocidos.Add("@JugadorA");
perfil.conocidos.Add("@Alcalde");
```

- Si el sujeto está en `Conocidos`, el compositor usa `Nombre`.
- Si no, y el eco ya pasó `saltosParaAnonimizar`, usa `NombreVago`.
- Los sujetos con `EsJugador = true` se consideran conocidos por definición.

**Qué esperar:** el mismo eco puede ser "Aldric quemó la aldea" para el herrero y
"un forastero quemó la aldea" para un viajero. Es la misma cadena, contada por dos
oyentes.

---

## 5. Radio de escucha

`radioEscucha > 0` limita la propagación por distancia. El propagador calcula la
distancia emisor-receptor y el filtro devuelve probabilidad 0 si está fuera.

**Uso típico:** NPCs de una aldea con `radioEscucha = 8`; el rumor no salta a la aldea
vecina sin un puente o un NPC "mensajero" con radio 0.

**Ojo:** la distancia se mide en unidades de mundo. Si tu escena usa una escala rara,
ajusta el radio o deja 0 (sin límite).

---

## 6. Registrar NPCs por código

Con componente:

```csharp
var memoria = go.AddComponent<EcosMemoriaNpc>();
memoria.perfil = perfilAsset;
memoria.scope = new EcosScopeReferencia { modo = EcosScopeModo.JugadorLocal };
```

Sin componente (servidor, tests):

```csharp
var perfil = new EcosPerfilNpc
{
    Id = "Herrero",
    Nombre = "el herrero",
    Scope = EcosScope.Jugador("A"),
    Locuacidad = 0.8f,
    Credulidad = 0.6f,
    Autoridad = 0.4f
};

perfil.Conocidos.Add("@JugadorA");
EcosSystem.RegistrarNpc(perfil);
```

Para desregistrar:

```csharp
EcosSystem.DesregistrarNpc("Herrero");
```

> `DesregistrarNpc` no crea un runtime si no existe: es seguro llamarlo al salir de
> Play o al destruir NPCs.

---

## 7. Identidad de escena (`EcosIdentidad`)

Si no quieres escribir ids en cada emisor, añade `Ecos ▸ Marcadores ▸ Identidad de Eco`
al NPC o al lugar:

| Campo | Para qué |
| --- | --- |
| `sujetoId` | Id del sujeto (`@Herrero`). Vacío = nombre del GameObject. |
| `scopeModo` | Global, JugadorLocal, JugadorPorId, Faccion, Lugar, Grupo, Sistema. |
| `scopeId` | Id del canal cuando el modo no es Global/JugadorLocal. |

`EcosScopeReferencia` hereda el canal y el id de esta identidad si el componente no los
especifica. Es la forma de que un trigger arrastrado a la escena "funcione solo".

---

## 8. Patrones de diseño

### Reparto de rasgos

- **Pueblo:** locuacidad media-alta, credulidad alta, autoridad baja.
- **Guardia:** locuacidad baja, credulidad baja, autoridad alta.
- **Nobleza:** locuacidad media, credulidad media, autoridad muy alta.
- **Forastero:** locuacidad baja, credulidad media, radioEscucha alto (viaja).

### Arcos narrativos

- Un NPC con `sesgoExageracion` alto puede **subir un nivel él solo**: úsalo para
  crear el "mentiroso del pueblo".
- Un NPC con `autoridad` alta **frena** la degradación: úsalo para un capitán que
  conserva la versión oficial.
- Un NPC con `memoria` baja **pierde** el eco: úsalo para que un rumor desaparezca sin
  necesidad de borrarlo.

### Qué NO hacer

- No pongas `locuacidad = 0` y esperes que el NPC "reciba pero no cuente": es
  exactamente lo que hace (no repropaga).
- No uses `radioEscucha` para aislar canales: para eso está `EcosScope`.
- No compartas un perfil mutable entre NPCs si cambias sus `Conocidos` en runtime: el
  asset cachea el perfil. Crea una instancia por NPC (`ConstruirPerfil`) o usa el
  componente, que ya lo hace.

---

## 9. Qué esperar al ajustar

| Cambio | Efecto observable |
| --- | --- |
| `locuacidad` 0,5 → 0,9 | Más contagios; la cadena avanza antes y se ramifica más. |
| `credulidad` 0,5 → 0,9 | Acepta versiones más exageradas; sube la confianza efectiva. |
| `autoridad` 0,5 → 0,9 | La versión que repite se degrada menos y se cree más. |
| `memoria` 0,5 → 0,9 | Recuerda durante más tiempo; el eco tarda más en morir. |
| `sesgoExageracion` 0 → 0,8 | Puede subir un nivel por sí solo (fanfarrón). |
| `sesgoIntencion` 0 → 0,8 | Las frases viran a Amenaza; no cambia el hecho. |
| `radioEscucha` 0 → 8 | El rumor deja de cruzar de una zona a otra. |
| `capacidadMemoria` 24 → 128 | Retiene más hechos; útil para crónicas y reputación. |
| `conocidos` + `@JugadorA` | El nombre propio aparece en sus frases. |
