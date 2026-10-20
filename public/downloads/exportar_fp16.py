"""Exporta paraphrase-multilingual-MiniLM-L12-v2 a ONNX FP16.

Requisitos:
    pip install "optimum[onnxruntime]" onnx onnxconverter-common

Uso:
    python exportar_fp16.py

Genera:
    export_fp32/model.onnx   (intermedio, ~470 MB)
    model_fp16.onnx          (para Unity, ~224-236 MB)

En Unity:
    1. Copia model_fp16.onnx como Assets/Ecos/Modelos/model.onnx
    2. Descarga sentencepiece.bpe.model del repositorio del modelo y renómbralo
       a sentencepiece.bpe.model.bytes
    3. Asigna ambos al componente Ecos Bootstrap (Sentis)
"""

import os

import onnx
from onnxconverter_common import float16
from optimum.exporters.onnx import main_export

MODELO_HF = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CARPETA_FP32 = "export_fp32"
SALIDA_FP16 = "model_fp16.onnx"


def main() -> int:
    os.makedirs(CARPETA_FP32, exist_ok=True)

    print(f"Exportando {MODELO_HF} a FP32...")
    main_export(MODELO_HF, output=CARPETA_FP32, task="feature-extraction")

    ruta_fp32 = os.path.join(CARPETA_FP32, "model.onnx")
    if not os.path.exists(ruta_fp32):
        raise SystemExit(f"optimum no generó {ruta_fp32}")

    print(f"Cargando {ruta_fp32} ({os.path.getsize(ruta_fp32) / 1e6:.0f} MB)...")
    modelo = onnx.load(ruta_fp32)

    print("Casteando a FP16 (keep_io_types=True)...")
    modelo16 = float16.convert_float_to_float16(modelo, keep_io_types=True)
    onnx.checker.check_model(modelo16)
    onnx.save(modelo16, SALIDA_FP16)

    print(f"Listo: {SALIDA_FP16} ({os.path.getsize(SALIDA_FP16) / 1e6:.0f} MB)")
    print("")
    print("Siguiente paso:")
    print("  - Copia model_fp16.onnx como Assets/Ecos/Modelos/model.onnx")
    print("  - Descarga sentencepiece.bpe.model y renómbralo a .bytes")
    print("  - Asígnalos al Ecos Bootstrap (Sentis)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
