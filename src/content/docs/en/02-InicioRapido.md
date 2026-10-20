# 02 — Quick start (a playable scene in 10 minutes)

There are two paths: **generate the demo** (0 code, 1 click) or **build it by hand** (you understand
each piece). Start with the demo and then come back here.

---

## A. The 1-click path

1. Install the package ([01 — Installation](01-Instalacion.md)). The model is optional; the
   demo works without it using the hash provider.
2. Menu **`Ecos ▸ Construir Escena de Demo`**.
3. Press **Play** and walk with **WASD** toward the colored cubes.

> The demo uses the **Input System** package. If the project is set to *Input Manager (Old)*,
> change **Project Settings ▸ Player ▸ Active Input Handling** to *Input System Package
> (New)* or *Both* and restart the Editor.

What you just saw:

- **5 triggers** (one per genre). When you step on them, the player emits a **fact**.
- **6 NPCs** that pass the rumor **one at a time** (one mouth per hop).
- Each NPC's label shows `v{boca} · [categoría] · nivel · confianza`.
- The rumor reaches the sixth mouth **deformed**: more digits, more flourish, less credibility.

The builder reapplies its preset on every rebuild, so you can experiment in the Inspector
without fear: run the menu again to restore the showcase.

---

## B. The manual path (5 components)

### Step 1 — The data (assets)

Menu **`Assets ▸ Create ▸ Ecos ▸ Conjunto completo de assets`** creates at once:

| Asset | Contents |
| --- | --- |
| `EcosConfig.asset` | The numbers (hops, delays, thresholds, seed). |
| `EcosBiblioteca.asset` | The vocabulary (subjects, actions, objects, templates). |
| `EcosCategorias.asset` | Elemental domains and their affinity matrix. |

### Step 2 — The brain (1 object)

1. Empty GameObject `EcosManager`.
2. Add **`Ecos Bootstrap (Sentis)`**.
3. Fill in:
   - `configuracion` → `EcosConfig.asset`
   - `biblioteca` → `EcosBiblioteca.asset`
   - `categorias` → `EcosCategorias.asset`
   - `modelo` → `model.onnx` **only if you have downloaded and exported it**
   - `tokenizador` → `sentencepiece.bpe.model.bytes` **only if you use a model**
4. If you use a model, leave `backend = GPUCompute` and `umbral = 0,45`. If not, the bootstrap
   will use the hash provider automatically.

> Execution order is `-1000`: the runtime exists before any other component, so nothing
> crashes with a `NullReferenceException` in `Awake`.
>
> **You do not need a model to complete this tutorial.** The package does not include weights;
> the hash fallback lets you test the whole chain. The model only improves semantic
> classification. See [10 — Semantic model](10-SemanticaONNX.md).

### Step 3 — The player (2 objects/components)

1. Your character (capsule, CharacterController capsule, whatever).
2. Add **`Marcadores ▸ Jugador Local`** and set `id = A`.
   This sets the `Jugador:A` channel, which emitters and NPCs will share.

### Step 4 — A trigger (0 code)

1. Any cube with **Collider ▸ Is Trigger**.
2. Add **`Eco Trigger Action`**.
3. Configure:
   - `scope.modo = JugadorLocal`
   - `sujetoId = @JugadorA`
   - `accionId = quemar`
   - `objetoId = aldea`
   - `intensidad = 80`
   - `emitirAlEntrarEnTrigger = true`
   - `logEmisiones = true`

### Step 5 — The NPCs (0 code)

For each NPC:

1. Add **`Memoria de NPC`**.
   - `perfil` → create a profile asset (menu `Assets ▸ Create ▸ Ecos ▸ Perfil de NPC`).
   - `scope.modo = JugadorLocal`
   - `participarEnDifusion = true`
   - `logEcos = true`
2. Add **`Eco Listener`** (only if you want Unity events in addition to memory).
   - `scope.modo = JugadorLocal`
   - `soloCuandoSoyElNarrador = true` ← key to seeing the chain, not 6 copies.
   - `oyente` → the same profile asset.

### Step 6 — Test it

Step on the cube. In the console you will see something like this:

```
[Ecos] Emitido: [Jugador:A] @JugadorA quemar aldea | Literal/Advertencia conf=1.00 saltos=0
[Ecos] Listener NPC 1 <- ... Literal ...  "Aldric prendió fuego a la aldea."
[Ecos] NPC 1 -> NPC 2 : ... Suavizado conf=0.88 saltos=2
[Ecos] Listener NPC 2 <- ... Suavizado ... "Aldric prendió fuego a la aldea, más o menos."
...
```

---

## C. The minimal tweak that changes everything

In `EcosConfig.asset`:

| Field | Value to see chains | Why |
| --- | --- | --- |
| `maxSaltos` | `6` | Six mouths deep. |
| `maxContagiosPorEco` | `1` | Walk mouth to mouth instead of fanning out. |
| `intervaloDeformacion` | `2` | There is a hop every 2 s (full chain in 12 s). |
| `contagioGarantizado` | `true` | Demos only: prevents a bad roll from cutting the chain. |
| `factorDegradacionPorSalto` | `0.22` | Covers all 5 levels without saturating. |
| `factorCredibilidadPorSalto` | `0.04` | Credibility lasts 6 hops. |
| `umbralConfianzaMinima` | `0.02` | The echo does not die halfway. |
| `saltosParaAnonimizar` | `6` | The name is preserved until the last mouth. |

This is exactly the demo preset. If you enable `contagioGarantizado`, **turn it back off in
production**: randomness is what makes each playthrough have different rumors.

---

## D. Next stop

- If you want the full vocabulary and variations: [05 — Library and texts](05-BibliotecaYTextos.md).
- If you want numbers that scale on their own (500→2.000 m, 10→~1.100 bandits): [06 — Quantities](06-Cantidades.md).
- If you want ready-to-copy scenarios: [11 — Recipes](11-Recetas.md).
