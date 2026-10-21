# 06 - Quantities, attenuation and inversion

This is the heart of the asset: a rumor that **warps the data** without inventing the fact.
"He killed 10 bandits with his sword" can pass through "2 bandits" and, if the designer
declared an opposite variant, end up as "he tried to save the king against 100 soldiers".
The figure does not always rise: **it also falls**. And the verb or the patient only
change when a hand-authored variant exists in the library.

You do not have to write a table of quantities. You declare **a base value** and Ecos
computes every version of the rumor with an automatic, deterministic and explainable
curve. The exact table still exists as an optional override, but it is not the normal
path.

---

## 1. Why the quantity lives in the action

The quantity belongs to the **declared fact**, not to the event. "Ranged kill" always
happens from 500 m in your game; "decimate the bandits" always starts at 10. That is why
it is declared once in `EcosAccion` and the trigger only sends the id:

```csharp
EcosSystem.RegistrarEvento("A", "abatir_distancia", "objetivo", 80);
//                                       ^ the data (500 m) is already in the action
```

Advantages:

- The designer declares the fact only once.
- The `EcoEvento` stays small and immutable.
- The curve can be tested without a scene (`Window ? Ecos ? Consola de Ecos`).

**Limitation:** the same action always has the same base quantity. If you need
"steal 10" and "steal 100" with the same verb, declare two actions (`robar_10`,
`robar_100`) or create your own composer that reads the quantity from the context. The
first option is the recommended one: it keeps the value in data.

---

## 2. The fields that matter

| Field | Type | Effect | Example |
| --- | --- | --- | --- |
| `CantidadBase` | int | **The only mandatory value.** Real figure of the fact. `0` = the action carries no quantity. | `500` |
| `UnidadCantidad` | string | What is counted. Empty = the figure is not shown. | `metros` |
| `PreposicionCantidad` | string | How it enters the sentence when it stands apart. | `desde` |
| `CantidadComoObjeto` | bool | The quantity **is** the direct object. | `true` |
| `CantidadEsRecuento` | bool | The figure is a head count even when stated separately ("..., with 10 soldiers"). | `true` |
| `ContenedoresPorNivel` | string[5] | Optional collective that wraps the figure. | `un grupo de` |
| `InstrumentosPorNivel` | string[5] | Optional instrument with which it happens. | `con su espada` |
| `CantidadesPorNivel` | int[5] | **Optional override.** Only if you need exact figures. | `{500,700,900,1100,1300}` |
| `AccionInversaId` | string | Declared opposite variant for the Distorted level. | `salvar_rey` |
| `ObjetoInversoId` | string | Object used by the inverse variant. Empty = keep the echo's object. | `@Rey` |
| `Transitiva` | bool | If false, there is no direct object. | `true` |

Arrays, when you use them, have **5 positions** in this order:

```
[0] Literal  [1] Smoothed  [2] Adorned  [3] Exaggerated  [4] Distorted
```

If an array is shorter, the missing positions are treated as empty.

`CantidadEsRecuento` matters: a figure can be a head count even when it is not the
grammatical object. "With 10 soldiers" is a head count; "from 500 meters" is a
measurement. The head-count curve is much more aggressive than the measurement curve.
If `CantidadComoObjeto = true`, a head count is assumed even when `CantidadEsRecuento`
is false.

---

## 3. The figure computes itself and is not monotonic

`EcosEscaladorCantidades` receives the action and the echo, and returns a figure for the
current level. **It does not require the designer to write the numbers for each level.**

The direction is chosen like this:

| Level | Default direction |
| --- | --- |
| Literal | Neutral: the untouched value. |
| Smoothed | **Attenuate**: details are lost. |
| Adorned | Exaggerate, except `Lamento` intention (attenuate). |
| Exaggerated | Exaggerate, except `Lamento` intention (attenuate). |
| Distorted | Exaggerate, except `Lamento`; if the action declares `AccionInversaId`, **Invert**. |

The base curve, before intensity, intention, hops and listener:

| Level | Head count, attenuate | Head count, exaggerate | Measurement, attenuate | Measurement, exaggerate |
| --- | --- | --- | --- | --- |
| Literal | ×1 | ×1 | ×1 | ×1 |
| Smoothed | ×0.20 | ×1.60 | ×0.80 | ×1.15 |
| Adorned | ×0.12 | ×3.20 | ×0.65 | ×1.50 |
| Exaggerated | ×0.07 | ×6.40 | ×0.50 | ×2.20 |
| Distorted | ×0.04 | ×10.00 | ×0.35 | ×3.20 |

Four small nuances are then applied:

1. **Intensity of the fact:** between ×0.90 and ×1.10 depending on `EcoEvento.Intensidad`.
2. **Narrator's intention:** boast +8 %, threat +6 %, gossip +4 %, lament -8 %.
3. **Hops:** if the direction is attenuate, subtract up to 15 %; if it is exaggerate,
   add up to 15 %. The chosen direction is reinforced; it does not flip by accident.
4. **Listener:** ±8 % deterministic if `VariacionPorOyente` is active. The same fact
   can sound like 100 or 115 soldiers; it remains reproducible with the same seed.

The result is rounded to **figures a narrator would actually say**: tens, fifties or
hundreds, not "1,137 bandits".

### Real example: the demo's distance

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde"
    // No CantidadesPorNivel: the automatic curve does the rest.
}
```

With `intensidad = 75` and `intencion = Amenaza`, the output is:

| Level | Sentence |
| --- | --- |
| Literal | "eliminó al objetivo desde 500 metros" |
| Smoothed | "eliminó al objetivo desde 450 metros" |
| Adorned | "eliminó al objetivo desde 850 metros" |
| Exaggerated | "eliminó al objetivo desde 1.200 metros" |
| Distorted | "eliminó al objetivo desde 1.800 metros" |

The drop from 500 to 450 is deliberate: the Smoothed level loses detail. Then the figure
recovers and grows. That shape —down and then up— is the deformation; a straight,
always-increasing line was the bug in the previous version.

### Real example: the demo's head count

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
    // No CantidadesPorNivel.
}
```

With `intensidad = 60` and `intencion = Alarde`, the figure goes through
**10 → 2 → 35 → 70 → 110**. The container changes from "grupo" to "pelotón"; the verb and
the patient do not. The drop to 2 at Smoothed is information being lost, not a rounding
bug.

> **Zero Hallucinations:** the curve does not invent a new fact. It transforms the value
> the designer declared. The figure remains explainable: level × direction × intensity ×
> intention × listener.

### What about the AI model?

The semantic model (ONNX or the fallback hash provider) **does not write the figure**. In
1.2.0 the Sentis provider supplies **embeddings** to map actions to elemental categories;
it does not decide the level or the intention. Those two labels come from
`IEcosDegradador` and `IEcosClasificadorIntencion`, with deterministic factory heuristics
that you can replace with a BYOM classifier. The scaler turns the labels into a number.
That separation is deliberate:

- the model (or the hash provider) provides the semantic reading;
- the classifiers provide level and intention;
- the engine provides the deterministic arithmetic;
- the designer provides the real value and, if desired, the inverse variant.

That way the figure can rise or fall without a generative model inventing a number that
contradicts the world. The inversion is not invented by the model either: it is declared
in the library. If your BYOM model implements a classification head, plug it in with
`EcosRuntimeBuilder.ConDegradador` and `ConClasificadorIntencion`; the composer and the
curve do not change (see [10 — Semantic model](10-SemanticaONNX.md#9-changing-the-model-or-using-your-own)).

---

## 4. Inversion: when the story turns

A falling quantity does not explain the full example. Sometimes the rumor does not only
change magnitude: it changes **action**. "He committed regicide with 10 soldiers" can
become "he tried to save the king against 100 soldiers". That is not generated: it is
declared.

### 4.1. Declare the original fact

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
    AccionInversaId = "salvar_rey",   // opposite variant
    ObjetoInversoId = "@Rey",         // object of the variant
    Valencia = -100
}
```

### 4.2. Declare the opposite variant

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

The variant is a complete action: it has its verb, its valence, its quantity and its
preposition. The engine does not improvise any of those pieces.

### 4.3. What the pipeline does

At the **Distorted** level, `EcosReglaDeformacionNarrativa` (priority 120) checks whether
the current action declares `AccionInversaId` and whether the variant exists. If it does:

- it replaces `AccionId` with the variant's id;
- it replaces `ObjetoId` with `ObjetoInversoId` (or keeps the current one if empty);
- if the pipeline has a category registry, it replaces `CategoriaId` with the variant's
  category (for example, from `muerte` to `pacifico`);
- it sets `DireccionDeformacion = Invertir`;
- it preserves the original fact in `AccionOriginalId` and `ObjetoOriginalId`.

With the example seed (4242), the demo library and the default templates, the real output
is:

```
Literal:        "Qué desgracia, Aldric cometió regicidio, con 10 soldados, esta misma mañana."
Smoothed:       "No hay consuelo: creo que Aldric cometió regicidio, con 2 soldados, más o menos, y nadie hizo nada."
Distorted:      "Que quede claro: un forastero intentó salvar al rey, contra 100 soldados. Que venga alguien a negarlo."
```

At Distorted the subject has already gone through the anonymization rule (priority 50),
which is why it can appear as "un forastero". What matters is the core: the verb changed to
the declared variant, the object is the king and the figure is the variant's own (100).
Another seed changes prefixes and tag lines, not the fact or the inversion.

`EcoEvento.EsInversion` is true when `AccionId` no longer matches `AccionOriginalId`.
The subject dossier, the UI or your own gameplay can read that flag to know they are
looking at a deformed version, not at the original fact.

### 4.4. Safety rules

- **One inversion per chain.** If `EsInversion` is already true, the rule does not turn
  the story again.
- **No declared variant, no inversion.** The Distorted level only attenuates or
  exaggerates. Inversion is never invented at runtime.
- **The inverse variant declares its own figure.** `CantidadBase = 100` is used as-is at
  the moment of the turn; it is not multiplied by the curve again. If you want the
  variant to be exaggerated too, give it its own `CantidadesPorNivel` or declare another
  variant.
- **The original fact is not lost.** `AccionOriginalId` and `ObjetoOriginalId` let you
  audit what really happened and which version each NPC is telling.
- **Contradiction is declared automatically.** `EcosRelacionesAcciones` treats
  `AccionInversaId` as an antagonist even if you do not repeat the relation in
  `AntagonistaDe`.
- **Custom pipeline:** if you build an `EcosPipeline` by hand, add
  `new EcosReglaDeformacionNarrativa(biblioteca)` after degradation. The default pipeline
  already includes it.

### 4.5. What "Zero Hallucinations" means now

We used to say "the verb and the patient never change". With inversion that is no longer
exact. The correct rule is:

> **No model writes text or invents a verb, a patient or a figure. Every variant —
> including the inverse one— is declared in the library. The original fact is preserved
> so the deformation can be audited.**

That is still zero hallucinations: there is no free generation. There is deterministic
transformation over data the designer wrote.

---

## 5. Optional override: exact figures

`CantidadesPorNivel` still exists for very specific cases: a distance that must not exceed
a limit, a historical count that must be exact, or a ladder you want to control down to
the millimeter.

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

If a position is `0` or the array is empty, that position falls back to the automatic
curve. The override **is not required** for deformation to work; use it only when the
value must be exact by design. In an inverse variant, an explicit override also wins over
the declared figure.

---

## 6. Mode A - quantity set apart

`CantidadComoObjeto = false` (default).

The figure is stored in `EcosPlanFrase.Cantidad` and inserted into the `{magnitud}` token:

```
PreposicionCantidad + " " + figure + " " + UnidadCantidad
```

**What the composer does if the template has no `{magnitud}`:** it inserts the token right
after `{objeto}`. That is why the figure appears even in templates that "omit details".

**No preposition:** leave `PreposicionCantidad = ""` and it will read "... 500 meters".

---

## 7. Mode B - quantity as object

`CantidadComoObjeto = true`.

The quantity **replaces** the echo's object. The object declared in the trigger is ignored
(and may be `@Nadie`). It is composed like this:

```
[ContenedorPorNivel + " "] + figure + " " + UnidadCantidad
```

**No container:** leave `ContenedoresPorNivel` empty and it will read "eliminó a 10
bandidos". That is perfectly valid; the container only adds flavor.

**Agreement:** the container must agree with the unit. "un grupo de 10 bandidos"
(masculine plural), "una marea de 130 prisioneros" (feminine singular, but the unit
rules). The composer does not fix grammar: it writes what you declare.

---

## 8. Instrument

`InstrumentosPorNivel` is appended **to the end of the object** (or the composed object):

```
plan.Objeto = plan.Objeto + ", " + instrumento
```

That is why it appears in **all** templates: the object is the only slot that is never
missing.

```csharp
InstrumentosPorNivel = new[]
{
    "con su espada", "con su espada", "sin ayuda de nadie",
    "con las manos desnudas", "con las manos desnudas"
}
```

Full result of the feat:

```
v0: eliminó a un grupo de 10 bandidos, con su espada
v1: eliminó a una banda de 2 bandidos, con su espada
v2: eliminó a una hueste de 35 bandidos, sin ayuda de nadie
v3: eliminó a un ejército de 70 bandidos, con las manos desnudas
v4: eliminó a un pelotón de 110 bandidos, con las manos desnudas
```

The level template can add prefixes, adverbs and closings around it, but those three
pieces (figure + collective + instrument) remain.

**No instrument:** leave the array empty. No comma or gap is added.

**Watch the comma:** if your template already ends the object with punctuation, the
instrument will sit behind the comma. Example: `{objeto}.` + instrument →
"... bandidos., con su espada". Leave punctuation in `{sufijo}` or `{coletilla}`, not in
`{objeto}`.

---

## 9. What the UI sees: `EcosPlanFrase`

If you need to paint the sentence in parts (subtitles, color, translation), use
`EcosSystem.Planificar`:

| Field | Content with quantity set apart | Content with quantity as object |
| --- | --- | --- |
| `Objeto` | "el objetivo" | "un pelotón de 110 bandidos, con las manos desnudas" |
| `Cantidad` | "desde 1.800 metros" | `""` (the figure is already in `Objeto`) |
| `Verbo` | "eliminó a" | "eliminó a" |
| `Direccion` | `Atenuar`, `Exagerar` or `Invertir` | same |

`Direccion` lets the UI explain the rumor ("attenuated", "exaggerated", "inverted")
without recalculating the curve.

---

## 10. Bilingual

The figure is a number; it is not translated. What is translated is the unit, the
preposition, the container and the instrument:

| Spanish | English |
| --- | --- |
| `UnidadCantidad = "metros"` | `"meters"` |
| `PreposicionCantidad = "desde"` | `"from"` |
| `Contenedor = "un pelotón de"` | `"a platoon of"` |
| `Instrumento = "con las manos desnudas"` | `"bare-handed"` |

Keep the same action ids and the same base values in both libraries. The curve is the
same; only the vocabulary changes.

---

## 11. Common problems

| Symptom | Cause | Fix |
| --- | --- | --- |
| No figure appears | `CantidadBase = 0` and `UnidadCantidad` empty. | Declare at least `CantidadBase` and `UnidadCantidad`. |
| The figure (and unit) do not appear | `UnidadCantidad` empty. | Fill it (`metros`, `bandidos`); without a unit the figure is not shown. |
| The figure does not change between levels | `CantidadComoObjeto` or the level is not being updated. | Check the level in the console; use the override only if needed. |
| The figure is always the same for every NPC | `VariacionPorOyente` disabled. | Enable it if you want different roundings per listener. |
| The trigger's object does not appear | `CantidadComoObjeto = true` replaces it. | That is the expected behavior. |
| The figure drops at Smoothed | The default direction for that level is attenuate. | It is intentional; use `DireccionDeformacion` or an override if you do not want it. |
| Inversion does not happen | Missing `AccionInversaId`, the variant does not exist, or you use a custom pipeline. | Declare the variant and add `EcosReglaDeformacionNarrativa`. |
| Inversion happens twice | The inverse action points back to the original. | Leave `AccionInversaId` empty on the variant; `EsInversion` already blocks the second turn. |

---

## 12. Quick test

1. Open `Window ? Ecos ? Consola de Ecos`.
2. Emit `abatir_distancia` with intensity 75.
3. Walk through the five levels.
4. Check that the figure drops at Smoothed and then rises.

**Expected:** 500 → 450 → 850 → 1,200 → 1,800 meters (without listener variation).

For a head count, emit `diezmar_bandidos` with intensity 60:
10 → 2 → 35 → 70 → 110 bandits. The container and the instrument change, but the fact
remains the same unless a declared inversion fires.

For inversion, emit `regicidio` with `Lamento` intention and walk the levels up to
Distorted. If `regicidio` declares `AccionInversaId = "salvar_rey"`, the final sentence
will be "intentó salvar al rey, contra 100 soldados". If it does not, there is no
inversion.
