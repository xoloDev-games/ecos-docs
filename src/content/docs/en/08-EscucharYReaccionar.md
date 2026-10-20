# 08 — Listening and reacting

Receiving an echo means subscribing to a channel. There are three levels of use:

1. **`Eco Listener`** — UnityEvents, 0 code.
2. **`Memoria de NPC`** — the NPC remembers and can retell.
3. **`IEcosSink` / `IEcosReaccion`** — your own code for gameplay.

---

## 1. `Eco Listener` (UI, signs, HUD)

Add `Ecos ▸ Eco Listener`. It subscribes to the channel in `OnEnable` and unsubscribes in
`OnDisable`.

### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `scope` | `EcosScopeReferencia` | Channel. Global = observer of everything. |
| `intensidadMinima` | int 0..100 | Ignores echoes below it. |
| `nivelMinimo` | enum | Ignores levels below it. |
| `soloCuandoSoyElNarrador` | bool | Only reacts to the version **this** NPC would tell. |
| `componerFrase` | bool | Generates the procedural sentence. |
| `oyente` | `EcosPerfilNpcAsset` | Profile used to compose (anonymization, variation). |
| `OnRumorRecibido` | `UnityEvent<EcoEvento>` | Raw payload (ids, level, intention, category). |
| `onRumor` | `UnityEvent<EcoRumor>` | Resolved payload (category by name, sentence). |
| `onFrase` | `UnityEvent<string>` | Sentence ready to display. |
| `onResumen` | `UnityEvent<string>` | Technical summary. |
| `onEcoRecibido` | `UnityEvent` | Without arguments (compatibility). |
| `logEcos` | bool | Log for each echo. |

### The filter that makes the chain visible

`soloCuandoSoyElNarrador` is the difference between:

- **Without the filter:** the 6 listeners on the channel receive all 6 hops and all end up
  showing the latest version. It looks as if the rumor was not warped.
- **With the filter:** each tag keeps **its own** version (`v1`, `v2`, `v3`...). Everyone
  sees the original echo (`saltos = 0`) so they all start from the same place.

Enable it on the demo NPCs. In a global HUD, leave it off.

### `EcoRumor` payload

| Field | Type | Content |
| --- | --- | --- |
| `id` | string | Echo id (preserved throughout the chain). |
| `sujetoId` | string | Protagonist id (or `@Desconocido`). |
| `accionId` | string | Verb. |
| `objetoId` | string | Patient. |
| `intensidad` | int | 0..100. |
| `nivel` | enum | Literal..Distorted. |
| `intencion` | enum | Neutral..Lament. |
| `categoriaId` | int | Internal index of the category. |
| `categoria` | string | Visible name (`fuego`, `veneno`). |
| `confianza` | float | Credibility 0..1. |
| `saltos` | int | Mouths traversed. |
| `frase` | string | Composed text for this listener. |
| `resumen` | string | `[canal] sujeto accion objeto \| nivel/intencion conf saltos`. |

### Example: a "wanted" poster

1. A `TextMeshProUGUI` (or `Text`).
2. An `Eco Listener` on the same object.
3. `scope = JugadorLocal`, `nivelMinimo = Adornado`.
4. `onFrase` → `+` → drag the text → `SetText(string)`.

**What to expect:** the poster only changes when the rumor is already adorned or worse. Each
hop rewrites the text with that NPC's version (if you enable the filter).

---

## 2. `Memoria de NPC`

Add `Ecos ▸ Memoria de NPC`. This is the component that turns a GameObject into a **mouth**
of the diffusion.

### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `perfil` | `EcosPerfilNpcAsset` | Personality (talkativeness, credulity, biases). |
| `scope` | `EcosScopeReferencia` | Channel it takes part in. |
| `participarEnDifusion` | bool | Registers as an NPC: receives and **re-propagates**. |
| `maximoRecuerdos` | int 1..128 | Size of its local memory. |
| `onEcoEscuchado` | `UnityEvent<string>` | Sentence composed with **its** profile. |
| `onRecuerdoRelevante` | `UnityEvent<string>` | The highest-weight memory. |
| `logEcos` | bool | Log for each echo heard. |

### API

```csharp
var memoria = npc.GetComponent<EcosMemoriaNpc>();

string queCuenta = memoria.Contar(0);                 // most recent memory
string loMasFuerte = memoria.ContarLoMasRelevante();  // intensity x confidence

EcoEvento eco;
if (memoria.TryRecuerdoMasRelevante(out eco))
    Debug.Log(eco.Resumen());

memoria.OlvidarTodo();       // new-game reset
```

`Contar()` is the natural API for a dialogue:

```csharp
// "What do you know about the blacksmith?"
string respuesta = memoria.ContarLoMasRelevante();
```

### What to expect when you add it

- The NPC joins its channel's census (`participarEnDifusion = true`).
- It receives every echo that passes the roll and stores it.
- On the next tick it can pass its version on to another NPC.
- `onEcoEscuchado` gives you the sentence already composed with its profile (not the
  neighbor's).

> **Do not duplicate propagation.** If you use `EcosMemoriaNpc` so the NPC takes part, do
> not also add an `Eco Listener` that emits the same echo. The listener is for UI and
> reactions, not for republishing.

---

## 3. Your own sink (`IEcosSink`)

For gameplay logic without a MonoBehaviour or with several subscriptions:

```csharp
using System;
using xoloDev.Ecos;
using xoloDev.Ecos.Core;

public sealed class ReputacionFaccion : IEcosSink, IDisposable
{
    private readonly string _faccionId;
    private IDisposable _suscripcion;

    public ReputacionFaccion(string faccionId)
    {
        _faccionId = faccionId;
        _suscripcion = EcosSystem.Suscribir(
            EcosScope.Faccion(faccionId), this);
    }

    public void RecibirEco(in EcoEvento eco)
    {
        // React to the FACT, not the text.
        if (eco.AccionId == "quemar" && eco.Nivel >= EcosNivelExageracion.Exagerado)
            Debug.Log("La facción " + _faccionId + " está alarmada.");
    }

    public void Dispose()
    {
        if (_suscripcion != null) _suscripcion.Dispose();
    }
}
```

**Rule:** keep the `IDisposable` and release it in `OnDisable`/`Dispose`, or the sink will
keep receiving echoes after it dies.

### Subscription by callback

```csharp
IDisposable sub = EcosSystem.Suscribir(
    EcosScope.Jugador("A"),
    eco => Debug.Log("Ha llegado: " + eco.Resumen()));
```

---

## 4. Reactions in the pipeline (`EcosReaccionComponente`)

A sink reacts **after** the echo arrives. A reaction runs **during** propagation, when the
echo passes from one NPC to another, and it can read the full context (emitter, receiver,
affinity, distance).

### Without code: `Reacción de NPC`

Add `Ecos ▸ Reacción de NPC` to the same GameObject that has the `Memoria de NPC`.

| Field | Purpose |
| --- | --- |
| `memoria` | Only reacts to echoes received by that NPC. |
| `nivelMinimo` | Minimum echo level. |
| `intensidadMinima` | Minimum intensity (0..100). |
| `confianzaMinima` | Minimum credibility. A skeptic demands believable accounts. |
| `categoriaRequerida` | Mandatory elemental category (`fuego`). Empty = any. |
| `intencionRequerida` | Mandatory intention. `Neutral` = any. |
| `probabilidad` | Probability of firing when the conditions are met. |
| `onReaccionar` | `UnityEvent<string>` with the composed sentence. |
| `logReacciones` | Log for each reaction. |

It registers itself in `OnEnable` and removes itself in `OnDisable`; there is nothing to
wire in the bootstrap.

**Example:** "if the echo is fire and comes in exaggerated, the guard should hit the
alarm".

```
memoria            = la del guardia
nivelMinimo        = Exagerado
intensidadMinima   = 60
categoriaRequerida = fuego
onReaccionar       -> Alarma.Sonar()
```

**What to expect:** the alarm sounds when the guard receives a fire version that is strong
enough. It does not sound for the original echo (Literal) or for a poison rumor.

### With code: `IEcosReaccion`

For logic that does not fit a UnityEvent:

```csharp
using xoloDev.Ecos.Core;

public sealed class ReaccionMiedo : IEcosReaccion
{
    public void Reaccionar(in EcoEvento eco, in EcosContextoPropagacion contexto)
    {
        if (eco.Nivel < EcosNivelExageracion.Exagerado) return;
        if (contexto.Receptor == null) return;

        Debug.Log(contexto.Receptor.Nombre + " entra en pánico al oírlo.");
        // Here you can trigger an animation, a bark, a flee reaction...
    }
}
```

Registration:

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConReaccion(new ReaccionMiedo())
    .Construir();
```

You can also add it to a live runtime:

```csharp
var runtime = EcosSystem.Runtime as EcosRuntimeDefault;
if (runtime != null) runtime.AnadirReaccion(new ReaccionMiedo());
```

---

## 5. Queries: memory, echoes and the subject's dossier

### The most relevant echo for an NPC

```csharp
EcoEvento eco;
if (EcosSystem.TryEcoMasRelevante(EcosScope.Jugador("A"), "Herrero", out eco))
    Debug.Log(EcosSystem.Narrar(eco, perfilDelHerrero));
```

### All the echoes of a subject on a channel

```csharp
List<EcoEvento> ecos = EcosSystem.EcosDe(EcosScope.Lugar("aldea"), "@JugadorA");
```

### Reputation dossier

```csharp
EcosDossierSujeto ficha;
if (EcosSystem.TryDossier(EcosScope.Lugar("aldea"), "@JugadorA", out ficha))
{
    Debug.Log("Reputation: " + ficha.Reputacion);       // -100..100
    Debug.Log("Ambivalence: " + ficha.Ambivalencia);    // 0..1
    Debug.Log("Contradicciones: " + ficha.Contradicciones);
}
```

And an NPC's private truth:

```csharp
EcosSystem.TryDossierDeNpc(
    EcosScope.Lugar("aldea"), "Herrero", "@JugadorA", out ficha);
```

**What to expect:** the village dossier and the blacksmith's may differ. That is
intentional: each NPC has its own version. The dossier **does not erase** echoes;
competing accounts coexist.

### Relationships between actions

`EcosRelacionesAcciones` is built from the actions' `AntagonistaDe`. It is used to detect
contradictions and synergies. It is not usually queried by hand.

---

## 6. UI patterns

### Credibility bar

```csharp
listener.onRumor.AddListener(rumor =>
{
    barra.fillAmount = rumor.confianza;
    etiquetaNivel.text = EcosNiveles.Etiqueta(rumor.nivel);
});
```

### Color by category

```csharp
Color color = rumor.categoria == "fuego" ? Color.red :
              rumor.categoria == "veneno" ? Color.green :
              Color.white;
```

### "What do you know?" dialogue

```csharp
public string Preguntar(string npcId)
{
    var npc = BuscarNpc(npcId);
    var memoria = npc.GetComponent<EcosMemoriaNpc>();
    return memoria != null ? memoria.ContarLoMasRelevante() : "No sé nada.";
}
```

---

## 7. Common errors

| Symptom | Cause | Solution |
| --- | --- | --- |
| The listener receives nothing | It subscribed to a channel different from the emitter's. | Use the same `scope` (usually `JugadorLocal`). |
| All NPCs show the same sentence | `soloCuandoSoyElNarrador` is missing. | Enable it on the NPC listeners. |
| The listener receives the original echo but not the hops | It is on `Global`. | Subscribe to the player/faction channel. |
| The NPC does not re-propagate | `participarEnDifusion = false` or there is no profile. | Enable it; assign an `EcosPerfilNpcAsset`. |
| `onFrase` comes out empty | `componerFrase = false` or there is no runtime. | Enable it; check the bootstrap. |
| Subscription memory leak | The `IDisposable` is not released in `OnDisable`. | Store it and dispose of it. |
| The dossier does not change | You are querying another channel, or the echo has no `Valencia`/`Peso`. | Check `EcosAccion.Valencia`, `Peso` and the scope. |
