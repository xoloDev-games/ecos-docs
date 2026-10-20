# 07 — Emitting echoes

An echo is born when something happens. There are two paths: **component** (designer, 0
code) or **code** (gameplay, tools, servers).

---

## 1. The designer's path: `Eco Trigger Action`

Add `Ecos ▸ Eco Trigger Action` to any GameObject with a Collider.

### Fields

| Field | Type | Purpose | Example |
| --- | --- | --- | --- |
| `accionId` | string | Id of the action in the library. | `quemar` |
| `objetoId` | string | Id of the patient. | `aldea` |
| `intensidad` | int 0..100 | Real magnitude of the fact **before** it is warped. | `80` |
| `intencion` | enum | Initial intention (the classifier may change it). | `Advertencia` |
| `emitirAlStart` | bool | Emits when the scene starts. | `false` |
| `emitirAlEntrarEnTrigger` | bool | Emits when something enters the trigger. | `true` |
| `tagDisparador` | string | Only triggers with that tag. Empty = any. | `Player` |
| `cooldown` | float | Minimum seconds between emissions. `0` = no limit. | `5` |
| `soloUnaVez` | bool | Emits only once while the component is alive (per session: each Play or startup). It is not stored in the save. | `false` |
| `onEmision` | UnityEvent | Invoked after emitting (VFX, audio). | — |
| `onFrase` | UnityEvent\<string\> | Receives the composed sentence. | — |
| `oyenteDemostracion` | `EcosPerfilNpcAsset` | Profile used to compose `onFrase`. | — |
| `logEmisiones` | bool | Console log. | `true` in the demo |

### Fields inherited from `EcosEmisor`

| Field | Type | Purpose |
| --- | --- | --- |
| `scope` | `EcosScopeReferencia` | Channel where it is published. Defaults to the local player. |
| `sujetoId` | string | Who stars in it. Empty = `EcosIdentidad` or the GameObject's name. |

### Typical setup of a demo cube

```
scope.modo          = JugadorLocal
sujetoId            = @JugadorA
accionId            = quemar
objetoId            = aldea
intensidad          = 80
intencion           = Advertencia
emitirAlEntrarEnTrigger = true
cooldown            = 5
logEmisiones        = true
```

**What to expect:** when you step on it, the console shows

```
[Ecos] Emitido: [Jugador:A] @JugadorA quemar aldea | Literal/Advertencia conf=1.00 saltos=0
```

and, if there are NPCs on the channel, the contagions begin.

### Triggering from UI or animation

`EmitirEco()` is public. In a button:

1. `OnClick()` → `+` → drag the trigger's GameObject.
2. Choose `EcosTriggerAction ▸ EmitirEco`.

You can also hook it to `Animation Events`, `Timeline` or your own `UnityEvent`.

### Resetting a one-shot trigger

```csharp
trigger.ReiniciarDisparador();
```

It sets `_yaEmitido = false` again and clears the cooldown.

### Emitting on **another** player's channel

```csharp
trigger.EmitirEco(EcosScope.Jugador("B"));
```

This is useful for world events that must affect a specific player (traps, scripted
events).

---

## 2. The code path

### 2.1 The short form (player channel)

```csharp
EcosSystem.RegistrarEvento("A", "quemar", "aldea", 80);
```

- `"A"` is the player id; internally it creates `EcosScope.Jugador("A")`.
- `objetoId` defaults to `"@Nadie"`.
- `intensidad` defaults to `50`.

### 2.2 The full form (any channel)

```csharp
EcosSystem.RegistrarEvento(
    EcosScope.Faccion("guardia"),
    "@Capitan",
    "arrestar",
    "@Contrabandista",
    intensidad: 60,
    intencion: EcosIntencion.Advertencia);
```

### 2.3 Creating and publishing while returning the echo

```csharp
EcoEvento eco = EcosSystem.CrearEco(
    EcosScope.Jugador("A"), "@JugadorA", "quemar", "aldea", 80);

// Already published: use it for logging, UI or to derive a variant.
EcoEvento variante = eco.Derivar(intensidad: 95);
EcosSystem.RegistrarEvento(variante);   // publishes the variant as a new fact
```

> `CrearEco` **publishes**. Do not call it and then `RegistrarEvento(eco)` with the same
> echo: you would register it twice. To build an echo without publishing it, use the
> `EcoEvento` constructor (advanced) and decide yourself when to call `RegistrarEvento`.

### 2.4 Your own emitter (recommended for weapons, spells, dialogue)

Inherit from `EcosEmisor` and call `Emitir(...)`:

```csharp
using xoloDev.Ecos;
using xoloDev.Ecos.Core;
using UnityEngine;

public sealed class ArmaEco : EcosEmisor
{
    [SerializeField] private int dano = 70;

    public void Disparar(string objetivoId)
    {
        EcoEvento eco = Emitir("abatir_distancia", objetivoId, dano, EcosIntencion.Amenaza);
        Debug.Log("Eco de arma: " + eco.Resumen());
    }
}
```

Advantages: it inherits `scope`, `sujetoId`, `ResolverScope()`, `ResolverSujeto()` and the
`OnEcoEmitido` event. Do not reimplement isolation.

### 2.5 Listening for the emitted echo

```csharp
emisor.OnEcoEmitido += eco => Debug.Log("Emitido " + eco.Id);
```

---

## 3. Channels (`EcosScope`)

| Constructor | Type | Isolation |
| --- | --- | --- |
| `EcosScope.Global` | Global | Everyone sees it (observers). |
| `EcosScope.Jugador("A")` | Player | Only player A and their NPCs. |
| `EcosScope.Faccion("guardia")` | Faction | Only that faction (or via a bridge). |
| `EcosScope.Lugar("aldea")` | Location | Only that location. |
| `EcosScope.Grupo("rebeldes")` | Group | Arbitrary collective. |
| `EcosScope.Sistema("debug")` | System | Isolated from gameplay. |

`EcosScopeReferencia` is the Inspector wrapper:

| Mode | Behavior |
| --- | --- |
| `JugadorLocal` | Resolves the scene's `EcosJugadorLocal`. |
| `Jugador` | Uses `idJugador`. |
| `Faccion` / `Lugar` / `Grupo` / `Sistema` | Uses `id`. |
| `Global` | Global channel. |

**Rule:** the emitter and the NPCs must resolve **the same** channel. If the emitter is on
`Jugador:A` and the NPC on `Global`, the NPC will not receive the warped versions (only the
original, as an observer).

---

## 4. Multiplayer: channels and bridges

### Isolating players

1. One `EcosJugadorLocal` per player, with a different `id` (`A`, `B`).
2. In the bootstrap, `jugadores = [A, B]` (or leave `autodetectarJugadorLocal`).
3. Every emitter and NPC of A uses `JugadorLocal` (or `Jugador:A`).

**What to expect:** A's fact never appears on B's channel. Not even in the logs.

### Explicit bridges

A bridge decides whether an echo crosses from one channel to another. It is configured in
the bootstrap:

| `EcosPuenteConfig` field | Effect |
| --- | --- |
| `origen` | Channel it listens to (usually a player). |
| `destino` | Channel it publishes to (a faction, a location). |
| `anonimizar` | On crossing, it loses the player's identity. |
| `saltosMinimos` | It only crosses if the echo has already traveled far enough. |
| `probabilidad` | Crossing probability. |
| `perdidaConfianza` | Credibility it loses on crossing. |

```csharp
var puente = new EcosPuenteDeScope(EcosScope.Jugador("A"), EcosScope.Faccion("guardia"), true)
{
    SaltosMinimos = 3,
    Probabilidad = 0.8f,
    PerdidaConfianza = 0.2f
};
```

**What to expect:** from the third hop onward, the guard receives "un forastero quemó la
aldea" (without the player's name), with less confidence.

### When **not** to use Global

- For a HUD that must see everything: Global is fine.
- For an NPC to react and **re-propagate**: use the player/faction channel.
- For a "world" rumor that is born without an owner: Global is correct, but then it is not
  isolated per player.

---

## 5. Good habits

1. **One action id = one fact.** Do not put whole sentences in `accionId`.
2. **Intensity belongs to the fact, not the retelling.** 80 = massacre; 10 = noise.
3. **Do not emit in `Update`.** Use events, triggers or cooldowns.
4. **One trigger, one fact.** If you need to vary the quantity, declare different actions
   ([06](06-Cantidades.md)).
5. **Log in development, not in production.** `logContagios` can be very verbose.
6. **The subject must exist** in `Sujetos`, or its raw id will be shown. For players,
   `EsJugador = true` prevents them from being anonymized out of ignorance.
7. **Test without a scene:** `Window ▸ Ecos ▸ Consola de Ecos` lets you emit and see the
   sentence without entering Play.

---

## 6. Common errors

| Symptom | Cause | Solution |
| --- | --- | --- |
| Nothing happens when stepping on the cube | Missing `Collider` with `Is Trigger`, or the other collider has no Rigidbody/CharacterController. | Add a `CharacterController` to the player or a `Rigidbody` to the trigger. |
| It emits but does not propagate | No NPCs registered on that channel (`participarEnDifusion = false`). | Enable it in `EcosMemoriaNpc`. |
| It propagates but the sentence does not change | All listeners are on `Global` (observers) or `soloCuandoSoyElNarrador` is missing. | Subscribe to the player channel; enable the filter on the listeners. |
| The player's name does not appear | `@JugadorA` is not in `Sujetos`, or `SaltosParaAnonimizar` is 0. | Add it with `EsJugador = true`; adjust the threshold. |
| `NullReferenceException` in `Awake` | Another component calls `EcosSystem` before the bootstrap. | The bootstrap already uses order `-1000`; do not change it. |
