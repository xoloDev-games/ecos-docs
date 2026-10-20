# 10 — Modelo semántico (opcional)

El sistema funciona **sin modelo**. El modelo sólo mejora una cosa: decidir a qué
categoría elemental pertenece una acción que el diseñador no etiquetó a mano.

> **No genera texto.** Lee una frase corta, devuelve un vector de 384 números y el
> mapeador busca la categoría más cercana. La frase final sigue saliendo del diccionario.

---

## 1. Qué hace exactamente

```text
acción ("prendió fuego al granero")
   -> tokenizador XLM-R        -> ids
   -> modelo ONNX              -> vector por token
   -> media enmascarada        -> vector de frase (384 dims, normalizado)
   -> similitud coseno         -> categoría más cercana ("fuego")
```

Si la similitud no supera `umbral`, no se asigna categoría y se usa la etiqueta del
diseñador (o ninguna). **Nunca inventa una categoría con baja confianza.**

### Sin modelo: proveedor de respaldo

`EcosProveedorEmbeddingsHash` es determinista, sin dependencias, 96 dimensiones. Compara
por léxico (solapamiento de palabras), no por significado. Es suficiente para prototipos
y tests, y permite que el Core corra headless.

**Qué cambia al activar el modelo:** "acuchilló" y "asesinó" se acercan aunque no
compartan letras; "quemó" y "prendió fuego" caen en la misma categoría. El resto del
sistema (propagación, composición, ficha) es idéntico.

---

## 2. Qué incluye el paquete

El paquete de la Asset Store **no incluye pesos de IA**. La carpeta `Runtime/Modelos/`
contiene un `LEEME.txt` y queda reservada para que tú coloques:

| Fichero | Tamaño | Formato | Uso |
| --- | --- | --- | --- |
| `model.onnx` | ≈ 224–236 MB | FP16 | Modelo de embeddings. Lo exportas tú con el script de esta página. |
| `sentencepiece.bpe.model.bytes` | ≈ 4,8 MB | SentencePiece | Tokenizador XLM-R. Se descarga del repositorio del modelo y se renombra a `.bytes`. |

Modelo recomendado y validado:

- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- XLM-R, 384 dimensiones, 12 capas, ~118 M parámetros.
- Entiende español e inglés de forma nativa.
- Licencia **Apache 2.0**. El tokenizador es **MIT**.
- <https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2>

### Por qué FP16 y no INT8

El flujo validado con Unity 6.3 LTS (6000.3.19f1) e Inference Engine 2.6.1 usa FP16.
El export INT8 dinámico de `optimum` genera `DynamicQuantizeLinear`, `MatMulInteger` y
`DequantizeLinear`; el importador de Unity 2.6.1 los rechaza con `OnnxImportException`
("unsupported operator(s)").

No distribuir un `.onnx` que Unity no puede importar. Si necesitas un modelo más pequeño,
exporta una cuantización con operadores soportados por tu versión de Inference Engine y
prueba el import antes de asignarlo. Si no, usa el proveedor hash.

---

## 3. Requisitos para exportar

Necesitas un equipo con:

- **Python 3.10+** y `pip`.
- **~2 GB de disco libre** para el export FP32 intermedio.
- Conexión a Internet **sólo durante la descarga y el export**. El juego final funciona
  offline.
- Unity 6.3 LTS con `com.unity.ai.inference` 2.6.1.

Instala las dependencias en un entorno virtual:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install "optimum[onnxruntime]" onnx onnxconverter-common
```

> El modelo se descarga desde Hugging Face con `optimum`. No necesitas descargar a mano
> los pesos `pytorch_model.bin`.

---

## 4. Exportar el modelo a ONNX FP16

### 4.1 Script recomendado

Guarda este archivo como `exportar_fp16.py` en una carpeta de trabajo vacía:

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

También puedes descargarlo desde la documentación:

[Descargar `exportar_fp16.py`](https://xolodev-games.github.io/ecos-docs/downloads/exportar_fp16.py)

### 4.2 Ejecutar

```bash
python exportar_fp16.py
```

Resultado esperado:

```text
Exportando sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 a FP32...
Listo: model_fp16.onnx (236 MB)
```

El script usa `keep_io_types=True`: la entrada y la salida del grafo siguen siendo
`float32`, y el runtime hace el `Cast` interno. Esto es lo que espera el proveedor de
Ecos y evita incompatibilidades de tipos en Inference Engine.

### 4.3 Verificar antes de Unity

Si quieres comprobar que el archivo no está corrupto:

```python
import onnx
modelo = onnx.load("model_fp16.onnx")
onnx.checker.check_model(modelo)
print("Entradas:", [i.name for i in modelo.graph.input])
print("Salidas:", [o.name for o in modelo.graph.output])
```

Debe cargar sin excepciones y mostrar entradas tipo `input_ids`, `attention_mask` y,
según el export, `token_type_ids`. La salida suele ser `last_hidden_state` o
`sentence_embedding`.

### 4.4 Descargar el tokenizador

1. Abre la página del modelo en Hugging Face.
2. Entra en **Files and versions**.
3. Descarga `sentencepiece.bpe.model` (≈ 4,8 MB).
4. Renómbralo a `sentencepiece.bpe.model.bytes`.

> **Por qué `.bytes`.** Unity no importa ficheros `.model` como `TextAsset`. La extensión
> `.bytes` expone el contenido a `TextAsset.bytes`, que es lo que consume
> `EcosProveedorEmbeddingsSentis`.

---

## 5. Instalar el modelo en Unity

1. Crea `Assets/Ecos/Modelos/` si no existe.
2. Copia:
   - `model_fp16.onnx` como `Assets/Ecos/Modelos/model.onnx`.
   - `sentencepiece.bpe.model.bytes` como
     `Assets/Ecos/Modelos/sentencepiece.bpe.model.bytes`.
3. Espera el import. El `.onnx` aparece como **ModelAsset**.
4. Añade `Ecos ▸ Ecos Bootstrap (Sentis)` a tu objeto de arranque. No uses el bootstrap
   base si quieres semántica.
5. Asigna:
   - `modelo` → `model.onnx`
   - `tokenizador` → `sentencepiece.bpe.model.bytes`
6. Deja `backend = GPUCompute`.
7. Pulsa Play. En la Consola debe aparecer algo parecido a:

```text
[Ecos] sentis-xlmr-384d · backend GPUCompute · tokens 128 · umbral 0.45
[Ecos] Semántica precalentada: 42 frases en 380 ms · 42 vectores en caché.
```

Si ves "heurística de respaldo", el modelo no se cargó. Revisa la sección de problemas.

> **No necesitas el modelo para usar Ecos.** Puedes dejar `modelo` y `tokenizador`
> vacíos y el bootstrap usará el proveedor hash. La demo y los tests funcionan así.

---

## 6. Ajustes del bootstrap

| Campo | Valor | Efecto |
| --- | --- | --- |
| `backend` | `GPUCompute` | Usa la GPU. Recomendado con FP16. |
| `backend` | `CPU` | Respaldo si la GPU no soporta el grafo. Más lento en lote, suficiente por frase. |
| `longitudMaxima` | `128` | Tokens por frase. El modelo admite 512; 128 basta para acciones. |
| `loteMaximo` | `32` | Frases por inferencia al precalentar. |
| `umbral` | `0.45` | Similitud mínima para aceptar un mapeo. |
| `precalentarAlArrancar` | `true` | Resuelve todos los sinónimos en una inferencia en lote. |
| `logDiagnostico` | `true` | Muestra backend, dimensión, entradas/salidas y tiempos. |

### El umbral

Con este modelo, los aciertos rondan `0,55` y el ruido se queda en `0,35`. `0,45` es el
punto medio validado.

| Umbral | Efecto |
| --- | --- |
| `0,30` | Acepta más mapeos; riesgo de falsos positivos. |
| `0,45` | Equilibrado (recomendado). |
| `0,60` | Muy estricto: sólo sinónimos casi idénticos. |

**Consecuencia de un umbral bajo:** una acción de "sigilo" puede caer en "fuego" y
cambiar el color/afinidad. No cambia el hecho, pero sí el sabor. Si ves categorías
raras, súbelo.

### Precalentamiento

`Start()` recoge el `Nombre` y todos los `Sinonimos` de las categorías, los pasa en lote
al proveedor y llena la caché. Sin esto, la primera frase de cada categoría paga una
inferencia (puede notarse como un tirón).

Si no hay categorías con sinónimos, avisa y no hace nada. **No es un error.**

---

## 7. Rendimiento

| Escenario | Coste típico | Notas |
| --- | --- | --- |
| Precalentamiento (42 frases, lote 32) | 300–800 ms | Una vez al arrancar. |
| Frase nueva en caché | ~0 ms | Sólo búsqueda de diccionario. |
| Frase nueva sin caché (GPU) | 5–20 ms | Depende de la GPU. |
| Frase nueva sin caché (CPU) | 30–120 ms | Evita en móvil de gama baja. |
| Memoria del modelo FP16 | ≈ 250–300 MB | Incluye pesos y buffers. |

Recomendaciones:

- Mantén `longitudMaxima = 128`; las acciones son cortas.
- Deja `precalentarAlArrancar = true` en juegos con carga.
- Usa el proveedor de hash en tests y en builds de servidor.
- En móvil, prueba `CPU` con el FP16; si necesitas menos memoria, usa el proveedor hash
  o un modelo cuantizado compatible con tu versión de Inference Engine.
- No llames a `TryObtenerVector` en `Update`: el mapeador sólo lo hace al construir el
  registro y al clasificar acciones nuevas.

---

## 8. Diagnóstico

Menú contextual del componente: **`Diagnóstico del proveedor semántico`**.

```text
[Ecos] sentis-xlmr-384d · backend GPUCompute · tokens 128 · umbral 0.45
       | entradas en caché: 42
```

`EcosProveedorEmbeddingsSentis` expone:

| Miembro | Para qué |
| --- | --- |
| `EstaListo` | Modelo y tokenizador cargados. |
| `Nombre` | `sentis-xlmr-384d`. |
| `Dimension` | 384 (se sondea al primer uso). |
| `Backend` | Backend real. |
| `TokenizadorDescripcion` | Pipeline de tokenización. |
| `EntradasEnCache` | Textos resueltos. |
| `UmbralSimilitudSugerido` | Umbral configurado. |
| `TryObtenerVector(texto, out vector)` | Vector de una frase. |
| `ObtenerVectoresEnLote(claves, destino)` | Lote. |
| `Precalentar(claves)` | Calienta la caché. |
| `Dispose()` | Libera el `Worker` y los buffers. |

---

## 9. Cambiar de modelo o usar uno propio

### Otro export del mismo modelo

Si ya tienes un `model.onnx` FP32, puedes convertirlo sin volver a descargar:

```python
import onnx
from onnxconverter_common import float16

modelo = onnx.load("model_fp32.onnx")
modelo16 = float16.convert_float_to_float16(modelo, keep_io_types=True)
onnx.checker.check_model(modelo16)
onnx.save(modelo16, "model_fp16.onnx")
```

### Un modelo distinto

1. Exporta el modelo a ONNX con operadores soportados por tu versión de Inference
   Engine. Evita `DynamicQuantizeLinear`/`MatMulInteger` en 2.6.1.
2. Copia el `.onnx` a `Assets/Ecos/Modelos/` o al campo `modelo` del bootstrap.
3. Mantén el tokenizador XLM-R (`sentencepiece.bpe.model.bytes`) si el modelo es el
   mismo MiniLM multilingüe.
4. Play. Si la Consola muestra `OnnxImportException`, el grafo no es compatible: vuelve
   al FP16 validado o usa el proveedor hash.

El proveedor descubre los nombres de entrada/salida (`input_ids`, `attention_mask`,
`token_type_ids`, `last_hidden_state` o `sentence_embedding`) y la dimensión en el primer
uso. Si tu modelo usa otro esquema, revisa `ResolverNombres` y `ProcesarTanda`. **No está
garantizado** para arquitecturas que no sean BERT/XLM-R.

---

## 10. Privacidad y red

Todo es local:

- El modelo se carga desde un asset del proyecto.
- No hay llamadas HTTP en runtime.
- No se envía texto a ningún servicio.
- La caché vive en memoria y muere con el proveedor.

Esto es deliberado: el asset debe funcionar offline y en consolas/móvil sin backend.

---

## 11. Licencias

| Componente | Licencia | Obligación |
| --- | --- | --- |
| `paraphrase-multilingual-MiniLM-L12-v2` | Apache 2.0 | Conservar aviso de copyright y licencia si redistribuyes el modelo. |
| Tokenizador XLM-R (SentencePiece) | MIT | Conservar aviso si redistribuyes el tokenizador. |
| Unity Inference Engine | Unity Companion License | Se instala como dependencia del paquete. |

El paquete **no incluye** el modelo ni el tokenizador, así que no los redistribuye. Si tú
los incluyes en tu build o en otro producto, cumple sus licencias. Consulta
[Terceros y modelo](licencias-terceros).

---

## 12. Problemas típicos

| Síntoma | Causa | Solución |
| --- | --- | --- |
| "heurística de respaldo" | `modelo` o `tokenizador` sin asignar, o el archivo no cargó. | Asígnalos en el bootstrap; revisa la Consola. |
| `OnnxImportException` | Operadores/tipos no soportados (típico INT8 dinámico). | Usa el FP16 exportado con `keep_io_types=True`. No renombres un INT8. |
| Warning `LayerNormalization: Unsupported attribute axis` | El export FP16 incluye `axis`; Inference Engine lo ignora y usa `-1`, que es el correcto. | Es informativo: no requiere acción. |
| `Dimension = 0` | El modelo no se cargó o la entrada no es `int64`. | Revisa la Consola y el tipo de entrada. |
| Primera frase muy lenta | Caché vacía. | Activa `precalentarAlArrancar`. |
| Categorías absurdas | Umbral demasiado bajo o sinónimos pobres. | Sube `umbral`; revisa `Sinonimos`. |
| GPU no disponible | Backend `GPUCompute` en hardware sin soporte. | Cambia a `CPU`. |
| El tokenizador no compila | Se importó como `.model` y no como `.bytes`. | Renómbralo a `sentencepiece.bpe.model.bytes`. |
| Se queda sin memoria en móvil | FP16 + buffers de GPU. | Prueba `CPU`; baja `loteMaximo`; usa el proveedor hash o un modelo compatible más pequeño. |
| El export FP16 falla con `onnxconverter-common` | Versión incompatible de `onnx`. | Usa un entorno limpio con las versiones del `pip install` de esta página. |
