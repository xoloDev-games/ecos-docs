# 01 — Installation

## 1. Requirements

| Requirement | Version | Notes |
| --- | --- | --- |
| Unity | **6.3 LTS (6000.3)** or higher (tested on 6000.3.19f1) | The runtime uses the `Unity.InferenceEngine` namespace (Inference Engine 2.x). |
| Unity Inference Engine | **2.6.1** | Package `com.unity.ai.inference`. Required to compile the Sentis provider; the hash fallback does not use it. |
| Input System | **1.19.0** | Package `com.unity.inputsystem`. Only the demo uses it (WASD/mouse); the runtime does not depend on it. |
| Render pipeline | Any | The demo detects URP (`Universal Render Pipeline/Lit`) and falls back to `Standard`/`Unlit`. |
| Optional system | TextMeshPro / UGUI | Only if you want to display sentences in the UI. The engine does not depend on them. |
| ONNX model | **Optional, not included** | Multilingual (Spanish + English), 384 dimensions. Download it and export it to FP16 following chapter 10. |
| Tokenizer | **Optional, not included** | `sentencepiece.bpe.model.bytes` (≈ 4,8 MB). It must be imported as a **TextAsset** (hence the `.bytes` extension). |

> **Why `.bytes`.** Unity does not import `.model` files as `TextAsset`.
> Renaming `sentencepiece.bpe.model` to `sentencepiece.bpe.model.bytes` exposes its
> bytes to `TextAsset.bytes`, which is what `EcosProveedorEmbeddingsSentis` consumes.

> **The package does not include the model.** Ecos works without it by using
> `EcosProveedorEmbeddingsHash` (deterministic lexical similarity). If you want semantic
> classification, download the recommended model and export it to ONNX FP16; the step-by-step
> instructions are in [10 — Semantic model](10-SemanticaONNX.md).

## 2. Installation as a package (recommended)

1. Download `com.xolodev.ecos-1.2.0.tgz`.
2. In Unity: **Window ▸ Package Manager ▸ + ▸ Add package from tarball…**
3. Select the `.tgz`.
4. Accept the installation of the `com.unity.ai.inference` dependency if prompted.
5. (Optional) **Window ▸ Package Manager ▸ Ecos ▸ Samples ▸ Import** to bring in the demo.

The package provides three assemblies:

| Assembly | Path | Contents |
| --- | --- | --- |
| `xoloDev.Ecos.Core` | `Runtime/Core` | Pure domain, **without Unity references** (`noEngineReferences: true`). |
| `xoloDev.Ecos` | `Runtime/Ecos` | Components, facade, assets, Sentis. |
| `xoloDev.Ecos.Editor` | `Editor` | Inspectors and debug window. |

The demo scripts live in `Samples~` and, when imported, land in
`Assembly-CSharp` / `Assembly-CSharp-Editor` (you only need the package installed).

## 3. Manual installation (`Assets` folder)

If you prefer not to use UPM:

1. Copy the contents of `Runtime/` to `Assets/Ecos/Runtime/` and the contents of `Editor/` to
   `Assets/Ecos/Editor/` (and `Documentation~` if you want the manual).
2. If you want the demo, copy the **contents** of `Samples~/Demo` to `Assets/Ecos/Demo/`
   (without the tilde: a `Samples~` folder inside `Assets` is not compiled).
3. **Optional:** if you are going to use the model, leave the files alongside the rest of the runtime:
   - `Assets/Ecos/Modelos/model.onnx` (FP16)
   - `Assets/Ecos/Modelos/sentencepiece.bpe.model.bytes`
4. Wait for Unity to import the `.onnx` (it will appear as a **ModelAsset**).
5. Check the Console: there should be no `OnnxImportException`. If you do not use the model, this
   step does not apply.

## 4. Verification in three steps

1. **Menu `Ecos ▸ Construir Escena de Demo`**.
   - Creates `Assets/Ecos/Demo/EcosDemo.unity` fully wired.
   - Shows a summary dialog with what it has built.
2. **Play**. Walk with WASD toward the colored cubes.
3. **Console**: you will see `[Ecos] Emitido: …` and `[Ecos] NPC n -> NPC m : …` with the
   level rising and credibility falling. Without a model, the system uses the hash provider
   and keeps working.

If something fails, see [13 — Troubleshooting](13-Problemas.md).

## 5. What you should NOT touch

- **The `.meta` files of your assets**: Unity manages them.
- **The `Modelos` folder** (if you use it): if you move the `.onnx`, reassign the field on
  `EcosBootstrapSentis` or use the demo builder, which locates it by type.

## 6. Version upgrades

1. Replace the package folder/tarball.
2. Rebuild the demo scene if you were using it: `Ecos ▸ Construir Escena de Demo`
   (it is idempotent: it reuses assets and only rewrites the scene).
3. Check the package's `CHANGELOG.md`.

## 7. Uninstallation

1. **Window ▸ Package Manager ▸ Ecos ▸ Remove**.
2. Delete any assets you generated outside the package (for example
   `Assets/Ecos/Demo/`) if you do not want them.
3. No persistent state remains: the system does not write files or use PlayerPrefs.
