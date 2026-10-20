# 14 — Empaquetado y venta

Este documento describe **qué se entrega**, **cómo se reconstruye** y **qué revisar**
antes de publicar. El paquete generado está en `dist/`.

---

## 1. Formato de entrega

Se entrega como **paquete UPM** (`.tgz` + carpeta instalable), no como `.unitypackage`.

Ventajas:

- Unity lo instala con **Package Manager ▸ Add package from tarball**.
- Se actualiza por versión sin duplicar scripts.
- Separa `Runtime`, `Editor`, `Samples~` y `Documentation~`.
- Evita el clásico conflicto de `.meta` y de asmdefs duplicados.

> Si la tienda exige `.unitypackage`, se puede generar aparte, pero **no** se debe
> instalar a la vez que el UPM: los ensamblados `xoloDev.Ecos*` se duplicarían.

---

## 2. Estructura del paquete

```
com.xolodev.ecos/
├── package.json
├── README.md
├── README.es.md
├── CHANGELOG.md
├── LICENSE.md
├── LICENSE-APACHE-2.0.txt
├── Third Party Notices.md
├── Runtime/
│   ├── Core/
│   │   ├── xoloDev.Ecos.Core.asmdef
│   │   └── ... (dominio puro, sin Unity)
│   ├── Ecos/
│   │   ├── xoloDev.Ecos.asmdef
│   │   ├── Componentes/
│   │   ├── Configuracion/
│   │   ├── Facade/
│   │   ├── Sentis/
│   │   └── Onnx/            (opcional, tras #if ECOS_ONNX)
│   └── Modelos/
│       └── LEEME.txt                (modelo opcional: lo aporta el comprador)
├── Editor/
│   ├── xoloDev.Ecos.Editor.asmdef
│   ├── EcosInspectores.cs
│   └── EcosVentanaDebug.cs
├── Documentation~/
│   ├── index.md
│   ├── 01-Instalacion.md
│   ├── ...
│   └── arquitectura.png / flujo-eco.png
└── Samples~/
    └── Demo/
        ├── README.md
        ├── EcosCamaraTerceraPersona.cs
        ├── EcosMovimientoJugador.cs
        ├── EcosPuenteTexto.cs
        └── Editor/EcosDemoBuilder.cs
```

### Por qué `Runtime/Core` y `Runtime/Ecos`

Dos ensamblados con asmdefs separados:

- `xoloDev.Ecos.Core`: `noEngineReferences: true`, testeable con `dotnet test`.
- `xoloDev.Ecos`: MonoBehaviour, assets, Sentis.

Si se pusieran en la misma carpeta, Unity crearían un solo ensamblado y el Core
arrastraría dependencia de Unity.

### Por qué `Runtime/Modelos` queda vacío

La distribución de la Asset Store **no incluye pesos**. La carpeta del paquete es de solo
lectura y sólo contiene un `LEEME.txt`; el comprador deja su `model.onnx` y su tokenizador
en `Assets/Ecos/Modelos`. El constructor de demo los localiza por tipo
(`model t:ModelAsset`) tanto si están en el proyecto como si están dentro del paquete. Si
no hay modelo, el bootstrap usa el proveedor hash y la demo se construye igualmente.

La variante de desarrollo (`empaquetar.ps1` sin `-SinModelo`) sí puede incluir el FP16
para validación interna, pero **no es la variante que se sube a la tienda**.

### Por qué `Documentation~` y `Samples~` llevan virgulilla

Unity no los importa al proyecto hasta que el usuario lo pide:

- `Documentation~` se muestra en el Package Manager.
- `Samples~` se importa con **Samples ▸ Import**.

Sin la virgulilla, los scripts de demo se compilarían siempre y el manual aparecería como
assets.

---

## 3. `package.json`

```json
{
  "name": "com.xolodev.ecos",
  "version": "1.1.0",
  "displayName": "Ecos — Rumor Propagation & Degradation",
  "description": "Propagación boca a boca de rumores entre NPCs con degradación procedural, cantidades escalables y cero alucinaciones. Multilingüe ES/EN, Edge AI, determinista.",
  "unity": "6000.3",
  "unityRelease": "19f1",
  "license": "See LICENSE.md",
  "dependencies": {
    "com.unity.ai.inference": "2.6.1",
    "com.unity.inputsystem": "1.19.0",
    "com.unity.modules.physics": "1.0.0",
    "com.unity.modules.imgui": "1.0.0"
  },
  "keywords": ["npc", "rumor", "narrative", "procedural", "ai", "edge", "sentis"],
  "author": { "name": "xoloDev" },
  "samples": [
    {
      "displayName": "Demo (6 saltos)",
      "description": "Escena generada con 5 hechos, 6 NPCs y cadenas visibles.",
      "path": "Samples~/Demo"
    }
  ]
}
```

`author.name` debe coincidir con el nombre de publisher de la Asset Store. Añade
`author.email`, `author.url`, `documentationUrl`, `licensesUrl` y `changelogUrl` con URLs
reales antes de publicar. El manifiesto UPM de Asset Store exige como mínimo: `name`,
`displayName`, `version`, `unity`, `unityRelease`, `author` y `description`.

---

## 4. Modelos y tamaño

La entrega de tienda usa **`-SinModelo`**:

| Contenido | Tamaño | ¿Incluido? |
| --- | --- | --- |
| Código + docs + demo | < 1 MB | Sí. |
| `Runtime/Modelos/LEEME.txt` | < 1 KB | Sí. |
| `model.onnx` FP16 | ≈ 224 MB | **No.** Lo exporta el comprador. |
| Tokenizador | ≈ 4,8 MB | **No.** Lo descarga el comprador. |
| **Total del paquete de tienda** | **≈ 1 MB** | |

La Asset Store limita los productos distribuidos por UPM a **700 MB**. Al no incluir
pesos, el paquete queda muy por debajo y evita la fricción de licencias de terceros que
exigen atribución. La guía de descarga y export FP16 vive en
[10 — Modelo semántico](10-SemanticaONNX.md).

No incluyas INT8 dinámico: usa `DynamicQuantizeLinear`/`MatMulInteger`, que Inference
Engine 2.6.1 rechaza al importar. Si algún día distribuyes el modelo, usa FP16 validado o
una cuantización con operadores soportados.

> **Regla de oro:** el `.tgz` que subes a la tienda no debe contener `model.onnx` ni
> `sentencepiece.bpe.model.bytes`. Compruébalo antes de enviar.

---

## 5. Reconstruir el paquete

Desde la raíz del repositorio, para la **entrega de tienda**:

```powershell
powershell -ExecutionPolicy Bypass -File .\empaquetar.ps1 -SinModelo
```

Para una validación interna con el FP16 (nunca para la tienda):

```powershell
powershell -ExecutionPolicy Bypass -File .\empaquetar.ps1
```

Opciones:

```powershell
.\empaquetar.ps1 -SinModelo             # sin pesos (BYO model) — usar para la tienda
.\empaquetar.ps1 -SinTar                # sólo la carpeta, sin .tgz
.\empaquetar.ps1 -Version 1.1.0         # cambia la versión SemVer
```

El script:

1. Limpia `dist/com.xolodev.ecos`.
2. Copia Core, Runtime, Editor y Docs.
3. Con `-SinModelo`, escribe `Runtime/Modelos/LEEME.txt` y no copia pesos.
4. Sin `-SinModelo`, copia el FP16 y el tokenizador para desarrollo.
5. Copia la demo a `Samples~/Demo`.
6. Genera `package.json`, `README`, `CHANGELOG`, `LICENSE`, `LICENSE-APACHE-2.0.txt`
   y `Third Party Notices`.
7. Genera un `.meta` determinista para cada asset (Unity ignora los assets sin `.meta`
   dentro de un paquete inmutable).
8. Crea `dist/com.xolodev.ecos-<version>.tgz` con la carpeta `package/` en la raíz.
9. Escribe `dist/README.md` (instrucciones de entrega) y `dist/SHA256.txt`.

---

## 6. Probar el paquete antes de vender

1. Crea un proyecto Unity **vacío** (6000.3 + URP o Built-in).
2. `Window ▸ Package Manager ▸ + ▸ Add package from tarball` → el `.tgz`.
3. Importa el sample **Demo (6 saltos)**.
4. Ejecuta `Ecos ▸ Construir Escena de Demo`.
5. Play: comprueba la cadena de 6 y las cifras **sin modelo** (proveedor hash).
6. Prueba en **otro idioma** con la biblioteca EN (o cambia `Application.systemLanguage`).
7. Añade el modelo FP16 exportado y comprueba que el bootstrap lo detecta.
8. Prueba en **CPU**: cambia `backend`; debe cargar.
9. Comprueba que **no** hay errores de compilación en Consola.
10. Cierra y reabre el proyecto: los assets deben seguir referenciados y el paquete sin
    modelo debe seguir funcionando.

### Checklist de contenido

- [ ] `package.json` con versión, dependencias y sample.
- [ ] `README.md` (EN) y `README.es.md`.
- [ ] `CHANGELOG.md` con la versión.
- [ ] `LICENSE.md` (EULA o licencia propia).
- [ ] `Third Party Notices.md` (modelo opcional Apache 2.0, tokenizador MIT).
- [ ] `LICENSE-APACHE-2.0.txt` con el texto completo de Apache 2.0 (referencia).
- [ ] `Documentation~/index.md` y los 14 documentos.
- [ ] Diagramas `arquitectura.png`, `flujo-eco.png`.
- [ ] `Runtime/Core` sin `UnityEngine`.
- [ ] `Runtime/Ecos` con asmdef y dependencias.
- [ ] `Editor` con asmdef editor-only.
- [ ] `Samples~/Demo` con los 4 scripts y su README.
- [ ] `Runtime/Modelos/LEEME.txt` y **ningún** `.onnx` ni tokenizador.
- [ ] `.meta` para todos los assets (obligatorio en la carpeta inmutable del paquete).
- [ ] Sin `Library`, `Temp`, `obj`, `bin`, `.vs`.
- [ ] Sin claves, rutas absolutas ni archivos personales.

---

## 7. Versionado

Usa **SemVer**:

- `1.0.0` — primera versión vendible.
- `1.0.x` — correcciones sin cambios de API.
- `1.x.0` — campos/componentes nuevos compatibles.
- `2.0.0` — cambios que rompen API o datos.

Actualiza:

1. `package.json` → `version`.
2. `CHANGELOG.md` → sección de la versión.
3. `README` si cambian requisitos.
4. El `.tgz`.

---

## 8. Publicación en Unity Asset Store

1. Crea el paquete y pruébalo en un proyecto limpio (sección 6).
2. Inscríbete en **UPM Publishing** y completa la verificación de identidad del publisher.
3. Prepara las imágenes de la ficha (al menos una captura de la demo y una del Inspector).
4. Sube el `.tgz` como **Package** UPM. La Asset Store acepta UPM; confirma el flujo exacto
   en el portal de publisher.
5. Declara la dependencia `com.unity.ai.inference`; el comprador debe instalarla.
6. Incluye en `Third Party Notices.md` la referencia al modelo **opcional** Apache 2.0 y al
   tokenizador MIT, y el texto completo de Apache 2.0 en `LICENSE-APACHE-2.0.txt`.
7. **No incluyas el modelo en el `.tgz`.** La variante de tienda es `-SinModelo`; el
   comprador descarga y exporta el FP16 siguiendo la documentación. Esto evita la fricción
   de la cláusula 1.2.b de las Submission Guidelines con licencias de terceros que exigen
   atribución. Aun así, declara la dependencia externa opcional en la ficha.
8. En la descripción, deja claro:
   - **No genera texto con IA**: usa diccionarios.
   - Requiere Unity 6.3 LTS (6000.3)+ e Inference Engine 2.6.1.
   - El modelo es **opcional y no incluido**; se recomienda el MiniLM multilingüe.
   - El paquete incluye una demo funcional que funciona sin modelo.
9. Soporte: indica `xoloDev.games@gmail.com`, el repositorio de documentación y el tiempo
   de respuesta objetivo (24–48 h laborables).

### Qué destacar en la ficha

- **Cero alucinaciones**: el hecho nunca cambia de verbo ni de paciente.
- **Cantidades que escalan**: 10 → 1000 bandidos; 500 → 1300 m.
- **6 saltos visibles** con una boca por salto.
- **Multijugador aislado** por scope, con puentes anonimizados.
- **Determinista**: misma semilla, misma historia.
- **Edge**: sin servidor, sin GPU obligatoria, sin llamadas de red.
- **Bilingüe** ES/EN con el mismo modelo.

---

## 9. Licencia (plantilla)

`LICENSE.md` debe reflejar tu decisión. Una opción habitual para assets de código:

> Se concede al comprador una licencia perpetua, mundial y no exclusiva para usar,
> modificar e integrar el asset en proyectos comerciales y no comerciales. No se permite
> redistribuir, vender o sublicenciar el código fuente, la documentación o los datos como
> asset independiente, plantilla o producto competidor. El asset se entrega "tal cual",
> sin garantía.

El modelo recomendado no forma parte del paquete y conserva su licencia Apache 2.0. Si
vendes en Unity Asset Store, prevalece el **Unity Asset Store EULA**; incluye una
referencia y no contradigas sus términos. Revisa la licencia con un asesor antes de
publicar.

---

## 10. Soporte y actualizaciones

- Incluye una sección de preguntas frecuentes en el README.
- Mantén un canal de soporte y un plazo de respuesta.
- Para bugs, pide: versión de Unity, versión de Inference Engine, backend, log de
  Consola y pasos para reproducir.
- Para dudas de diseño, enlaza a [11 — Recetas](11-Recetas.md) y
  [04 — Configuración](04-Configuracion.md).
