# 06 — Quantities and head counts

This is the heart of the asset: a rumor that **warps the data** without inventing the fact.
"He killed 10 bandits with his sword" can end up as "he killed a platoon of ~1,100
bandits bare-handed". The verb and the patient do not change; the figure, the collective
noun and the instrument do.

You do not have to write a table of quantities. You declare **a base value** and Ecos
computes every version of the rumor with an automatic, deterministic and explainable
curve.

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
- The curve can be tested without a scene (`Window ▸ Ecos ▸ Consola de Ecos`).

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
| `ContenedoresPorNivel` | string[5] | Optional collective that wraps the figure. | `un grupo de` |
| `InstrumentosPorNivel` | string[5] | Optional instrument with which it happens. | `con su espada` |
| `CantidadesPorNivel` | int[5] | **Optional override.** Only if you need exact figures. | `{500,700,900,1100,1300}` |
| `Transitiva` | bool | If false, there is no direct object. | `true` |

Arrays, when you use them, have **5 positions** in this order:

```
[0] Literal  [1] Suavizado  [2] Adornado  [3] Exagerado  [4] Distorsionado
```

If an array is shorter, the missing positions are treated as empty.

---

## 3. The figure computes itself

`EcosEscaladorCantidades` is responsible for it. It receives the action and the echo, and
returns a figure for the current level. **It does not require the designer to write the
numbers for each level.**

The base curve depends on the type of value:

| Level | Head count (`CantidadComoObjeto = true`) | Measurement (`CantidadComoObjeto = false`) |
| --- | --- | --- |
| Literal | ×1 | ×1 |
| Smoothed | ×2.5 | ×1.35 |
| Adorned | ×8 | ×1.8 |
| Exaggerated | ×30 | ×2.5 |
| Distorted | ×100 | ×3.6 |

Four small nuances are then applied:

1. **Intensity of the fact:** between ×0.90 and ×1.10 depending on `EcoEvento.Intensidad`.
2. **Narrator's intention:** boast +8 %, threat +6 %, gossip +4 %, lament −8 %.
3. **Hops:** +1 % per additional mouth.
4. **Listener:** ±8 % deterministic if `VariacionPorOyente` is active. The same fact
   can sound like 980 or 1,030 bandits; it remains reproducible with the same seed.

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
| Smoothed | "eliminó al objetivo desde 750 metros" |
| Adorned | "eliminó al objetivo desde 1.000 metros" |
| Exaggerated | "eliminó al objetivo desde 1.400 metros" |
| Distorted | "eliminó al objetivo desde 2.000 metros" |

The distance grows aggressively but believably. If your game needs a different limit,
use the override from section 4.

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

With `intensidad = 60` and `intencion = Alarde`, the figure goes through 10 → 30 → 90 →
350 → 1,100. The container changes from "grupo" to "pelotón"; the verb and the patient do
not.

> **Zero Hallucinations:** the curve does not invent a new fact. It transforms the value
> the designer declared. The figure remains explainable: level × intensity × intention ×
> listener.

### What about the AI model?

The semantic model (ONNX or the fallback hash provider) **does not write the figure**. The
model classifies the exaggeration level and the intention; the scaler turns those labels
into a number. That separation is deliberate:

- the model provides the semantic reading;
- the engine provides the deterministic arithmetic;
- the designer provides the real value.

That way the figure can be as exaggerated as needed without a generative model inventing
a number that contradicts the world.

---

## 4. Optional override: exact figures

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
curve. The override **is not required** for exaggeration to work; use it only when the
value must be exact by design.

---

## 5. Mode A — quantity set apart

`CantidadComoObjeto = false` (the default).

The figure is stored in `EcosPlanFrase.Cantidad` and inserted into the `{magnitud}` token:

```
PreposicionCantidad + " " + cifra + " " + UnidadCantidad
```

**What the composer does if the template has no `{magnitud}`:** it inserts the token
immediately after `{objeto}`. That is why the figure appears even in templates that "omit
details".

**Without a preposition:** leave `PreposicionCantidad = ""` and you will get "... 500
metros".

---

## 6. Mode B — quantity as object

`CantidadComoObjeto = true`.

The quantity **replaces** the echo's object. The object declared in the trigger is ignored
(and may be `@Nadie`). It is composed like this:

```
[ContenedorPorNivel + " "] + cifra + " " + UnidadCantidad
```

**Without a container:** leave `ContenedoresPorNivel` empty and you will get "eliminó a 10
bandidos". It is perfectly valid; the container only adds flavor.

**Agreement:** the container must agree with the unit. "un grupo de 10 bandidos"
(masculine plural), "una marea de 1.350 prisioneros" (feminine singular, but the unit
rules). The composer does not fix grammar: it writes what you declare.

---

## 7. Instrument

`InstrumentosPorNivel` is appended **at the end of the object** (or of the composed
object):

```
plan.Objeto = plan.Objeto + ", " + instrumento
```

That is why it shows up in **all** templates: the object is the only slot that is never
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
v1: eliminó a una banda de 30 bandidos, con su espada
v2: eliminó a una hueste de 90 bandidos, sin ayuda de nadie
v3: eliminó a un ejército de 350 bandidos, con las manos desnudas
v4: eliminó a un pelotón de 1.100 bandidos, con las manos desnudas
```

The level's template can add prefixes, adverbs and trailing phrases around them, but
those three pieces (figure + collective + instrument) remain.

**Without an instrument:** leave the array empty. No comma or gap is added.

**Mind the comma:** if your template already ends the object with punctuation, the
instrument will end up after the comma. Example: `{objeto}.` + instrument → "... bandidos.,
con su espada". Leave punctuation in `{sufijo}` or `{coletilla}`, not in `{objeto}`.

---

## 8. What the UI sees: `EcosPlanFrase`

If you need to render the sentence in parts (subtitles, color, translation), use
`EcosSystem.Planificar`:

| Field | Content with quantity set apart | Content with quantity as object |
| --- | --- | --- |
| `Objeto` | "el objetivo" | "un pelotón de 1.100 bandidos, con las manos desnudas" |
| `Cantidad` | "desde 2.000 metros" | `""` (the figure is already in `Objeto`) |
| `Verbo` | "eliminó a" | "eliminó a" |

This is useful for localization: you can translate `Verbo`, `Objeto` and `Cantidad`
separately without recomposing the sentence.

---

## 9. Bilingual

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

## 10. Common problems

| Symptom | Cause | Fix |
| --- | --- | --- |
| No figure appears | `CantidadBase = 0` and `UnidadCantidad` empty. | Declare at least `CantidadBase` and `UnidadCantidad`. |
| Neither the figure nor the unit appears | `UnidadCantidad` empty. | Fill it in (`metros`, `bandidos`); without a unit the figure is not shown. |
| The figure does not change between levels | `CantidadComoObjeto` or the level is not being updated. | Check the level in the console; use the override only if needed. |
| The figure is always the same for all NPCs | `VariacionPorOyente` disabled. | Enable it if you want different roundings per listener. |
| The trigger's object does not appear | `CantidadComoObjeto = true` replaces it. | This is the expected behavior. |
| The figure is too large/small | The head-count curve is aggressive. | Use `CantidadesPorNivel` as an override or lower `CantidadBase`. |

---

## 11. Quick test

1. Open `Window ▸ Ecos ▸ Consola de Ecos`.
2. Emit `abatir_distancia` with intensity 75.
3. Walk through the five levels.
4. Check that the figure rises and that the verb/patient do not change.

**Expected:** 500 → 750 → 1,000 → 1,400 → 2,000 meters (without per-listener variation).

For a head count, emit `diezmar_bandidos` with intensity 60: 10 → 30 → 90 → 350 →
1,100 bandits. The container and the instrument change, but the fact remains the same.
