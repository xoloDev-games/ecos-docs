# 14 — Packaging and selling

This document describes **what is delivered**, **how it is rebuilt** and **what to check**
before publishing. The generated package is in `dist/`.

---

## 1. Delivery format

It is delivered as a **UPM package** (`.tgz` + installable folder), not as a `.unitypackage`.

Advantages:

- Unity installs it with **Package Manager ▸ Add package from tarball**.
- It is updated per version without duplicating scripts.
- It separates `Runtime`, `Editor`, `Samples~` and `Documentation~`.
- It avoids the classic conflict with `.meta` files and duplicated asmdefs.

> If the store requires a `.unitypackage`, it can be generated separately, but it must
> **not** be installed at the same time as the UPM package: the `xoloDev.Ecos*` assemblies
> would be duplicated.

---

## 2. Package structure

```
dev.xolodev.ecos/
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

### Why `Runtime/Core` and `Runtime/Ecos`

Two assemblies with separate asmdefs:

- `xoloDev.Ecos.Core`: `noEngineReferences: true`, testable with `dotnet test`.
- `xoloDev.Ecos`: MonoBehaviour, assets, Sentis.

If they were placed in the same folder, Unity would create a single assembly and Core would
drag in a Unity dependency.

### Why `Runtime/Modelos` is left empty

The Asset Store distribution **does not include weights**. The package folder is read-only
and only contains a `LEEME.txt`; the buyer places their `model.onnx` and tokenizer in
`Assets/Ecos/Modelos`. The demo builder locates them by type (`model t:ModelAsset`) whether
they are in the project or inside the package. If there is no model, the bootstrap uses the
hash provider and the demo is built anyway.

The development variant (`empaquetar.ps1` without `-SinModelo`) may include the FP16 for
internal validation, but **it is not the variant uploaded to the store**.

### Why `Documentation~` and `Samples~` have a tilde

Unity does not import them into the project until the user asks for them:

- `Documentation~` is shown in the Package Manager.
- `Samples~` is imported with **Samples ▸ Import**.

Without the tilde, the demo scripts would always compile and the manual would appear as
assets.

---

## 3. `package.json`

```json
{
  "name": "dev.xolodev.ecos",
  "version": "1.2.0",
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
      "description": "Escena generada con 6 hechos, 6 NPCs y cadenas visibles.",
      "path": "Samples~/Demo"
    }
  ]
}
```

`author.name` must match the publisher name on the Asset Store. Add `author.email`,
`author.url`, `documentationUrl`, `licensesUrl` and `changelogUrl` with real URLs before
publishing. The Asset Store UPM manifest requires at a minimum: `name`, `displayName`,
`version`, `unity`, `unityRelease`, `author` and `description`.

---

## 4. Models and size

The store delivery uses **`-SinModelo`**:

| Content | Size | Included? |
| --- | --- | --- |
| Code + docs + demo | < 1 MB | Yes. |
| `Runtime/Modelos/LEEME.txt` | < 1 KB | Yes. |
| `model.onnx` FP16 | ≈ 224 MB | **No.** The buyer exports it. |
| Tokenizer | ≈ 4.8 MB | **No.** The buyer downloads it. |
| **Total store package** | **≈ 1 MB** | |

The Asset Store limits products distributed through UPM to **700 MB**. Because it does not
include weights, the package stays well below that limit and avoids the friction of
third-party licenses that require attribution. The download and FP16 export guide lives in
[10 — Semantic model](10-SemanticaONNX.md).

Do not include a dynamic INT8: it uses `DynamicQuantizeLinear`/`MatMulInteger`, which
Inference Engine 2.6.1 rejects on import. If you ever distribute the model, use a validated
FP16 or a quantization with supported operators.

> **Golden rule:** the `.tgz` you upload to the store must not contain `model.onnx` or
> `sentencepiece.bpe.model.bytes`. Check it before submitting.

---

## 5. Rebuilding the package

From the repository root, for the **store delivery**:

```powershell
powershell -ExecutionPolicy Bypass -File .\empaquetar.ps1 -SinModelo
```

For an internal validation with the FP16 (never for the store):

```powershell
powershell -ExecutionPolicy Bypass -File .\empaquetar.ps1
```

Options:

```powershell
.\empaquetar.ps1 -SinModelo             # sin pesos (BYO model) — usar para la tienda
.\empaquetar.ps1 -SinTar                # sólo la carpeta, sin .tgz
.\empaquetar.ps1 -Version 1.2.0         # cambia la versión SemVer
```

The script:

1. Cleans `dist/dev.xolodev.ecos`.
2. Copies Core, Runtime, Editor and Docs.
3. With `-SinModelo`, writes `Runtime/Modelos/LEEME.txt` and does not copy weights.
4. Without `-SinModelo`, copies the FP16 and the tokenizer for development.
5. Copies the demo to `Samples~/Demo`.
6. Generates `package.json`, `README`, `CHANGELOG`, `LICENSE`, `LICENSE-APACHE-2.0.txt`
   and `Third Party Notices`.
7. Generates a deterministic `.meta` for each asset (Unity ignores assets without `.meta`
   inside an immutable package).
8. Creates `dist/dev.xolodev.ecos-<version>.tgz` with the `package/` folder at the root.
9. Writes `dist/README.md` (delivery instructions) and `dist/SHA256.txt`.

---

## 6. Testing the package before selling

1. Create an **empty** Unity project (6000.3 + URP or Built-in).
2. `Window ▸ Package Manager ▸ + ▸ Add package from tarball` → the `.tgz`.
3. Import the **Demo (6 saltos)** sample.
4. Run `Ecos ▸ Construir Escena de Demo`.
5. Play: check the 6-hop chain and the figures **without a model** (hash provider).
6. Test in **another language** with the EN library (or change `Application.systemLanguage`).
7. Add the exported FP16 model and check that the bootstrap detects it.
8. Test on **CPU**: change `backend`; it must load.
9. Check that there are **no** compilation errors in the Console.
10. Close and reopen the project: the assets must still be referenced and the package without
    a model must still work.
11. Enable **URP** (17.3.0) and rebuild the demo: materials must use
    `Universal Render Pipeline/Lit`; also produce a standalone build.

### Content checklist

- [ ] `package.json` with version, dependencies and sample.
- [ ] `README.md` (EN) and `README.es.md`.
- [ ] `CHANGELOG.md` with the version.
- [ ] `LICENSE.md` (EULA or your own license).
- [ ] `Third Party Notices.md` (optional model Apache 2.0, tokenizer MIT).
- [ ] `LICENSE-APACHE-2.0.txt` with the full Apache 2.0 text (reference).
- [ ] `Documentation~/index.md` and the 14 chapters, with the project pages (ES/EN).
- [ ] Diagrams `arquitectura.png`, `flujo-eco.png`.
- [ ] Demo materials compatible with Built-in and URP.
- [ ] `Runtime/Core` without `UnityEngine`.
- [ ] `Runtime/Ecos` with asmdef and dependencies.
- [ ] `Editor` with an editor-only asmdef.
- [ ] `Samples~/Demo` with the 4 scripts and their README.
- [ ] `Runtime/Modelos/LEEME.txt` and **no** `.onnx` or tokenizer.
- [ ] `.meta` for every asset (mandatory in the package's immutable folder).
- [ ] No `Library`, `Temp`, `obj`, `bin`, `.vs`.
- [ ] No keys, absolute paths or personal files.

---

## 7. Versioning

Use **SemVer**:

- `1.0.0` — first sellable version.
- `1.0.x` — fixes without API changes.
- `1.x.0` — new compatible fields/components.
- `2.0.0` — changes that break the API or the data.

Update:

1. `package.json` → `version`.
2. `CHANGELOG.md` → version section.
3. The `README` if the requirements change.
4. The `.tgz`.

---

## 8. Publishing on the Unity Asset Store

1. Create the package and test it in a clean project (section 6).
2. Sign up for **UPM Publishing** and complete the publisher identity verification.
3. Prepare the listing images (at least one screenshot of the demo and one of the Inspector).
4. Upload the `.tgz` as a UPM **Package**. The Asset Store accepts UPM; confirm the exact flow
   in the publisher portal.
5. Declare the `com.unity.ai.inference` dependency; the buyer must install it.
6. Include in `Third Party Notices.md` the reference to the **optional** Apache 2.0 model and
   to the MIT tokenizer, and the full Apache 2.0 text in `LICENSE-APACHE-2.0.txt`.
7. **Do not include the model in the `.tgz`.** The store variant is `-SinModelo`; the buyer
   downloads and exports the FP16 following the documentation. This avoids the friction of
   clause 1.2.b of the Submission Guidelines with third-party licenses that require
   attribution. Even so, declare the optional external dependency in the listing.
8. In the description, make it clear:
   - **It does not generate text with AI**: it uses dictionaries.
   - Requires Unity 6.3 LTS (6000.3)+ and Inference Engine 2.6.1.
   - The model is **optional and not included**; the multilingual MiniLM is recommended.
   - The package includes a working demo that runs without a model.
9. Support: state `xoloDev.games@gmail.com`, the documentation repository and the target
   response time (24–48 business hours).

### What to highlight in the listing

- **Zero Hallucinations**: no variant is generated; the inverse one is declared and the
  original fact is preserved.
- **Quantities that rise and fall on their own**: 10 → 2 → 110 bandits; 500 → 450 →
  1,800 m, without manual per-level tables.
- **Declared narrative turn**: `regicidio` → `salvar_rey` at Distorted, with original-fact
  traceability.
- **6 visible hops** with one mouth per hop.
- **Multiplayer isolated** by scope, with anonymized bridges.
- **Deterministic**: same seed, same story.
- **Edge**: no server, no mandatory GPU, no network calls.
- **Bilingual** ES/EN with the same model.

---

## 9. License (template)

`LICENSE.md` must reflect your decision. A common option for code assets:

> The buyer is granted a perpetual, worldwide, non-exclusive license to use, modify and
> integrate the asset into commercial and non-commercial projects. Redistributing, selling
> or sublicensing the source code, the documentation or the data as a standalone asset,
> template or competing product is not permitted. The asset is delivered "as is", without
> warranty.

The recommended model is not part of the package and retains its Apache 2.0 license. If you
sell on the Unity Asset Store, the **Unity Asset Store EULA** prevails; include a reference
and do not contradict its terms. Review the license with an advisor before publishing.

---

## 10. Support and updates

- Include an FAQ section in the README.
- Keep a support channel and a response time.
- For bugs, ask for: Unity version, Inference Engine version, backend, Console log and steps
  to reproduce.
- For design questions, link to [11 — Recipes](11-Recetas.md) and
  [04 — Configuration](04-Configuracion.md).
