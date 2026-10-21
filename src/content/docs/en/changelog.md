# Changelog

All notable changes to the Ecos project. The changelog shipped inside the UPM package
is kept in sync with this page.

## [1.2.0] - 2026-10-20

### Changed

- **Automatic, non-monotonic quantities.** Actions declare only `CantidadBase`;
  `EcosEscaladorCantidades` derives every level from the deformation level, direction,
  intensity, intention and listener seed. Quantities can fall at Smoothed and rise again
  (500 -> 450 -> 850 -> 1,200 -> 1,800 m; 10 -> 2 -> 35 -> 70 -> 110 bandits).
  `CantidadesPorNivel` remains as an optional exact override. Demo actions and tests no
  longer require per-level quantity tables.
- **Declared semantic inversion.** At Distorted, `EcosReglaDeformacionNarrativa` can switch
  an action to its hand-authored `AccionInversaId` variant (for example `regicidio` ->
  `salvar_rey`). `EcoEvento` preserves `AccionOriginalId`/`ObjetoOriginalId`, and
  `AccionInversaId` also feeds the contradiction graph. No text is generated.
- **Traceability fields.** `EcoEvento` exposes `AccionOriginalId`, `ObjetoOriginalId`,
  `DireccionDeformacion` and `EsInversion`, so a game can distinguish the original fact
  from the version an NPC believes.
- **Extensible deformation rule.** `EcosReglaDeformacionNarrativa` runs at priority 120,
  after degradation and before contradiction. The default pipeline wires it; custom
  pipelines must add it explicitly.
- **Action data.** `EcosAccion` adds `AccionInversaId`, `ObjetoInversoId` and
  `CantidadEsRecuento`. Counts use a more aggressive curve than continuous measures; the
  inverse variant uses its own declared `CantidadBase`.
- **Demo expanded to six facts**, including `regicidio`/`salvar_rey` and the 10 -> 2 ->
  100 soldier example.
- **Documentation updated** in Spanish and English with the non-monotonic curves, the
  inversion semantics and the BYOM integration path.
- **BYOM clarified.** The Sentis provider supplies embeddings for elemental category
  mapping only; level and intention use deterministic, replaceable classifiers.

### Migration notes

- Existing `CantidadesPorNivel` tables still work and override the automatic curve.
- `EcoEvento` constructor and `Derivar` are source-compatible; new fields default to the
  original action/object and `Neutro`.
- Inversion is opt-in per action and only happens at Distorted; at most one inversion per
  chain.
- Custom pipelines built without `EcosRuntimeBuilder` must add
  `EcosReglaDeformacionNarrativa` explicitly.

### Verified

- 63 headless tests.
- Clean Unity 6000.3.19f1 project: UPM import, Editor compilation, demo scene generation,
  `modoSemilla` serialization and optional FP16 model import.
- Sentis FP16 model on both `GPUCompute` and `CPU`, returning 384-dimensional vectors.
- URP 17.3.0: active pipeline detection, URP Lit demo materials and Windows standalone build.
- Windows Standalone x64: Built-in and URP players start without exceptions.
- Store UPM package size is ~1 MB, far below the Asset Store UPM limit of 700 MB.

## [1.1.0] - 2026-10-20

### Changed

- Minimum Unity version is now **Unity 6.3 LTS (6000.3)**, validated on
  **6000.3.19f1**. The manifest declares `"unity": "6000.3"` and
  `"unityRelease": "19f1"`.
- **Bilingual documentation.** The 14-chapter manual, architecture, design notes,
  changelog, support and license pages are available in Spanish and English. The public
  site serves `/docs/...` (Spanish) and `/en/docs/...` (English).
- **URP-compatible demo.** Generated materials follow the active render pipeline (URP Lit
  or Standard), so a URP project no longer renders pink primitives.
- Package metadata now includes the `license`, `documentationUrl`, `changelogUrl` and
  `licensesUrl` fields and the exact Unity release.
- The full Apache License 2.0 text for the **optional** semantic model is included as
  `LICENSE-APACHE-2.0.txt`; `Third Party Notices.md` references it.
- The store distribution is a **model-free** package (`-SinModelo`). The recommended model
  is downloaded and exported by the developer following the public documentation.

### Verified

- Clean Unity 6000.3.19f1 project: UPM import, Editor compilation, demo scene generation,
  `modoSemilla` serialization and optional FP16 model import.
- Sentis FP16 model on both `GPUCompute` and `CPU`, returning 384-dimensional vectors.
- URP 17.3.0: active pipeline detection, URP Lit demo materials and Windows standalone build.
- Windows Standalone x64: Built-in and URP players start without exceptions.

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
