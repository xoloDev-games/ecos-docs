# Changelog

Todos los cambios relevantes del proyecto Ecos. El changelog que viaja dentro del paquete
UPM se mantiene sincronizado con esta página.

## [1.1.0] - 2026-10-19

### Changed

- Minimum Unity version is now **Unity 6.3 LTS (6000.3)**, validated on
  **6000.3.19f1**. The manifest declares `"unity": "6000.3"` and
  `"unityRelease": "19f1"`.
- Package metadata now includes the `license` field and the exact Unity release.
- The full Apache License 2.0 text for the **optional** semantic model is included as
  `LICENSE-APACHE-2.0.txt`; `Third Party Notices.md` references it.
- The store distribution is prepared as a **model-free** package. The recommended model
  is downloaded and exported by the developer following the public documentation.

### Verified

- 55 headless tests.
- Clean Unity 6000.3.19f1 project: UPM import, Editor compilation, demo scene generation,
  `modoSemilla` serialization and optional FP16 model import.
- Store package size is ~1 MB, far below the Asset Store UPM limit of 700 MB.

## [1.0.0] - 2026-10-19

### Added

- Deterministic rumor propagation across scopes (player, faction, place, group, system)
  with explicit anonymizing bridges.
- Procedural composer with five exaggeration levels, six intentions, per-listener
  variation, anonymization and honest raw-id fallbacks.
- Quantity ladders on actions: base value, unit, preposition, per-level exact values,
  collective containers, instruments and quantity-as-object.
- Reputation dossiers with ambivalence and contradiction detection.
- Unity components: `EcosBootstrap`, `EcosBootstrapSentis`, `EcosTriggerAction`,
  `EcosListener`, `EcosMemoriaNpc`, `EcosReaccionComponente`, `EcosJugadorLocal`,
  `EcosIdentidad`.
- ScriptableObject data: configuration, library, elemental categories and NPC profiles.
- Multilingual semantic mapping (Spanish/English) through an XLM-R MiniLM ONNX model,
  with deterministic hash fallback.
- Editor tools: demo scene builder, debug console, phrase lab and asset inspectors.
- Demo sample with 5 facts, 6 NPCs, visible 6-hop chains and an over-the-shoulder camera.
- `ModoSemilla` (`Fija` / `AleatoriaPorSesion`) plus `EcosSemillaPartida`: choose a fixed
  seed for replays, randomize wording per session, or persist a seed per save slot while
  keeping the fact, level ladder and quantities deterministic. The demo uses a random
  session seed.
- Fourteen documentation chapters in Spanish, recipes, API reference and troubleshooting.
- 55 headless tests for the Unity-free core.

### Notes

- Minimum Unity version: 6.3 LTS (6000.3). Validated on 6000.3.19f1 with
  `com.unity.ai.inference` 2.6.1.
- The INT8 dynamic export is not shipped: Inference Engine 2.6.1 rejects
  `DynamicQuantizeLinear`/`MatMulInteger` with `OnnxImportException`. The FP16 export is
  the validated option.
