# 03 — Concepts

The whole system fits into seven ideas. If you understand these, the rest is configuration.

---

## 1. Echo (`EcoEvento`) — a FACT, not a sentence

An echo is a data struct:

```
SujetoId + AccionId + ObjetoId + Nivel + Intencion + Intensidad + Confianza + Saltos + Semilla
```

- **It contains no text.** Only dictionary ids.
- It is **immutable**: each hop produces a derived copy with `Derivar(...)`.
- It keeps its `Id` throughout the chain (it is the *same* rumor, told differently).

**What changes as it propagates:** `Nivel`, `Intencion`, `DireccionDeformacion`,
`Intensidad`, `Confianza`, `Saltos`, `NarradorId`, `Semilla`. In normal deformation,
`AccionId` and `ObjetoId` (verb and patient) are preserved. At Distorted they can change to
a declared inverse variant (`AccionInversaId`/`ObjetoInversoId`); the original fact remains
in `AccionOriginalId`/`ObjetoOriginalId`. `SujetoId` only changes to `@Desconocido` through
the anonymization rule. That is the *Zero Hallucinations* contract: the account deforms,
but every variant is declared and the original fact remains auditable.

## 2. Channel (`EcosScope`) — isolation

A channel is a queue plus a graph (who knows what). The types:

| Type | Use | Isolation |
| --- | --- | --- |
| `Global` | Weather, invasions, world echoes | **Everyone** sees them (observers). |
| `Jugador(id)` | Private channel for each player | Only that player and their NPCs. |
| `Faccion(id)` | Guilds, guards | Only if a bridge connects it. |
| `Lugar(id)` | Villages, cities | Same. |
| `Grupo(id)` | Arbitrary collectives | Same. |
| `Sistema(id)` | Debug, tutorials | Isolated from gameplay. |

**Golden multiplayer rule:** without an explicit bridge, two players **never** share a
rumor. With `EcosPuenteDeScope` you can make a player "leak" to their faction (usually by
anonymizing).

> **Be careful with `Global` in the demo.** An `EcosListener` subscribed to `Global` is an
> *observer*: it receives the **original** echo, not the deformed versions. To see the
> chain, subscribe to the player channel. The demo generator already does it that way.

## 3. Exaggeration level (`EcosNivelExageracion`)

Five discrete steps. They carry no text: they select templates and fragments.

| Level | Meaning | Example effect |
| --- | --- | --- |
| `Literal` | Exactly as it happened | "burned the village" |
| `Smoothed` | Detail is omitted | "more or less, burned the village" |
| `Adorned` | Emphasis is added without changing the fact | "they say that in the dead of night…" |
| `Exaggerated` | The magnitude is magnified | "without leaving a single stone" |
| `Distorted` | The impossible appears | "with the help of the devil…" |

The **distortion pressure** decides the level (see [04](04-Configuracion.md)):

```
presión = factorDegradacionPorSalto × saltos
        + pesoLocuacidadEnDistorsion × locuacidad
        + pesoSesgoExageracion × sesgoExageracion
        + 0.15 × (1 − autoridad)
        − 0.10 × memoria
        + 0.35 × (1 − confianza)
        − 0.12 × (intensidad / 100)
        + afinidad + categoría
```

Bands: `<0.20` Literal · `<0.42` Smoothed · `<0.64` Adorned · `<0.86` Exaggerated ·
the rest Distorted.

## 4. Intention (`EcosIntencion`) — the VOICE, not the content

`Neutral`, `Warning`, `Boast`, `Gossip`, `Threat`, `Lament`.

It determines **template + attribution + tag line**. "I saw it with my own eyes" or "what a
misfortune" are voices; the fact remains the same unless a declared inverse variant
exists. The intention classifier is heuristic (cheap); it does not use the model.

## 5. Confidence / credibility (`Confianza`)

A number `0..1` that falls at each hop (`factorCredibilidadPorSalto`), with the level, with
contradictions, and with the narrator's bias. If it drops below `umbralConfianzaMinima`,
the echo **dies**: it is delivered one last time to the UI and stops propagating.

A sixth-hand rumor is not very credible. That is the simulation, not a bug.

## 6. Hop (`Saltos`) and anonymization

`Saltos` counts the mouths it has passed through. Two uses:

- It cuts the chain at `maxSaltos`.
- It **anonymizes** the subject in two layers:
  1. The pipeline rule replaces `SujetoId` with `@Desconocido` when
     `Saltos >= SaltosParaAnonimizar`.
  2. The composer uses `NombreVago` ("a stranger", "someone with power") when the
     listener does not know the protagonist.

`SaltosParaAnonimizar = 0` ⇒ `@Desconocido` from the first echo.
`= 6` with `maxSaltos = 6` ⇒ the name is preserved in `v0..v5`; in `v6` (saltos = 6) the
rule already replaces it (demo preset).

## 7. Data vs. flourish (the key to this asset)

- The **fact** is: subject + verb + patient + **declared quantity**.
- **Degradation** can attenuate or exaggerate the figure (10 → 2 → 35 → 70 → 110; 500 →
  450 → 850 → 1,200 → 1,800), change the collective, change the instrument, and add
  emphasis, prefixes, tag lines, and elemental color.
- At the **Distorted** level, if the action declares `AccionInversaId`, the story can turn
  into a hand-authored opposite variant ("committed regicide" → "tried to save the
  king"). The original fact remains in `AccionOriginalId`; the variant is never
  generated.

That is a real rumor: **the data deforms and, sometimes, the version being told turns;
the original fact remains auditable**. Full detail in
[06 — Quantities](06-Cantidades.md).

---

## Flow diagram

![Echo flow](flujo-eco.png)

1. The **source** registers the echo (`EcosSystem.RegistrarEvento`).
2. The **bus** enqueues it in its channel with a delay.
3. The **propagator** delivers it: graph + notification to sinks.
4. If it is still alive, it probes each NPC in the channel.
5. For each contagion: it applies **rules** (anonymization → degradation → contradiction
   → affinity → bias → fading) and re-enqueues the derived version.
6. The **sinks** (listeners, memory, UI) receive each version.
7. The **bridges** decide whether it crosses into another channel.
