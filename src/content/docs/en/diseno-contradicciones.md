# Contradictions, accumulation and moral ambivalence

> Design document for the REPUTATIONAL axis of Ecos. It explains why a subject can carry
> several echoes at once, when two facts clash, and how the moral dilemma is measured
> without ever erasing a rumor. The implementation lives in `Scripts/Core` and is covered by
> `tests/Contradicciones/ContradiccionesTests.cs`.

---

## 1. The question

> "Can a player have more than 1 echo on them? As long as the categories don't overlap…"

Yes, and **it is already the default case**. `EcoEvento.Id` is unique per `CrearEco()`, so each
fact is an **independent node** in the graph (`EcosGrafoDeEcos._nodos`). Nothing merges or
overwrites: `_porNpc[npc]` is a `HashSet<int>` and `EcosMemoriaNpc._memoria` is a list.

What was missing was not the ability to accumulate, but **deciding when two facts clash**. Those are three
orthogonal axes, and the original design only covered the first two:

| Axis | Question it answers | Where it lives |
|---|---|---|
| **Space** | who knows about it? | `EcosScope` + `EcosPuenteDeScope` (isolated channels) |
| **Credibility** | how much of the story survives | `EcoEvento.Confianza`, `EcosNivelExageracion` |
| **Moral value** | how much it adds to or subtracts from the subject | **`EcosAccion.Valencia` / `.Peso`** (new) |

The "regional dispersion" and the "validity percentage" you proposed are therefore **not
alternatives**: the first is the spatial axis (it already existed) and the second is credibility
(also already existed). What was missing was the third.

## 2. The three cases

| Facts about the player | Relationship | Result |
|---|---|---|
| `asesinar pastor` + `asesinar soldado` | same action, different patient | **They accumulate** (two nodes, same valence) |
| `asesinar pastor` + `salvar aldeano` | opposite actions, different patient | **Ambivalence**: they coexist; the dossier measures it |
| `asesinar pastor` + `salvar pastor` | opposite actions, **same patient** | **Contradiction**: the newcomer loses credibility |
| `ser mago` + `usar fuego` | they are not facts, they are **facets** | They accumulate (see §7) |

The design key: **antagonism is between actions, but contradiction requires the same
patient**. That is exactly what separates your accumulable example from the non-accumulable one.

## 3. Data (editable in the asset)

In `EcosAccion` (which the designer already edits in `EcosBibliotecaAsset`):

```csharp
public int      Valencia = 0;              // -100 (infamous) .. +100 (heroic)
public float    Peso     = 0.5f;           // 0..1 weight in reputation
public string[] AntagonistaDe = new string[0]; // actions it clashes with (symmetric)
```

And a lookup table, `EcosRelacionesAcciones`, modeled on `EcosTablaAfinidad`:

```csharp
EcosRelacionAccion.Neutra      // coexist
EcosRelacionAccion.Sinergia    // reinforce each other ("quemar" + "arrasar")
EcosRelacionAccion.Antagonista // contradict each other ("asesinar" + "salvar")
```

`EcosRelacionesAcciones.CrearPorDefecto(biblioteca)` dumps the `AntagonistaDe` entries from the
library and adds a few example synergies. There is no AI: it is a table.

## 4. The propagation rule

`EcosReglaContradiccion` (priority **150**: after degrading, before elemental affinity).
When an echo about *S* reaches a receiver:

1. It walks the echoes about *S* that **that receiver already believes** (`Grafo.EcosDe(S)` + `Conoce`).
2. If any of them is **antagonistic and of the same patient**, it accumulates a credibility penalty:
   `PenalizacionContradiccion × (0.5 + 0.5 × confianza_previa)`, capped at
   `PenalizacionContradiccionMaxima`.
3. If it is a **synergy**, it adds `BonusSinergia`.
4. With `ContradiccionRequiereMismoPaciente = false`, any antagonistic pair clashes (useful
   for narratives where only one version of the character is remembered).

**An echo is never deleted.** The rule only modulates the confidence with which the new
story takes hold: the competing stories coexist, competing with each other. That tension *is* the content.

## 5. The subject dossier

`EcosDossierSujeto` is a **derived** value (it stores no state and is not serialized): it is computed from the
graph of a channel, so it never goes out of sync. Three readings, one per axis:

| Field | Range | What it says |
|---|---|---|
| `Reputacion` | -100..100 | mean of valences weighted by weight and credibility |
| `Ambivalencia` | 0..1 | `1 − abs(Σ v·p·c) / Σ abs(v·p·c)`. 1 = perfectly split |
| `Contradicciones` | count | pairs of facts that cannot be true at the same time |
| `CredibilidadMedia` | 0..1 | how much of what is said is believed, on average |
| `Detalle` | list | the echoes, sorted by Id (deterministic) |

Because the graph is **per channel**, the dossier answers for free *"what is said about Aldric in the upper
village?"* and *"...in the lower one?"* with different answers. And `CalcularDesdeGrafo(..., npcId)` gives the
**private truth** of a specific NPC.

## 6. API

```csharp
// Runtime (Core, without Unity)
var ficha = EcosDossierSujeto.CalcularDesdeGrafo(sujeto, grafo, biblioteca, relaciones);

// Unity facade (EcosSystem)
EcosSystem.EcosDe(scope, sujeto);                  // all echoes about the subject in the channel
EcosSystem.TryDossier(scope, sujeto, out ficha);   // the CHANNEL's truth
EcosSystem.TryDossierDeNpc(scope, npc, sujeto, out ficha); // the NPC's PRIVATE truth
```

## 7. Facets vs. facts

"He is a powerful wizard" or "he uses fire" are not events, they are attributes of the subject. The model already
has the pieces declared to treat them as echoes (so that they go through the same composer
and graph): `EcosAccion.Transitiva = false` (no direct object) and `EcosTiempoVerbal.Presente`.
Today they are **not wired** into the composer; that is the next natural step, not part of this
change.

## 8. Configuration settings

| Field | Default | What it does |
|---|---|---|
| `PenalizacionContradiccion` | 0.25 | credibility lost per contradiction |
| `PenalizacionContradiccionMaxima` | 0.50 | accumulated cap in a single contagion |
| `BonusSinergia` | 0.08 | extra credibility per reinforcement |
| `ContradiccionRequiereMismoPaciente` | true | require the same patient in order to clash |

All of them are in `EcosConfiguracion` (Core) and `EcosConfigAsset` (Inspector).

## 9. Decisions and caveats

- **`EcosIntencion` is NOT moral.** It is communicative (Neutral/Warning/Boast/Gossip/Threat/
  Lament); mixing good/bad into it would poison the sentence templates. Morality lives in
  valence.
- **The dossier does not duplicate state.** It is recomputed from the graph: zero risk of desynchronization.
- **Everything is deterministic.** The dossier sums are sorted by `Id` (float addition is
  order-sensitive) and the rule's tie-break uses no randomness.
- **Bounded cost.** `EcosGrafoDeEcos` keeps an index per subject (`_porSujeto`), so
  `EcosDe` does not scan the entire graph.
- **No deletion.** If at some point an echo needs to be "forgotten", that is purging by time
  (`TiempoDeVidaEco`), never a contradiction rule.

## 10. What is out of scope (future)

- Shifting the narrator's **intention** according to ambivalence ("some tell it as a hero,
  others as an executioner"): today the dossier measures it numerically, but does not rewrite the sentence.
- **Propaganda**: a rule that raises the perceived valence of an echo when it crosses certain channels.
- **Per-faction dossier** with different weights per listener (each channel values the same
  fact differently).
- Moving valence into the Inspector's **library asset** with a dedicated view
  (today it already appears as fields of `EcosAccion`).
