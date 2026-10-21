# 10 — Semantic model (optional)

The system works **without a model**. The model improves only one thing: deciding which
elemental category an action belongs to when the designer did not label it by hand.

> **It does not generate text.** It reads a short phrase, returns a vector of 384 numbers,
> and the mapper looks for the nearest category. The final phrase still comes from the
> dictionary.

---

## 1. What it does exactly

```text
acción ("prendió fuego al granero")
   -> tokenizador XLM-R        -> ids
   -> modelo ONNX              -> vector por token
   -> media enmascarada        -> vector de frase (384 dims, normalizado)
   -> similitud coseno         -> categoría más cercana ("fuego")
```

If the similarity does not exceed `umbral`, no category is assigned and the designer's
label is used (or none). **It never invents a category with low confidence.**

### Without a model: fallback provider

`EcosProveedorEmbeddingsHash` is deterministic, dependency-free, 96 dimensions. It compares
lexically (word overlap), not by meaning. It is enough for prototypes and tests, and it
lets the Core run headless.

**What changes when you enable the model:** "acuchilló" and "asesinó" get closer even
though they share no letters; "quemó" and "prendió fuego" fall into the same category. The
rest of the system (propagation, composition, sheet) is identical.

---

## 2. What the package includes

The Asset Store package **does not include AI weights**. The `Runtime/Modelos/` folder
contains a `LEEME.txt` and is reserved for you to place:

| File | Size | Format | Use |
| --- | --- | --- | --- |
| `model.onnx` | ≈ 224–236 MB | FP16 | Embedding model. You export it yourself with the script on this page. |
| `sentencepiece.bpe.model.bytes` | ≈ 4,8 MB | SentencePiece | XLM-R tokenizer. Downloaded from the model repository and renamed to `.bytes`. |

Recommended and validated model:

- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- XLM-R, 384 dimensions, 12 layers, ~118 M parameters.
- Understands Spanish and English natively.
- **Apache 2.0** license. The tokenizer is **MIT**.
- <https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2>

### Why FP16 and not INT8

The pipeline validated with Unity 6.3 LTS (6000.3.19f1) and Inference Engine 2.6.1 uses
FP16. The dynamic INT8 export from `optimum` generates `DynamicQuantizeLinear`,
`MatMulInteger`, and `DequantizeLinear`; the Unity 2.6.1 importer rejects them with
`OnnxImportException` ("unsupported operator(s)").

Do not ship an `.onnx` that Unity cannot import. If you need a smaller model, export a
quantization with operators supported by your version of Inference Engine and test the
import before assigning it. Otherwise, use the hash provider.

---

## 3. Export requirements

You need a machine with:

- **Python 3.10+** and `pip`.
- **~2 GB of free disk space** for the intermediate FP32 export.
- An Internet connection **only during download and export**. The final game works
  offline.
- Unity 6.3 LTS with `com.unity.ai.inference` 2.6.1.

Install the dependencies in a virtual environment:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install "optimum[onnxruntime]" onnx onnxconverter-common
```

> The model is downloaded from Hugging Face with `optimum`. You do not need to download the
> `pytorch_model.bin` weights by hand.

---

## 4. Exporting the model to ONNX FP16

### 4.1 Recommended script

Save this file as `exportar_fp16.py` in an empty working folder:

```python
"""Exporta paraphrase-multilingual-MiniLM-L12-v2 a ONNX FP16."""

import os
from optimum.exporters.onnx import main_export
import onnx
from onnxconverter_common import float16

MODELO_HF = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CARPETA_FP32 = "export_fp32"
SALIDA_FP16 = "model_fp16.onnx"

os.makedirs(CARPETA_FP32, exist_ok=True)
print("Exportando", MODELO_HF, "a FP32...")
main_export(MODELO_HF, output=CARPETA_FP32, task="feature-extraction")

ruta_fp32 = os.path.join(CARPETA_FP32, "model.onnx")
print("Cargando", ruta_fp32)
modelo = onnx.load(ruta_fp32)
modelo16 = float16.convert_float_to_float16(modelo, keep_io_types=True)
onnx.checker.check_model(modelo16)
onnx.save(modelo16, SALIDA_FP16)

print("Listo:", SALIDA_FP16, f"({os.path.getsize(SALIDA_FP16) / 1e6:.0f} MB)")
```

You can also download it from the documentation:

[Download `exportar_fp16.py`](https://xolodev-games.github.io/ecos-docs/downloads/exportar_fp16.py)

### 4.2 Running it

```bash
python exportar_fp16.py
```

Expected result:

```text
Exportando sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 a FP32...
Listo: model_fp16.onnx (236 MB)
```

The script uses `keep_io_types=True`: the graph input and output remain `float32`, and the
runtime performs the internal `Cast`. This is what the Ecos provider expects and it avoids
type incompatibilities in Inference Engine.

### 4.3 Verify before Unity

If you want to check that the file is not corrupted:

```python
import onnx
modelo = onnx.load("model_fp16.onnx")
onnx.checker.check_model(modelo)
print("Entradas:", [i.name for i in modelo.graph.input])
print("Salidas:", [o.name for o in modelo.graph.output])
```

It must load without exceptions and show inputs such as `input_ids`, `attention_mask`, and,
depending on the export, `token_type_ids`. The output is usually `last_hidden_state` or
`sentence_embedding`.

### 4.4 Download the tokenizer

1. Open the model page on Hugging Face.
2. Go to **Files and versions**.
3. Download `sentencepiece.bpe.model` (≈ 4,8 MB).
4. Rename it to `sentencepiece.bpe.model.bytes`.

> **Why `.bytes`.** Unity does not import `.model` files as `TextAsset`. The `.bytes`
> extension exposes the content to `TextAsset.bytes`, which is what
> `EcosProveedorEmbeddingsSentis` consumes.

---

## 5. Installing the model in Unity

1. Create `Assets/Ecos/Modelos/` if it does not exist.
2. Copy:
   - `model_fp16.onnx` as `Assets/Ecos/Modelos/model.onnx`.
   - `sentencepiece.bpe.model.bytes` as
     `Assets/Ecos/Modelos/sentencepiece.bpe.model.bytes`.
3. Wait for the import. The `.onnx` appears as a **ModelAsset**.
4. Add `Ecos ▸ Ecos Bootstrap (Sentis)` to your startup object. Do not use the base
   bootstrap if you want semantics.
5. Assign:
   - `modelo` → `model.onnx`
   - `tokenizador` → `sentencepiece.bpe.model.bytes`
6. Leave `backend = GPUCompute`.
7. Press Play. The Console should show something like:

```text
[Ecos] sentis-xlmr-384d · backend GPUCompute · tokens 128 · umbral 0.45
[Ecos] Semántica precalentada: 42 frases en 380 ms · 42 vectores en caché.
```

If you see "heurística de respaldo," the model did not load. Check the troubleshooting
section.

> **You do not need the model to use Ecos.** You can leave `modelo` and `tokenizador`
> empty and the bootstrap will use the hash provider. The demo and the tests work that way.

---

## 6. Bootstrap settings

| Field | Value | Effect |
| --- | --- | --- |
| `backend` | `GPUCompute` | Uses the GPU. Recommended with FP16. |
| `backend` | `CPU` | Fallback if the GPU does not support the graph. Slower in batch, sufficient per phrase. |
| `longitudMaxima` | `128` | Tokens per phrase. The model supports 512; 128 is enough for actions. |
| `loteMaximo` | `32` | Phrases per inference when pre-warming. |
| `umbral` | `0.45` | Minimum similarity to accept a mapping. |
| `precalentarAlArrancar` | `true` | Resolves all synonyms in one batch inference. |
| `logDiagnostico` | `true` | Shows backend, dimension, inputs/outputs, and timings. |

### The threshold

With this model, hits hover around `0,55` and noise stays at `0,35`. `0,45` is the validated
midpoint.

| Threshold | Effect |
| --- | --- |
| `0,30` | Accepts more mappings; risk of false positives. |
| `0,45` | Balanced (recommended). |
| `0,60` | Very strict: only nearly identical synonyms. |

**Consequence of a low threshold:** a "stealth" action can fall into "fire" and change the
color/affinity. It does not change the fact, but it does change the flavor. If you see odd
categories, raise it.

### Pre-warming

`Start()` collects the `Nombre` and all the `Sinonimos` of the categories, passes them to
the provider in a batch, and fills the cache. Without this, the first phrase of each
category pays for an inference (it may be noticeable as a hitch).

If there are no categories with synonyms, it warns and does nothing. **It is not an error.**

---

## 7. Performance

| Scenario | Typical cost | Notes |
| --- | --- | --- |
| Pre-warming (42 phrases, batch 32) | 300–800 ms | Once at startup. |
| New phrase in cache | ~0 ms | Dictionary lookup only. |
| New phrase not cached (GPU) | 5–20 ms | Depends on the GPU. |
| New phrase not cached (CPU) | 30–120 ms | Avoid on low-end mobile. |
| FP16 model memory | ≈ 250–300 MB | Includes weights and buffers. |

Recommendations:

- Keep `longitudMaxima = 128`; actions are short.
- Leave `precalentarAlArrancar = true` in games with loading screens.
- Use the hash provider in tests and server builds.
- On mobile, try `CPU` with FP16; if you need less memory, use the hash provider or a
  quantized model compatible with your version of Inference Engine.
- Do not call `TryObtenerVector` in `Update`: the mapper only does so when building the
  registry and when classifying new actions.

---

## 8. Diagnostics

Component context menu: **`Diagnóstico del proveedor semántico`**.

```text
[Ecos] sentis-xlmr-384d · backend GPUCompute · tokens 128 · umbral 0.45
       | entradas en caché: 42
```

`EcosProveedorEmbeddingsSentis` exposes:

| Member | Purpose |
| --- | --- |
| `EstaListo` | Model and tokenizer loaded. |
| `Nombre` | `sentis-xlmr-384d`. |
| `Dimension` | 384 (probed on first use). |
| `Backend` | Actual backend. |
| `TokenizadorDescripcion` | Tokenization pipeline. |
| `EntradasEnCache` | Resolved texts. |
| `UmbralSimilitudSugerido` | Configured threshold. |
| `TryObtenerVector(texto, out vector)` | Vector for one phrase. |
| `ObtenerVectoresEnLote(claves, destino)` | Batch. |
| `Precalentar(claves)` | Warms the cache. |
| `Dispose()` | Releases the `Worker` and the buffers. |

---

## 9. Changing the model or using your own

### Another export of the same model

If you already have an FP32 `model.onnx`, you can convert it without downloading again:

```python
import onnx
from onnxconverter_common import float16

modelo = onnx.load("model_fp32.onnx")
modelo16 = float16.convert_float_to_float16(modelo, keep_io_types=True)
onnx.checker.check_model(modelo16)
onnx.save(modelo16, "model_fp16.onnx")
```

### A different model

1. Export the model to ONNX with operators supported by your version of Inference Engine.
   Avoid `DynamicQuantizeLinear`/`MatMulInteger` in 2.6.1.
2. Copy the `.onnx` to `Assets/Ecos/Modelos/` or to the bootstrap's `modelo` field.
3. Keep the XLM-R tokenizer (`sentencepiece.bpe.model.bytes`) if the model is the same
   multilingual MiniLM.
4. Play. If the Console shows `OnnxImportException`, the graph is not compatible: go back
   to the validated FP16 or use the hash provider.

The provider discovers the input/output names (`input_ids`, `attention_mask`,
`token_type_ids`, `last_hidden_state`, or `sentence_embedding`) and the dimension on first
use. If your model uses a different scheme, review `ResolverNombres` and `ProcesarTanda`.
**It is not guaranteed** for architectures other than BERT/XLM-R.

### 9.1. BYOM: bring your own model

BYOM (*Bring Your Own Model*) means Ecos does not force you to use MiniLM or Sentis. The
extension points are Core interfaces; the composer, propagation and quantity curve do not
know which technology is behind them.

| Contract | What it decides | Output |
| --- | --- | --- |
| `IEcosDegradador` | Exaggeration level after a mouth. | `EcosNivelExageracion` (5 classes). |
| `IEcosClasificadorIntencion` | Intention with which it is told. | `EcosIntencion` (6 classes). |
| `IEcosProveedorEmbeddings` | Vector of an action/sentence for elemental mapping. | `EcosVector` + `Dimension` + `UmbralSimilitudSugerido`. |
| `IEcosProveedorEmbeddingsLote` | Optional: resolve many keys at once. | Fills an array of `EcosVector`. |
| `IEcosMapeadorSemantico` | Action -> registered category. | `categoriaId` + `puntuacion`, or `false`. |
| `IEcosReglaPropagacion` | Complete pipeline rule. | Derived `EcoEvento`. |

Minimal custom classifier:

```csharp
using xoloDev.Ecos.Core;

public sealed class MiDegradador : IEcosDegradador
{
    public EcosNivelExageracion Evaluar(in EcoEvento eco, in EcosContextoPropagacion contexto)
    {
        // Your model returns 5 probabilities; pick the class here.
        // Do not return text: only the enum.
        return EcosNivelExageracion.Adornado;
    }
}

public sealed class MiIntencion : IEcosClasificadorIntencion
{
    public EcosIntencion Clasificar(in EcoEvento eco, in EcosContextoPropagacion contexto)
    {
        return EcosIntencion.Advertencia;
    }
}
```

Plug it in without touching the rest:

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConBiblioteca(EcosBibliotecaFragmentos.CrearPorDefecto())
    .ConCategorias(EcosRegistroCategorias.CrearPorDefecto())
    .ConDegradador(new MiDegradador())
    .ConClasificadorIntencion(new MiIntencion())
    .ConProveedorEmbeddings(new MiProveedor()) // optional
    .Construir();
```

If you use the scene component, subclass `EcosBootstrap` and override `CrearDegradador()`,
`CrearClasificadorIntencion()` or `CrearProveedorEmbeddings()`. The included
`EcosBootstrapSentis` only replaces the embeddings provider; it keeps the level and
intention heuristics. For a model that also classifies, use your own subclass or the
builder.

Rules for a healthy BYOM:

- **The model does not return sentences.** Only enums, ids, probabilities or vectors. Text
  still comes from the library.
- **If the model is not ready, fall back.** `EstaListo = false` or a load error must not
  crash the game; return to the hash provider or the heuristic.
- **Calibrate the threshold with your categories.** `UmbralSimilitudSugerido` belongs to
  the provider, not the mapper. A threshold copied from another model may accept noise.
- **Be deterministic.** Same input and same seed must give the same label. If your model
  samples, set temperature 0 or expose a controlled seed.
- **Do not download weights at runtime.** The store package contains no weights and makes
  no network calls. If you distribute your own model, respect its license and size; a
  `.onnx` of hundreds of MB may exceed the Asset Store's 700 MB limit when added to the
  rest of the package.
- **Custom pipeline:** if you replace the whole pipeline, add
  `new EcosReglaDeformacionNarrativa(biblioteca)` after degradation or inversion will not
  happen.

---

## 10. Privacy and network

Everything is local:

- The model is loaded from a project asset.
- There are no HTTP calls at runtime.
- No text is sent to any service.
- The cache lives in memory and dies with the provider.

This is deliberate: the asset must work offline and on consoles/mobile without a backend.

---

## 11. Licenses

| Component | License | Obligation |
| --- | --- | --- |
| `paraphrase-multilingual-MiniLM-L12-v2` | Apache 2.0 | Keep the copyright and license notice if you redistribute the model. |
| XLM-R tokenizer (SentencePiece) | MIT | Keep the notice if you redistribute the tokenizer. |
| Unity Inference Engine | Unity Companion License | Installed as a package dependency. |

The package **does not include** the model or the tokenizer, so it does not redistribute
them. If you include them in your build or in another product, comply with their licenses.
See `Third Party Notices.md` in the package root and
[third parties and model](https://xolodev-games.github.io/ecos-docs/docs/licencias-terceros).

---

## 12. Typical problems

| Symptom | Cause | Solution |
| --- | --- | --- |
| "heurística de respaldo" | `modelo` or `tokenizador` not assigned, or the file did not load. | Assign them in the bootstrap; check the Console. |
| `OnnxImportException` | Unsupported operators/types (typically dynamic INT8). | Use the FP16 exported with `keep_io_types=True`. Do not rename an INT8. |
| Warning `LayerNormalization: Unsupported attribute axis` | The FP16 export includes `axis`; Inference Engine ignores it and uses `-1`, which is correct. | It is informational: no action required. |
| `Dimension = 0` | The model did not load or the input is not `int64`. | Check the Console and the input type. |
| First phrase very slow | Empty cache. | Enable `precalentarAlArrancar`. |
| Absurd categories | Threshold too low or poor synonyms. | Raise `umbral`; review `Sinonimos`. |
| GPU not available | `GPUCompute` backend on unsupported hardware. | Switch to `CPU`. |
| The tokenizer does not compile | It was imported as `.model` and not as `.bytes`. | Rename it to `sentencepiece.bpe.model.bytes`. |
| Runs out of memory on mobile | FP16 + GPU buffers. | Try `CPU`; lower `loteMaximo`; use the hash provider or a smaller compatible model. |
| The FP16 export fails with `onnxconverter-common` | Incompatible `onnx` version. | Use a clean environment with the versions from the `pip install` on this page. |
