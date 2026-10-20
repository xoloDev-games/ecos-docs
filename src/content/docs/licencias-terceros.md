# Terceros y modelo

Ecos no incluye pesos de IA en la distribución de la Asset Store. El modelo recomendado es
un componente externo opcional que el desarrollador descarga y exporta por su cuenta.

## Modelo recomendado

- **Modelo:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Origen:** <https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2>
- **Licencia:** Apache License 2.0
- **Copyright:** UKPLab / sentence-transformers contributors
- **Uso en Ecos:** similitud semántica; nunca genera texto.

El modelo no se distribuye dentro del paquete. Al descargarlo, el usuario acepta la
licencia Apache 2.0 del autor original. El texto completo está en:

- <https://www.apache.org/licenses/LICENSE-2.0>

### Obligaciones si redistribuyes el modelo

Si en el futuro incluyes el modelo dentro de tu build o de otro producto, debes:

- conservar los avisos de copyright y licencia;
- incluir una copia de Apache 2.0;
- indicar si modificaste los archivos;
- no usar las marcas del autor original como si fueran tuyas.

## Tokenizador XLM-R SentencePiece

- **Archivo recomendado:** `sentencepiece.bpe.model` (renombrado a `.bytes` en Unity)
- **Licencia:** MIT
- **Copyright:** Facebook AI Research (XLM-R) y SentencePiece contributors
- **Origen:** <https://github.com/google/sentencepiece> y
  <https://huggingface.co/xlm-roberta-base>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

## Unity

- **Unity Inference Engine (`com.unity.ai.inference`):** Unity Companion License. Se
  instala como dependencia; no se redistribuye dentro del paquete.
- **Módulos de Unity:** `com.unity.modules.physics` y `com.unity.modules.imgui` se declaran
  como dependencias del manifiesto.
- **ONNX Runtime:** sólo se usa en el proveedor opcional `ECOS_ONNX`; no se redistribuye.
  Licencia MIT (Microsoft).

## Tu propio modelo

Si aportas un modelo distinto, su licencia es responsabilidad tuya. Comprueba que permite
uso comercial, redistribución y modificación antes de incluirlo en un build.
