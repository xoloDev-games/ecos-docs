# 04 — Configuration

All the numbers live in an asset (`EcosConfigAsset`) that at runtime becomes
`EcosConfiguracion` (a testable POCO). None of this requires recompiling.

> **General rule:** every field has an Inspector tooltip with the same text (or more)
> as this page. If you are unsure about the effect of a value, look up the formula here.

---

## 1. Propagation

### `maxSaltos` (int, 1..12 · default 4)

Maximum number of mouths an echo travels through. It is the **ceiling of the chain**.

- `3` — local rumor (small village).
- `4` — town (default).
- `6` — campaign/demo: full visible chain.
- `8+` — sagas; you will need to tune degradation and credibility.

**Effect of raising it:** more versions of the rumor, more accumulated deformation and more cost.
**Effect of lowering it:** the story is cut earlier, closer to the truth.

### `probabilidadContagioBase` (float 0..1 · 0,65)

Contagion probability **before** applying traits, level, credibility and affinity.
The actual formula is multiplicative:

```
p = base
  × (0.35 + 1.15 × locuacidadEmisor)
  × (0.40 + 1.20 × credulidadReceptor)
  × (0.70 + 0.60 × autoridadEmisor)
  × confianzaEco
  × (1 − 0.12 × nivel)
  × afinidadElemental × gananciaCategoría
```

**Effect of raising it:** the rumor catches fire faster and travels faster.
**Note:** with `maxContagiosPorEco = 0` (fan-out), raising it **flattens the chain**: almost every
NPC hears about it on the first hop and no new mouths remain. If you want
depth, raise it **together with** `maxContagiosPorEco = 1`.

### `maxContagiosPorEco` (int, 0..16 · 0)

How many **new** mouths an echo can infect in a single step.

| Value | Effect | Feel |
| --- | --- | --- |
| `0` | Classic fan-out: everyone who passes the roll hears about it at once. | The rumor "explodes" and saturates. Realistic in crowds. |
| `1` | Word of mouth: exactly one new mouth per hop. | **Visible chain.** Recommended for narrative and demos. |
| `2-3` | Hybrid: it opens up a little without saturating. | Rumors that fork into two or three huddles. |

**Expected effect of going from 0 to 1:** depth stops depending on chance and
walks the channel's census. With 6 NPCs and `maxSaltos = 6` you see `v1..v6`.

### `contagioGarantizado` (bool · false)

Deterministic mode: the echo **always** hops to the next mouth, with no contagion roll.
Degradation, intention and credibility loss still apply. Depth is set by
`maxSaltos` and the number of NPCs.

- **True**: demos, tutorials, scripted scenes. A chain that **never** breaks.
- **False**: production. Chance makes every playthrough have different rumors.

**Why it exists:** with `maxContagiosPorEco = 1` there is **one** roll per hop and its
probability drops with confidence and level; a single failure kills the rumor halfway. In
a demo that reads as a bug ("it only reaches 3 hops").

### `maxEventosPorTick` (int, 16..4096 · 256)

Ceiling of echoes processed per frame. If there is more queue, it waits for the next frame.

**Effect:** it does not change the story, only the pacing and the cost. With hundreds of NPCs and
long chains, raise it if you see the rumor moving "in jerks".

### `maxNodosPorCanal` (int, 64..8192 · 512)

Nodes the graph of each channel keeps before pruning the oldest echoes.

**Effect:** long memories (chronicles, historical reputation) need more nodes.
It raises the process memory if you have many channels.

### `tiempoDeVidaEco` (float, 10..7200 · 900 s)

How long an echo "stays fresh". After that time it stops spreading and is purged.

**Effect:** high values keep rumors alive for the whole playthrough; low values make them
be forgotten quickly (useful in long sessions with a lot of noise).

### `retardoPropagacionBase` (float, 0,5..60 · 4 s)

Delay between mouth and mouth when `intervaloDeformacion = 0`. The actual delay is
`base × (1 + 0,15 × nivel) ± jitter − 2 × sesgoVelocidad`.

**Effect:** it gives "gossip time". 4 s is a rumor told in one conversation;
0,5 s is a hysterical town.

### `retardoPropagacionJitter` (float, 0..30 · 3 s)

Randomness of the delay (± seconds). `0` = fixed cadence per mouth.

### `intervaloDeformacion` (float, 0..120 · 0)

**Deformation TIMER.** If it is `> 0`, it overrides everything above: every X exact
seconds the information hops from one NPC to another and becomes deformed. Level
scaling, chance and biases are ignored.

| Value | Effect |
| --- | --- |
| `0` | Classic organic delay (base + jitter + biases). |
| `2` | Chain of 6 in 12 s. Ideal for a demo. |
| `5` | Chain of 6 in 30 s. The pace of a "rumor that runs slowly". |
| `0,25` | Almost instantaneous; useful for tests. |

---

## 2. Degradation and credibility

### `factorDegradacionPorSalto` (float 0..1 · 0,22)

Distortion pressure added **per hop**. It is the main control of the ladder.
The total pressure is:

```
presión = factorDegradacionPorSalto × saltos
        + pesoLocuacidadEnDistorsion × locuacidadEmisor
        + pesoSesgoExageracion × sesgoExageracionEmisor
        + 0.15 × (1 − autoridadEmisor)
        − 0.10 × memoriaEmisor
        + 0.35 × (1 − confianzaEco)
        − 0.12 × (intensidad / 100)
        + afinidadExageracion + categoríaGananciaExageracion
```

And it becomes a level using the bands:

| Pressure | Level |
| --- | --- |
| `< 0.20` | Literal |
| `< 0.42` | Smoothed |
| `< 0.64` | Adorned |
| `< 0.86` | Exaggerated |
| `≥ 0.86` | Distorted |

The degrader is **monotonic** (a ratchet): the echo never "improves" as it travels.

| Value | Expected chain of 6 hops |
| --- | --- |
| `0,10` | Literal, Literal, Literal, Smoothed, Smoothed, Adorned |
| `0,22` | Literal, Literal, Smoothed, Adorned, Exaggerated, Distorted |
| `0,33` | Literal, Smoothed, Adorned, Exaggerated, Distorted, Distorted |
| `0,45` | Literal, Adorned, Exaggerated, Distorted, Distorted, Distorted |

### `factorCredibilidadPorSalto` (float 0..1 · 0,16)

Credibility the echo loses per hop. The degradation rule formula is:

```
confianza -= factorCredibilidadPorSalto + (1 − credibilidadDelNivel) × 0.25
```

where `credibilidadDelNivel` is `1.00 / 0.85 / 0.70 / 0.45 / 0.25`.

**Effect:** `0,16` is a normal rumor (it dies around hop 4 if confidence does not rise).
`0,04` allows chains of 6 without becoming unbelievable too soon.

### `pesoLocuacidadEnDistorsion` (float 0..1 · 0,15)

Weight of the narrator's talkativeness in distortion. `0` = personality does not alter
the level (only whether it repeats or not).

### `pesoSesgoExageracion` (float 0..1 · 0,35)

Weight of the profile's exaggeration bias (`-1..+1`) in the pressure. `0,35` lets a
braggart rise a level on its own; in addition, in `EcosReglaSesgoNarrador` its bias moves the
**intensity** (`± 8 points` per unit of bias).

### `umbralConfianzaMinima` (float 0..1 · 0,15)

Below this credibility the echo is delivered one last time to the sinks (so that
the UI shows it), but it **no longer propagates**.

| Value | Effect |
| --- | --- |
| `0,15` | Prudent: rumors die if they become unbelievable. |
| `0,02` | Guaranteed chains of 6 (demo preset). |
| `0,50` | Skeptical world: only the plausible travels. |

### `umbralIntensidadMinima` (int 0..100 · 10)

Minimum intensity for an echo to be worth telling. `10` lets almost everything through; `30`
filters gameplay noise (opening doors, breaking crates).

---

## 3. Contradictions and ambivalence

### `penalizacionContradiccion` (float 0..1 · 0,25)

Credibility loss when the echo contradicts another one the receiver already believes (same
patient, antagonistic actions). It is weighted by the credibility of the previous belief.

### `penalizacionContradiccionMaxima` (float 0..1 · 0,50)

Cap on the accumulated loss in a single contagion.

### `bonusSinergia` (float 0..1 · 0,08)

Extra credibility when the echo **reinforces** a previous belief (e.g. "burned the
forest" + "razed the village").

### `contradiccionRequiereMismoPaciente` (bool · true)

- **True** (recommended): "killed a shepherd" only clashes with "saved a shepherd".
  Killing a shepherd and saving a villager is **ambivalence**, not a contradiction.
- **False**: any pair of antagonistic actions clashes; the subject can only
  hold one version of itself per channel.

> Rival accounts **are never erased**: they feed `EcosDossierSujeto`
> (reputation, ambivalence, contradictions). See
> [03 — Concepts](03-Conceptos.md).

---

## 4. Multiplayer / isolation

### `anonimizarAlCruzarScope` (bool · true)

When crossing a channel bridge, the echo loses the player's identity.

### `saltosParaAnonimizar` (int 0..8 · 3)

**How it works, in two layers:**

1. **Anonymization rule (pipeline, priority 50):** from that hop onward, the
   echo's `SujetoId` is replaced by `@Desconocido`. The whole system (including the
   subject's sheet) stops knowing who did it.
2. **Composer:** if the listener does not know the subject and the echo reaches that hop,
   its `NombreVago` is used ("un forastero"). In addition, at `Distorsionado` level there is a 35 %
   chance of anonymizing even when the subject is known.

| Value | Expected effect |
| --- | --- |
| `0` | Anonymous from the origin (a rumor about "someone"). |
| `3` | Proper name for the first 3 mouths; afterwards "someone". **Default.** |
| `6` (with `maxSaltos = 6`) | The name ("Aldric") is kept in `v0..v5`; at `v6` (saltos = 6) it becomes `@Desconocido`. Demo preset. |
| `> maxSaltos` | Never anonymized by hops. |

---

## 5. Determinism

### `semillaMundo` (int · 1337)

Master seed. Same value ⇒ same story, on any machine.

### `modoSemilla` (`Fija` · `AleatoriaPorSesion`)

How the master seed is chosen when the runtime is built:

| Value | What it does | When to use it |
| --- | --- | --- |
| `Fija` | Always uses `semillaMundo`. | Tests, replays, QA and **continuing a saved game**. |
| `AleatoriaPorSesion` | Draws a new seed on every runtime build. | Demos and sessions where you want variety. |

`AleatoriaPorSesion` is what the demo ships with: **every Play tells the rumor with different
words, flourishes, colors and tags**. It changes the **wording**, not the fact: the verb,
the patient, the sequence of levels and the figures still come from the data and the
rules. The seed used is left in `runtime.Config.SemillaMundo`.

#### "Session" is not the same as "playthrough"

- **Session:** every time the runtime is built. In Unity, every Play; in a build, every
  application start (or every rebuild of the runtime).
- **Playthrough:** the logical save slot, from "New game" until the player continues.

`AleatoriaPorSesion` **does not save the seed**. If the player closes the game and continues, the
runtime is rebuilt and the new session draws again. So that a new playthrough has
its own seed and **continuing preserves it**, use `EcosSemillaPartida`:

```csharp
// New game: draw a seed and return it so you can store it in your save.
int semillaGuardada;
var configNueva = EcosSemillaPartida.ParaNuevaPartida(configBase, out semillaGuardada);

var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(configNueva)
    .Construir();
// save.SemillaEcos = semillaGuardada;
```

```csharp
// Continue: same saved seed (+ saved facts/state) -> same history.
var configCargada = EcosSemillaPartida.ParaContinuarPartida(configBase, save.SemillaEcos);

var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(configCargada)
    .Construir();
```

Both helpers clone the configuration and leave it in `Fija` mode; the original asset is not
modified. The Core does not impose a save system: you decide where to persist the seed.

For tests, replays and QA without a save, leave `modoSemilla = Fija` and set `semillaMundo`: same
seed ⇒ same sentence byte for byte.

### `variacionPorOyente` (bool · true)

Adds the listener's id to the composition seed: each NPC tells it with different
words, but reproducibly.

### `autoRegistrarPerfilesFuente` (bool · true)

Creates a "source" (narrator) profile for the subject of each echo, so that even the
deeds of a player have their own style. Uncheck it if you register the profiles by hand.

---

## 6. Presets ready to paste

| Preset | maxSaltos | maxContagiosPorEco | contagioGarantizado | intervaloDeformacion | factorDegradacion | factorCredibilidad | umbralConfianza | saltosParaAnonimizar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Production / fan-out** | 4 | 0 | false | 0 | 0,22 | 0,16 | 0,15 | 3 |
| **Word of mouth (game)** | 6 | 1 | false | 0 | 0,20 | 0,10 | 0,10 | 4 |
| **Demo / script** | 6 | 1 | **true** | **2** | 0,22 | 0,04 | 0,02 | 6 |
| **MMO / Edge** | 3 | 0 | false | 0 | 0,25 | 0,20 | 0,25 | 2 |
| **Secret (stealth)** | 4 | 1 | false | 0 | 0,15 | 0,25 | 0,30 | 0 |

How to apply them:

- **Inspector:** edit `EcosConfig.asset`.
- **Code:**

```csharp
var config = new EcosConfiguracion
{
    MaxSaltos = 6,
    MaxContagiosPorEco = 1,
    ContagioGarantizado = true,
    IntervaloDeformacion = 2f,
    FactorDegradacionPorSalto = 0.22f,
    FactorCredibilidadPorSalto = 0.04f,
    UmbralConfianzaMinima = 0.02f,
    SaltosParaAnonimizar = 6
};
```

- **Demo scene:** `Ecos ▸ Construir Escena de Demo` reapplies the demo preset, including
  `modoSemilla = AleatoriaPorSesion` so that every Play sounds different.

---

## 7. What to expect when changing each thing

| Change | Observable effect |
| --- | --- |
| `maxSaltos` 4 → 6 | The echo reaches `v6`; the last version is more exaggerated and harder to believe. |
| `maxContagiosPorEco` 0 → 1 | From "everyone hears at once" to "a visible chain of 6 mouths". |
| `contagioGarantizado` false → true | The chain stops breaking by chance; it always reaches the ceiling. |
| `intervaloDeformacion` 0 → 2 | The rumor advances tick-tock: one hop every 2 s. |
| `factorDegradacionPorSalto` 0,22 → 0,33 | Intermediate levels are skipped and it saturates in `Distorsionado` earlier. |
| `factorCredibilidadPorSalto` 0,16 → 0,04 | The rumor survives all 6 hops instead of dying at the fourth. |
| `umbralConfianzaMinima` 0,15 → 0,02 | The last mouth is emitted even though almost nobody believes it. |
| `saltosParaAnonimizar` 3 → 6 | The proper name holds for the whole chain. |
| `probabilidadContagioBase` 0,65 → 0,9 | With fan-out, it saturates earlier; with one mouth per hop, it avoids cuts. |
| `pesoSesgoExageracion` 0 → 0,6 | Braggart profiles distort much more than neutral ones. |
| `umbralIntensidadMinima` 10 → 30 | Trivial deeds stop turning into rumors. |
