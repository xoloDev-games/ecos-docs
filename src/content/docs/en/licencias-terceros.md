# Third parties and model

Ecos does not include AI weights in the Asset Store distribution. The recommended model is
an optional external component that the developer downloads and exports on their own.

## Recommended model

- **Model:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Source:** <https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2>
- **License:** Apache License 2.0
- **Copyright:** UKPLab / sentence-transformers contributors
- **Use in Ecos:** semantic similarity; it never generates text.

The model is not distributed inside the package. By downloading it, the user accepts the
original author's Apache 2.0 license. The full text is available at:

- <https://www.apache.org/licenses/LICENSE-2.0>

### Obligations if you redistribute the model

If you later include the model in your build or in another product, you must:

- retain the copyright and license notices;
- include a copy of Apache 2.0;
- state whether you modified the files;
- not use the original author's trademarks as if they were your own.

## XLM-R SentencePiece tokenizer

- **Recommended file:** `sentencepiece.bpe.model` (renamed to `.bytes` in Unity)
- **License:** MIT
- **Copyright:** Facebook AI Research (XLM-R) and SentencePiece contributors
- **Source:** <https://github.com/google/sentencepiece> and
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

- **Unity Inference Engine (`com.unity.ai.inference`):** Unity Companion License. It
  is installed as a dependency; it is not redistributed inside the package.
- **Unity modules:** `com.unity.modules.physics` and `com.unity.modules.imgui` are declared
  as manifest dependencies.
- **ONNX Runtime:** only used in the optional `ECOS_ONNX` provider; it is not redistributed.
  MIT License (Microsoft).

## Your own model

If you provide a different model, its license is your responsibility. Check that it allows
commercial use, redistribution and modification before including it in a build.
