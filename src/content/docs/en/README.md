# Ecos — Documentation

> **Rumor propagation and degradation system for NPCs.**
> A fact happens once; the world tells it a thousand times, each time worse.
> Everything runs locally (Edge AI): no server, no mandatory GPU, and full determinism.

Root namespace: `xoloDev.Ecos` · Pure domain: `xoloDev.Ecos.Core`

---

## What it is and what it is not

**It is** a rumor engine:

- An NPC lives through a fact ("the blacksmith burned the village").
- The fact spreads by word of mouth among the NPCs of a channel.
- At each hop the account **deforms**: it adds flourishes, loses detail, exaggerates the
  quantities, changes the intention, and lowers credibility.
- The final text is written by a **procedural composer** from dictionaries.

**It is not** an AI text generator. No model writes the sentence.
The lightweight model (optional) only classifies two enums: *exaggeration level* and
*intention*. This is the **Zero Hallucinations** rule: the game never invents verbs,
culprits, or patients that the designer has not declared.

![Architecture](arquitectura.png)

---

## Index

| Document | Purpose |
| --- | --- |
| [01 — Installation](01-Instalacion.md) | Requirements, UPM package, and setup. |
| [02 — Quick start](02-InicioRapido.md) | A playable scene in 10 minutes. |
| [03 — Concepts](03-Conceptos.md) | Echo, channel, level, intention, confidence, hops. |
| [04 — Configuration](04-Configuracion.md) | Every knob, with its expected effect. |
| [05 — Library and texts](05-BibliotecaYTextos.md) | Subjects, actions, objects, templates, attributions. |
| [06 - Quantities and head counts](06-Cantidades.md) | The automatic curve: 500→2.000 m, 10→~1.100 bandits. |
| [07 — Emitting echoes](07-EmitirEcos.md) | Triggers, UnityEvents, code, multiplayer. |
| [08 — Listening and reacting](08-EscucharYReaccionar.md) | Listeners, NPC memory, reactions, custom sinks. |
| [09 — NPCs and profiles](09-NPCsYPerfiles.md) | Personality, traits, biases, memory. |
| [10 — Semantic model](10-SemanticaONNX.md) | Optional model: download, FP16 export, backend, and performance. |
| [11 — Recipes](11-Recetas.md) | Copy-paste: concrete scenarios and what to expect. |
| [12 — API reference](12-APIReferencia.md) | All public classes and members. |
| [13 — Troubleshooting](13-Problemas.md) | Typical symptoms and their cause. |
| [14 — Packaging and selling](14-EmpaquetadoYVenta.md) | How the deliverable and the licenses are generated. |

Diagrams:

- `arquitectura.png` — layers and dependencies.
- `flujo-eco.png` — life cycle of an echo, from the source to the sixth mouth.

The internal design and the rationale behind each decision are in
[`arquitectura-interna.md`](arquitectura-interna.md) and
[`diseno-contradicciones.md`](diseno-contradicciones.md). The remaining project pages:
[`changelog.md`](changelog.md), [`soporte.md`](soporte.md),
[`licencia-asset.md`](licencia-asset.md) and
[`licencias-terceros.md`](licencias-terceros.md).

The Spanish manual is available at
<https://xolodev-games.github.io/ecos-docs/docs/manual>.

---

## Ecos in 60 seconds

```csharp
// 1. Runtime for tests or servers (no Unity).
var runtime = new EcosRuntimeBuilder()
    .ConBiblioteca(EcosBibliotecaFragmentos.CrearPorDefecto())
    .ConReloj(new EcosRelojManual())
    .Construir();

// 2. An NPC listening on player "A"'s channel.
runtime.RegistrarNpc(new EcosPerfilNpc
{
    Id = "Herrero", Nombre = "el herrero", Scope = EcosScope.Jugador("A")
});

// 3. A fact happens.
runtime.RegistrarEvento("A", "quemar", "aldea", 80);

// 4. Advance the world and read what is being said.
runtime.Tick(1.0);
EcoEvento rumor;
if (runtime.Bus.ObtenerCanal(EcosScope.Jugador("A")).Grafo.TryEcoMasRelevante("Herrero", out rumor))
    Debug.Log(EcosSystem.Narrar(rumor, null));
```

In Unity, it is the same but by dragging components: see
[02 — Quick start](02-InicioRapido.md).

---

## System guarantees

| Guarantee | How it is met |
| --- | --- |
| **Zero hallucinations** | The echo is `Sujeto + Acción + Objeto + Nivel + Intención`; the composer only substitutes dictionary tokens. |
| **Determinism** | `SemillaMundo` + a seed derived from the echo and the listener. Same seed ⇒ same sentence, on any machine. `ModoSemilla` lets you fix it (replay/continue) or randomize it per session without breaking replay within the session. |
| **1..N isolated players** | Each echo lives in an `EcosScope`; channels do not see each other except through an explicit bridge. |
| **Bounded cost (Edge)** | Caps on hops, on mouths per hop, on events per tick, and on nodes per channel. |
| **Credible degradation** | Credibility drops hop by hop; the level rises. An unbelievable rumor dies. |
| **Data ≠ flourish** | Level, intention, and magnitude are labels; the sentence is materialized at the end. |
