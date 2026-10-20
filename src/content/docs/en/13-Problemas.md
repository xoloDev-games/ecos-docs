# 13 — Troubleshooting

Find your symptom. Each entry has a **cause** and a **solution**. At the end there is a
quick checklist.

---

## 1. Installation and compilation

### `The type or namespace name 'InferenceEngine' does not exist`

**Cause:** the `com.unity.ai.inference` package is missing (or you have an old version with
the `Unity.Sentis` namespace).

**Solution:** install `com.unity.ai.inference` 2.6.1 from the Package Manager. The runtime
uses `Unity.InferenceEngine` (Inference Engine 2.x), not `Unity.Sentis`.

### `The type or namespace name 'Tokenization' does not exist`

**Cause:** in your version, the Inference Engine package does not include the tokenization
module.

**Solution:** update to 2.6.1 or higher. If your version does not have it, use
`EcosProveedorEmbeddingsHash` (without a model) or the optional ONNX provider.

### `Assembly with name 'xoloDev.Ecos' already exists`

**Cause:** you have the UPM package **and** a manual copy in `Assets/Ecos`, or two copies of
the `.asmdef`.

**Solution:** keep **one** installation. If you use UPM, delete the manual folder
`Assets/Ecos/Scripts` (do not delete your demo assets).

### `OnnxImportException` when importing `model.onnx`

**Cause:** operators or types not supported by your version/backend (typical of a dynamic
INT8 with `DynamicQuantizeLinear`/`MatMulInteger`, or of a model exported with new ops).

**Solution:** use the FP16 you exported with `keep_io_types=True` (chapter 10). Do not
rename an INT8 to `model.onnx`: Inference Engine 2.6.1 does not import it. If the problem
persists, try `backend = CPU`. Check the Console for the exact operator. If you do not need
semantics, leave the model empty and use the hash provider.

### The tokenizer shows up as `DefaultAsset`, not `TextAsset`

**Cause:** the file is called `sentencepiece.bpe.model` (`.model` extension).

**Solution:** rename it to `sentencepiece.bpe.model.bytes`. Unity imports it as a
`TextAsset` and exposes `bytes`.

### `NullReferenceException` in another component's `Awake`

**Cause:** that component calls `EcosSystem` before the runtime exists.

**Solution:** `EcosBootstrap` uses `[DefaultExecutionOrder(-1000)]`; do not change it. If the
component is yours, use `EcosSystem.AsegurarRuntime()` or move it to `Start`.

---

## 2. The chain does not advance / is not visible

### It only reaches 3-4 hops (with `maxSaltos = 6`)

**Cause:** with `maxContagiosPorEco = 1` there is one roll per hop and the probability drops
with confidence and level. A single failure cuts the chain.

**Solution (demo):** `contagioGarantizado = true` and `factorCredibilidadPorSalto = 0.04`,
`umbralConfianzaMinima = 0.02`.

**Solution (game):** raise `probabilidadContagioBase`, lower `factorCredibilidadPorSalto` or
add more NPCs. Do not use `contagioGarantizado` in production.

### The echo does not propagate at all

| Cause | Check | Solution |
| --- | --- | --- |
| There are no NPCs in the channel | `EcosSystem.Runtime.Npcs` or the debug console | Add `EcosMemoriaNpc` with `participarEnDifusion = true`. |
| The NPC is not in the same scope | `[Jugador:A]` vs `[Global]` logs | Match the `scope` of the emitter and the NPC. |
| `umbralIntensidadMinima` too high | The trigger intensity is lower | Lower the threshold or raise the intensity. |
| `umbralConfianzaMinima` too high | Confidence drops fast | Lower it, or lower `factorCredibilidadPorSalto`. |
| `radioEscucha` too small | Distance between NPCs | Raise it or set it to 0. |
| `locuacidad = 0` on everyone | Profiles | Raise the loquacity. |

### The rumor arrives, but the sentence does not change between hops

**Cause 1:** all listeners are subscribed to `Global` (they are observers and receive the
original echo).

**Solution:** subscribe to the player/faction channel.

**Cause 2:** `soloCuandoSoyElNarrador` is missing on the NPC listeners.

**Solution:** enable it. That way each tag keeps its own version (`v1`, `v2`, ...).

**Cause 3:** `factorDegradacionPorSalto` too low, or `maxSaltos` too short.

**Solution:** 0.22 with 6 hops; check the level in the logs.

### The chain advances in jerks

**Cause:** `maxEventosPorTick` too low, or too many channels.

**Solution:** raise it to 512-1024; check `Pendientes` in the debug console.

### The echo "disappears" all at once

**Cause:** it died from confidence (`< umbralConfianzaMinima`) or from `tiempoDeVidaEco`.

**Solution:** this is the expected behavior. If you do not want it, lower
`factorCredibilidadPorSalto` or raise `umbralConfianzaMinima`… downwards. Check the log of
the last delivery.

---

## 3. Quantities

### No number appears

| Cause | Solution |
| --- | --- |
| `CantidadBase = 0` | Declare the real figure of the fact. |
| `UnidadCantidad` empty | Fill it in (`metros`, `bandidos`). |
| The action used is not the one you think | Check the trigger's `accionId`. |

### The figure does not scale

- The echo is not going up in level (look at `factorDegradacionPorSalto`).
- You set a `CantidadesPorNivel` with the same value repeated: the override wins over the
  automatic curve. Leave it empty if you want the curve.
- The action has no `CantidadBase` or `UnidadCantidad`.

### The figure changes between NPCs

This is the expected behavior if `VariacionPorOyente` is active: the curve applies a
deterministic margin of ±8 % and rounds to natural figures. With the same seed, the same NPC
repeats the same figure. Disable it if you need an identical figure for everyone.

### The trigger's object does not appear

This is correct if `CantidadComoObjeto = true`: the quantity replaces the object. If you
wanted both, use `CantidadComoObjeto = false` and a template with `{magnitud}`.

### It outputs "bandidos., con su espada"

**Cause:** punctuation in `{objeto}` or in the template, and the instrument is appended with
a comma.

**Solution:** move the punctuation to `{sufijo}` or `{coletilla}`.

### The raw id appears instead of the name

**Cause:** the entry is missing from `Sujetos` or `Objetos`.

**Solution:** add it, or use `@Nadie` so that no object is rendered. The raw id is the
system's honest warning, not a bug.

---

## 4. Anonymization

### The name never disappears

- `saltosParaAnonimizar` is greater than `maxSaltos`.
- The subject is the player (`EsJugador = true`) and the listener knows them.
- The level does not reach `Distorted` (the 35 % roll does not happen).

**Solution:** lower `saltosParaAnonimizar` (3 is the default value), do not mark
`EsJugador`, or accept that the name is kept.

### The name disappears too soon

`saltosParaAnonimizar = 0`, or the level is `Distorted` and the roll has succeeded. Raise it
to 3-4.

### The name disappears, but the dossier still attributes the fact

The dossier is computed from the graph; if the echo was registered before the anonymization
rule, the original node keeps the `SujetoId`. The anonymized version is another node. This is
intentional: the channel knows the truth and the rumor does not.

---

## 5. Model / Sentis

### "Se usará la heurística de respaldo"

- `modelo` or `tokenizador` not assigned.
- The `.onnx` was not imported as a `ModelAsset`.
- `TryCrear` failed (check the full error).

**Solution:** assign both; check the Console; try FP16 and `CPU`.

### The first sentence takes a long time

**Cause:** empty cache.

**Solution:** `precalentarAlArrancar = true`; make sure the categories have `Sinonimos`.

### Absurd categories

**Cause:** threshold too low, or synonyms that do not represent the type of sentence.

**Solution:** raise `umbral` to 0.5-0.6; rewrite the synonyms as action phrases
("abatió al objetivo a distancia"), not as roles (\$"sniper").

### GPU not available / backend errors

**Solution:** `backend = CPU`. On mobile, try `CPU` with the FP16 you exported; if you export
an INT8 compatible with your Inference Engine version, use it as an alternative.

### The model takes up too much in the build

- Use the hash provider (0 MB of model) or a smaller compatible model.
- Exclude the model from the build if you use the hash provider (do not assign it).
- Check `longitudMaxima`: it does not affect the asset size, only inference.
- The package does not include weights; the model size depends on the one you export.

---

## 6. Multiplayer

### Player B sees A's rumors

**Cause:** both are in `Global` or they share the same `EcosJugadorLocal.id`.

**Solution:** one `EcosJugadorLocal` per player with different ids; emitters and NPCs in
`Jugador:A` / `Jugador:B`.

### The bridge does not carry anything across

| Cause | Solution |
| --- | --- |
| `SaltosMinimos` too high | Lower it, or let the chain advance. |
| `Probabilidad` too low | Raise it to 1 to test. |
| Origin/destination misspelled | Print the `EcosScope` in the log. |
| The echo dies earlier | Raise the confidence or lower the threshold. |

### The bridge filters the name

`Anonimizar = true` is the recommended value. If you want to keep it, set it to false (and
accept the risk of mixing identities between channels).

---

## 7. UI and listeners

### `onFrase` comes out empty

- `componerFrase = false`.
- There is no runtime (`EcosSystem.Runtime == null`).
- The listener is disabled.

### The UnityEvent does not show the value in the Inspector

This is normal: UnityEvent does not preview the payload. Read the value **inside** the hooked
method (`void MiMetodo(EcoRumor r)`).

### The sign shows the technical summary instead of the sentence

You are using `onResumen` instead of `onFrase`. Change the event.

### Subscription memory leak

Store the `IDisposable` and release it in `OnDisable`. The asset's components already do
this.

---

## 8. Performance

| Symptom | Cause | Solution |
| --- | --- | --- |
| Low FPS with many NPCs | Fan-out + `maxContagiosPorEco = 0` | Set it to 1 and lower `maxEventosPorTick`. |
| Spikes at startup | Model pre-warming | This is expected; move it to a loading screen. |
| High memory | FP16 + buffers | CPU, hash provider or a compatible quantized model. |
| Huge logs | `logContagios = true` | Disable it in production. |
| The graph grows without stopping | `maxNodosPorCanal` too high | Lower it; the graph prunes the oldest. |

---

## 9. Determinism

### Every session gives exactly the same sentence

**Cause:** `semillaMundo` is fixed (`1337` by default) and the runtime restarts with the same
ids and NPCs; the system is deterministic by design.

**Solution:**

- If you want variety between **sessions** (each Play / launch): set
  `modoSemilla = AleatoriaPorSesion` in `EcosConfigAsset` (the demo ships with it enabled).
  Each runtime draws a seed and the words, flourishes and closing remarks change; the verb,
  the patient and the figures stay the same.
- If you want one seed per **saved game** that is preserved when continuing: use
  `EcosSemillaPartida.ParaNuevaPartida` when creating the game, store the seed in your save
  and `EcosSemillaPartida.ParaContinuarPartida` when loading it.
- If you want to reproduce a specific session: keep `modoSemilla = Fija` and use the same
  `semillaMundo`, the same NPC order and the same clock.

### Two runs give different sentences

- A different `SemillaMundo`.
- `variacionPorOyente` changes the order of the listeners.
- You are using `Time.time` in the composer (you should not).
- The semantic model is not deterministic on GPU (there may be small floating-point
  differences); for tests use the hash provider or CPU.

**Solution:** same seed, same manual clock, same NPCs in the same order.

### The replay does not match

The registration order of NPCs matters (it affects the order of the rolls). Always register in
the same order, or use stable ids and sort before registering.

---

## 10. "I changed the code/data and it is not applied"

**Cause:** Unity has not recompiled, or the scene keeps old serialized values.

**Solution:**

1. Wait for Unity to finish compiling (progress bar).
2. If you changed the **preset** or the **component values**, run
   `Ecos ▸ Construir Escena de Demo` again. The values are serialized in the scene and in the
   assets; the builder reapplies them.
3. If you changed library data in code, the builder refreshes it by id; build again.
4. If you only changed Core logic, recompiling is enough (no need to rebuild).

> This was a real false bug during development: the logs still showed 3 hops because the
> editor had not recompiled. Before touching code, check the Console and the compilation bar.

---

## 11. Quick checklist

1. Is there an `EcosBootstrap`/`EcosBootstrapSentis` in the scene? (order -1000)
2. Does the player have an `EcosJugadorLocal` with an id?
3. Do the emitter and the NPCs resolve the **same** scope?
4. Do the NPCs have `participarEnDifusion = true`?
5. Do the NPC listeners have `soloCuandoSoyElNarrador = true`?
6. Are `maxSaltos` and `maxContagiosPorEco` what you think they are?
7. Is `contagioGarantizado` only active in the demo?
8. Does the action exist in the library? (if not, you will see the raw id)
9. Is the quantity on the right action?
10. Is the model assigned and is the tokenizer `.bytes`?
11. Have you rebuilt the scene after changing the preset?
12. Does the Console show import or compilation errors?

---

## 12. Where to look

| Tool | What for |
| --- | --- |
| `Window ▸ Ecos ▸ Consola de Ecos` | Channels, queues, nodes, "who knows what" and the sentence lab. |
| `logEventos` on the bootstrap | Every registered fact. |
| `logContagios` on the bootstrap | Every `emisor -> receptor` hop. |
| `logEcos` on the listener | Every version received, with its sentence. |
| `logEcos` on the memory | Every echo stored by the NPC. |
| Context menu of `EcosBootstrapSentis` | Diagnostics for the semantic provider. |
| `EcoEvento.Resumen()` | Compact line: channel, subject, action, object, level, intention, confidence, hops. |
