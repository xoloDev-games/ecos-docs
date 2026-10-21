# 05 — Library and texts

The library is the system's **dictionary**. It contains no logic: only data that the
composer chooses and concatenates. Everything is edited in `EcosBibliotecaAsset` or, in code, in
`EcosBibliotecaFragmentos`.

> **Zero Hallucinations in one sentence:** if a word is not in the library, the engine
> does not invent it. It shows the raw id (`quemar`, `aldea`) so that you can see the gap.

---

## 1. Creating the library

- **Inspector:** `Assets ▸ Create ▸ Ecos ▸ Biblioteca de Fragmentos`.
- **Full set:** `Assets ▸ Create ▸ Ecos ▸ Conjunto completo de assets` (creates
  config, library and categories at once).
- **Code:** `EcosBibliotecaFragmentos.CrearPorDefecto()` (includes a minimal
  Spanish vocabulary ready to test).

In the asset, each list has its header and its tooltip. In code, the lists are
public: you can add entries and call `Invalidar()` to refresh the indices.

```csharp
var biblioteca = EcosBibliotecaFragmentos.CrearPorDefecto();
biblioteca.Acciones.Add(new EcosAccion { /* ... */ });
biblioteca.Objetos.Add(new EcosObjeto { /* ... */ });
biblioteca.Invalidar();   // rebuilds indexes on the next query
```

---

## 2. Subjects (`EcosSujeto`)

Who stars in the deed.

| Field | Type | Purpose | Example |
| --- | --- | --- | --- |
| `Id` | string | Stable key that travels in the echo. | `@JugadorA`, `@Herrero` |
| `Nombre` | string | Proper name in the sentence. | `Aldric`, `el herrero` |
| `NombreVago` | string | Name when the listener does not know the subject or the echo is anonymized. | `un forastero`, `alguien` |
| `NombreColectivo` | string | Variant for collective subjects. Empty = uses `Nombre`. | `la guardia` |
| `Genero` | enum | Agreement of articles/adjectives. | `Masculino`, `Femenino` |
| `Numero` | enum | Singular/plural; decides `VerboSingular` or `VerboPlural`. | `Singular` |
| `EsJugador` | bool | Players are considered known from the start. | `true` for `@JugadorA` |
| `IdentidadRevelable` | bool | If true, the name is only revealed when the listener knows them. | `true` |

### Example: adding the blacksmith

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

**What to expect:**

- If the listener knows `@Herrero`: *"el herrero quemó la aldea"*.
- If they do not know them and `saltosParaAnonimizar = 0` or the level is `Distorsionado`:
  *"un hombre de manos curtidas quemó la aldea"*.
- If the id does not exist: *"@Herrero quemó la aldea"* (honest fallback).

---

## 3. Actions (`EcosAccion`)

The verb **already conjugated** and the quantitative data of the deed.

| Field | Type | Purpose |
| --- | --- | --- |
| `Id` | string | Key sent by triggers/code (`quemar`). No spaces. |
| `Infinitivo` | string | Text for tooltips/editors (`quemar`, `abatir a distancia`). |
| `VerboSingular` | string | Past tense, 3rd person singular (`quemó`). |
| `VerboPlural` | string | Past tense, 3rd person plural (`quemaron`). |
| `Participio` | string | For future passive constructions (`quemado`). |
| `Transitiva` | bool | If false, the sentence does not take a direct object. |
| `Categoria` | string | Elemental key (`fuego`); empty = resolved by embeddings. |
| `IntencionSugerida` | enum | Intention the narrator tends to use with this action. |
| `ObjetoPorDefecto` | string | Object if the echo does not carry one; empty = `@Nadie`. |
| `SinonimoInfinitivo` | string | Synonym for the semantic mapping (`asesinar` → `matar`). |
| `Valencia` | int -100..100 | Moral value for the subject's sheet. |
| `Peso` | float 0..1 | How much it weighs in reputation. |
| `AntagonistaDe` | string[] | Actions it contradicts when about the same patient. |
| `CantidadBase` | int | Base quantitative data. `0` = no quantity. |
| `UnidadCantidad` | string | `metros`, `bandidos`, `días`. Empty = not shown. |
| `PreposicionCantidad` | string | `desde`, `a`, `contra`. Empty = no preposition. |
| `CantidadEsRecuento` | bool | The figure is a head count even when stated separately (`..., con 10 soldados`). |
| `CantidadesPorNivel` | int[5] | **Optional override**: exact figure per level. Usually left empty and the automatic curve computes the figure. |
| `ContenedoresPorNivel` | string[5] | Optional collective per level (`un grupo de` → `un pelotón de`). |
| `InstrumentosPorNivel` | string[5] | Optional instrument per level (`con su espada` → `con las manos desnudas`). |
| `CantidadComoObjeto` | bool | The quantity replaces the direct object. |
| `AccionInversaId` | string | Declared opposite variant for the Distorted level (`regicidio` → `salvar_rey`). Empty = no inversion. |
| `ObjetoInversoId` | string | Object of the inverse variant. Empty = keep the echo's object. |

The quantity is explained in depth in [06 — Quantities](06-Cantidades.md).

### Example: "poisoning the well"

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

With `objetoId = pozo` and the default template:

| Level | Expected sentence (approximate) |
| --- | --- |
| Literal | "El herrero envenenó el pozo." |
| Smoothed | "Dicen que el herrero envenenó el pozo, más o menos." |
| Adorned | "Juran que el herrero envenenó el pozo en plena noche." |
| Exaggerated | "No me lo creo, pero el herrero envenenó el pozo sin piedad." |
| Distorted | "El herrero envenenó el pozo con ayuda del demonio… y nadie hizo nada." |

The exact words depend on your `Prefijos`, `Sufijos`, `Adverbios` lists and on
the template. This example has no inversion: the verb and the patient are preserved.
If the action declares `AccionInversaId`, the Distorted level can switch to the opposite
variant, always hand-authored in the library.

---

## 4. Objects (`EcosObjeto`)

Patient or direct object, with its agreement.

| Field | Type | Purpose | Example |
| --- | --- | --- | --- |
| `Id` | string | Echo key. | `aldea`, `pozo`, `@Prisioneros` |
| `Nombre` | string | Name without article. | `aldea`, `avión de papel` |
| `Articulo` | string | Definite article. Empty = no article. | `la`, `el`, `los` |
| `Genero` | enum | Agreement. | `Femenino` |
| `Numero` | enum | Singular/plural. | `Singular` |
| `ArticuloIndeterminado` | string | For future templates. | `una`, `un` |

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

**Trick:** for an object without an article ("se transformó en avión de papel") leave
`Articulo = ""`. The composer will use only `Nombre`.

**Special object:** `@Nadie` renders nothing. It is the default value of `objetoId` in
triggers and in `RegistrarEvento`.

---

## 5. Per-level modifiers (`EcosModificadoresNivel`)

One block per level. Here lives the "tone" of the exaggeration.

| Field | Type | Purpose | Example |
| --- | --- | --- | --- |
| `Nivel` | enum | Level it belongs to. | `Adornado` |
| `Prefijos` | string[] | Opens the sentence. | `Dicen que`, `Juran que` |
| `Sufijos` | string[] | Closes the sentence. | `y nadie hizo nada` |
| `Adverbios` | string[] | Modifies the verb. | `sin piedad`, `en plena noche` |
| `ProbabilidadPrefijo` | float 0..1 | Probability of applying a prefix. | `0.5` |
| `ProbabilidadColor` | float 0..1 | Probability of adding elemental color. | `0.3` |
| `MagnitudBaja` | string[] | Adjective for intensity 0..33. | `un poco` |
| `MagnitudMedia` | string[] | Adjective for intensity 34..66. | `con muchas ganas` |
| `MagnitudAlta` | string[] | Adjective for intensity 67..100. | `de forma desmedida` |

**Important:** the magnitude band is chosen by the **intensity of the deed**, not by the level.
If the band is empty, the composer tries the other two before giving up: that way
the exaggeration never gets stuck on a trailing adjective.

---

## 6. Templates (`EcosPlantillaFrase`)

The sentence structure per `(Nivel, Intención)`.

```
Formato = "{atribucion}{sujeto} {verbo}{objeto}{magnitud}{adverbio}{sufijo}{coletilla}"
```

| Token | Replaced by |
| --- | --- |
| `{atribucion}` | "Dicen que", "Juro por…" depending on intention. |
| `{sujeto}` | Name or vague name. |
| `{verbo}` | Conjugated verb. |
| `{objeto}` | Object with article (or quantity as object). |
| `{prefijo}` | Level prefix. |
| `{adverbio}` | Level adverb. |
| `{magnitud}` | Magnitude adjective **or** separate quantity (the quantity takes priority). |
| `{color}` | Elemental color of the category. |
| `{sufijo}` | Level suffix. |
| `{coletilla}` | Closing depending on intention. |

Template resolution:

1. Look for exactly `(Nivel, Intención)`.
2. If it does not exist, use `(Nivel, Neutral)`.
3. If neither exists, use the default template.

**Quantity protection:** if the level's template does not have `{magnitud}` and the echo
carries a quantity, the composer **inserts** `{magnitud}` right after `{objeto}`. The
quantity is never lost.

### Example: lament template

```csharp
biblioteca.Plantillas.Add(new EcosPlantillaFrase
{
    Nivel = EcosNivelExageracion.Adornado,
    Intencion = EcosIntencion.Lamento,
    Formato = "{atribucion}{sujeto} {verbo}{objeto}{magnitud}, {adverbio}. {coletilla}"
});
```

---

## 7. Attributions and tags

| Class | Field | Purpose |
| --- | --- | --- |
| `EcosAtribucionIntencion` | `Intencion`, `Frases[]` | Opening depending on the voice. |
| `EcosColetillaIntencion` | `Intencion`, `Frases[]` | Closing depending on the voice. |

They are chosen at random deterministically with the echo's seed. If an intention has no
phrases, the slot stays empty (nothing is invented).

---

## 8. Validation and warnings

The library editor shows warnings when:

- There are duplicate ids.
- An action points to a non-existent category.
- Levels are missing in `ModificadoresPorNivel` (an empty block is used).
- There are templates with unknown tokens (they are left as they are).

At runtime, the signals of a gap are:

- `EcosPlanFrase.AccionDesconocida == true` → the action is missing.
- The sentence contains a raw id (`quemar`, `aldea`) → that entry is missing.
- `EcosPlanFrase.SujetoAnonimizado == true` → the listener did not know the subject (this is not an
  error, it is the vague-name rule).
- The object comes out as a raw id → that entry is missing in `Objetos`.

---

## 9. Bilingual (Spanish + English)

The embeddings model is multilingual: it understands "quemó la aldea" and "burned the
village" as neighbors. The library, on the other hand, is **text**: it needs two sets of
data with **the same ids**.

Recommended pattern:

1. Duplicate the asset: `EcosBiblioteca_ES` and `EcosBiblioteca_EN`.
2. Keep `Id`, `Categoria`, `IntencionSugerida`, `Valencia`, `Peso` and the whole
   numeric part identical (`CantidadBase`; `CantidadesPorNivel` only if you use the override,
   `ContenedoresPorNivel` and `InstrumentosPorNivel`).
3. Translate only what is visible: `Nombre`, `NombreVago`, `VerboSingular`, `VerboPlural`,
   `UnidadCantidad`, `Prefijos`, `Sufijos`, `Adverbios`, `Plantillas`, attributions and
   tags.
4. At startup, inject the library of the active language in the bootstrap.

```csharp
public EcosBibliotecaAsset bibliotecaEspanol;
public EcosBibliotecaAsset bibliotecaIngles;

void Awake()
{
    bool enIngles = Application.systemLanguage == SystemLanguage.English;
    biblioteca = enIngles ? bibliotecaIngles : bibliotecaEspanol;
}
```

**Units:** also translate `UnidadCantidad` (`metros`/`meters`) and the collectives
(`un pelotón de`/`a platoon of`). The figure is the same; only the word changes.

**Mind the agreement:** English has no grammatical gender, but the composer
still uses `Genero` for Spanish articles. Fill in the English articles
("the", "a") in the EN library and leave `Genero` as it is: it does not get in the way.

---

## 10. Checklist for a new action

1. Unique and stable `Id` (no spaces).
2. `VerboSingular` and `VerboPlural` conjugated (not infinitives).
3. `Categoria` existing in the registry (or empty to use embeddings).
4. `Valencia` and `Peso` if you want it to move the subject's sheet.
5. If it carries a figure: `CantidadBase` and `UnidadCantidad`. The automatic curve does the rest;
   `CantidadesPorNivel` only if you need exact figures per level.
6. If the figure is the patient: `CantidadComoObjeto = true` and, optionally,
   `ContenedoresPorNivel`.
7. If it carries an instrument: `InstrumentosPorNivel` (5 entries).
8. `Invalidar()` if you edit at runtime.
9. Test in `Window ▸ Ecos ▸ Consola de Ecos ▸ Laboratorio de frases`.
