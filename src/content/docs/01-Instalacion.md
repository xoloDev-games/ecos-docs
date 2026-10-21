# 01 — Instalación

## 1. Requisitos

| Requisito | Versión | Notas |
| --- | --- | --- |
| Unity | **6.3 LTS (6000.3)** o superior (probado en 6000.3.19f1) | El runtime usa el namespace `Unity.InferenceEngine` (Inference Engine 2.x). |
| Unity Inference Engine | **2.6.1** | Paquete `com.unity.ai.inference`. Necesario para compilar el proveedor Sentis; el fallback hash no lo usa. |
| Input System | **1.19.0** | Paquete `com.unity.inputsystem`. Sólo lo usa la demo (WASD/ratón); el runtime no depende de él. |
| Render pipeline | Cualquiera | La demo detecta URP (`Universal Render Pipeline/Lit`) y cae a `Standard`/`Unlit`. |
| Sistema opcional | TextMeshPro / UGUI | Sólo si quieres mostrar frases en UI. El motor no depende de ellos. |
| Modelo ONNX | **Opcional, no incluido** | Multilingüe (español + inglés), 384 dimensiones. Descárgalo y expórtalo a FP16 siguiendo el capítulo 10. |
| Tokenizador | **Opcional, no incluido** | `sentencepiece.bpe.model.bytes` (≈ 4,8 MB). Debe importarse como **TextAsset** (por eso la extensión `.bytes`). |

> **Por qué `.bytes`.** Unity no importa ficheros `.model` como `TextAsset`.
> Renombrar `sentencepiece.bpe.model` a `sentencepiece.bpe.model.bytes` expone sus
> bytes a `TextAsset.bytes`, que es lo que consume `EcosProveedorEmbeddingsSentis`.

> **El paquete no incluye el modelo.** Ecos funciona sin él usando
> `EcosProveedorEmbeddingsHash` (similitud léxica determinista). Si quieres clasificación
> semántica, descarga el modelo recomendado y expórtalo a ONNX FP16; el paso a paso está
> en [10 — Modelo semántico](10-SemanticaONNX.md).

## 2. Instalación como paquete (recomendada)

1. Descarga `dev.xolodev.ecos-1.2.0.tgz`.
2. En Unity: **Window ▸ Package Manager ▸ + ▸ Add package from tarball…**
3. Selecciona el `.tgz`.
4. Acepta la instalación de la dependencia `com.unity.ai.inference` si te la pide.
5. (Opcional) **Window ▸ Package Manager ▸ Ecos ▸ Samples ▸ Import** para traer la demo.

El paquete deja tres ensamblados:

| Ensamblado | Ruta | Contenido |
| --- | --- | --- |
| `xoloDev.Ecos.Core` | `Runtime/Core` | Dominio puro, **sin referencias a Unity** (`noEngineReferences: true`). |
| `xoloDev.Ecos` | `Runtime/Ecos` | Componentes, fachada, assets, Sentis. |
| `xoloDev.Ecos.Editor` | `Editor` | Inspectores y ventana de depuración. |

Los scripts de la demo viven en `Samples~` y, al importarlos, caen en
`Assembly-CSharp` / `Assembly-CSharp-Editor` (sólo hay que tener el paquete instalado).

## 3. Instalación manual (carpeta `Assets`)

Si prefieres no usar UPM:

1. Copia el contenido de `Runtime/` a `Assets/Ecos/Runtime/` y el de `Editor/` a
   `Assets/Ecos/Editor/` (y `Documentation~` si quieres el manual).
2. Si quieres la demo, copia el **contenido** de `Samples~/Demo` a `Assets/Ecos/Demo/`
   (sin la virgulilla: una carpeta `Samples~` dentro de `Assets` no se compila).
3. **Opcional:** si vas a usar el modelo, deja los archivos junto al resto del runtime:
   - `Assets/Ecos/Modelos/model.onnx` (FP16)
   - `Assets/Ecos/Modelos/sentencepiece.bpe.model.bytes`
4. Espera a que Unity importe el `.onnx` (aparecerá como **ModelAsset**).
5. Comprueba la Consola: no debe haber `OnnxImportException`. Si no usas modelo, este
   paso no aplica.

## 4. Verificación en tres pasos

1. **Menú `Ecos ▸ Construir Escena de Demo`**.
   - Crea `Assets/Ecos/Demo/EcosDemo.unity` con todo cableado.
   - Muestra un diálogo resumen con lo que ha construido.
2. **Play**. Camina con WASD hacia los cubos de colores.
3. **Consola**: verás `[Ecos] Emitido: …` y `[Ecos] NPC n -> NPC m : …` con el
   nivel subiendo y la credibilidad cayendo. Sin modelo, el sistema usa el proveedor hash
   y sigue funcionando.

Si algo falla, [13 — Solución de problemas](13-Problemas.md).

## 5. Qué NO debes tocar

- **`.meta` de tus assets**: los gestiona Unity.
- **La carpeta `Modelos`** (si la usas): si mueves el `.onnx`, reasigna el campo del
  `EcosBootstrapSentis` o usa el constructor de demo, que lo localiza por tipo.

## 6. Actualización de versión

1. Sustituye la carpeta/tarball del paquete.
2. Reconstruye la escena de demo si la usabas: `Ecos ▸ Construir Escena de Demo`
   (es idempotente: reutiliza assets y sólo reescribe la escena).
3. Revisa `CHANGELOG.md` del paquete.

## 7. Desinstalación

1. **Window ▸ Package Manager ▸ Ecos ▸ Remove**.
2. Borra los assets que hayas generado fuera del paquete (por ejemplo
   `Assets/Ecos/Demo/`) si no los quieres.
3. No queda estado persistente: el sistema no escribe ficheros ni usa PlayerPrefs.
