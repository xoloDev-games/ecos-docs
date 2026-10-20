# 09 — NPCs and profiles

An NPC is, for Ecos, **a profile + a memory + a channel subscription**. The
`EcosMemoriaNpc` component joins the three; the `EcosPerfilNpcAsset` asset defines the
personality.

---

## 1. `EcosPerfilNpcAsset` (Inspector)

Create one with `Assets ▸ Create ▸ Ecos ▸ Perfil de NPC`. Several NPCs can share it
("common villager", "guard", "market gossip").

| Field | Range | Effect | Typical values |
| --- | --- | --- | --- |
| `id` | string | Stable id. Empty = GameObject name. | `Herrero` |
| `nombre` | string | Name shown in phrases/logs. | `el herrero` |
| `locuacidad` | 0..1 | Probability of repeating + distortion. | `0,8` gossip / `0,2` wall |
| `credulidad` | 0..1 | How much they believe what they are told. | `0,9` gullible / `0,3` skeptic |
| `memoria` | 0..1 | Retention; lengthens the echo's life. | `0,8` chronicler / `0,2` scatterbrain |
| `autoridad` | 0..1 | Projects credibility and degrades less. | `0,9` captain / `0,2` nobody |
| `sesgoExageracion` | -1..1 | >0 exaggerates, <0 minimizes. | `0,7` braggart / `-0,5` cautious |
| `sesgoIntencion` | -1..1 | -1 laments, +1 threatens. | `0,6` thug / `-0,6` mourner |
| `sesgoVelocidad` | -1..1 | >0 advances the hop, <0 delays it. | `0,5` urgent / `-0,5` slow |
| `sesgoElemental` | string | Category they are obsessed with. | `fuego` |
| `radioEscucha` | 0..200 | Maximum distance at which they can hear. `0` = no limit. | `8` in a village |
| `capacidadMemoria` | 1..256 | Echoes retained. | `24` villager / `128` chronicler |
| `conocidos` | List\<string\> | Subjects they know firsthand. | `@JugadorA`, `@Alcalde` |

### How it translates into behavior

- **Contagion:** `locuacidad`, `credulidad`, and `autoridad` feed into the probability
  formula ([04](04-Configuracion.md)). An NPC with `locuacidad = 0` **never**
  re-propagates (even if they receive).
- **Distortion:** `locuacidad` and `sesgoExageracion` add pressure; `autoridad` and
  `memoria` subtract it.
- **Intention:** `sesgoIntencion` pushes the classifier toward `Lamento` or `Amenaza`.
- **Speed:** `sesgoVelocidad` shifts the delay of the next hop. It is ignored when
  `intervaloDeformacion > 0`.
- **Anonymization:** if the listener does not have the subject in `conocidos`,
  `NombreVago` is used (starting at `saltosParaAnonimizar`).

---

## 2. Example profiles

### Common villager

```csharp
id = "Aldeano";
nombre = "un aldeano";
locuacidad = 0.55f;
credulidad = 0.7f;
memoria = 0.4f;
autoridad = 0.3f;
sesgoExageracion = 0.1f;
sesgoIntencion = 0f;
sesgoVelocidad = 0f;
capacidadMemoria = 16;
```

**Expected:** repeats often, believes almost anything, forgets quickly. The rumor becomes
distorted through accumulation, not malice.

### Gossipy innkeeper

```csharp
id = "Tabernero";
nombre = "el tabernero";
locuacidad = 0.95f;
credulidad = 0.8f;
memoria = 0.7f;
autoridad = 0.4f;
sesgoExageracion = 0.6f;
sesgoIntencion = 0.2f;
sesgoVelocidad = 0.4f;
capacidadMemoria = 48;
```

**Expected:** the chain speeds up and rises through the levels earlier. It is the village's
"amplifier."

### Guard captain

```csharp
id = "Capitan";
nombre = "el capitán";
locuacidad = 0.5f;
credulidad = 0.35f;
memoria = 0.9f;
autoridad = 0.95f;
sesgoExageracion = -0.4f;
sesgoIntencion = 0.5f;
sesgoVelocidad = -0.2f;
sesgoElemental = "orden";
capacidadMemoria = 96;
```

**Expected:** speaks little, demands proof, remembers a lot, and **degrades less**. If they
repeat it, the version is more reliable (though more threatening).

### Source (player / world)

For a player you do not need an NPC profile: `EcosPerfilNpc.CrearFuente("@JugadorA")`
creates a neutral one with authority 0.6. The bootstrap does it automatically if
`autoRegistrarPerfilesFuente = true`.

---

## 3. `EcosMemoriaNpc` (component)

| Field | Purpose |
| --- | --- |
| `perfil` | Personality asset. If null, uses the GameObject name. |
| `scope` | Channel in which it participates. |
| `participarEnDifusion` | If true, it registers in the census and re-propagates. |
| `maximoRecuerdos` | Size of the local memory. |
| `onEcoEscuchado` | Phrase composed with its profile. |
| `onRecuerdoRelevante` | The highest-weight memory (intensity × confidence). |
| `logEcos` | Log of every echo. |

### Lifecycle

```
OnEnable  -> construye perfil, registra NPC, se suscribe al canal
RecibirEco -> guarda en memoria + evento
OnDisable -> se desuscribe y se desregistra
```

### Useful API

```csharp
memoria.Contar(0);                    // the most recent
memoria.ContarLoMasRelevante();       // the highest-weight one
memoria.TryRecuerdoMasRelevante(out eco);
memoria.OlvidarTodo();
memoria.DispararRecuerdoRelevante();  // invokes onRecuerdoRelevante
```

`Contar()` uses `EcosSystem.Narrar(eco, Perfil)`: the phrase is composed **with that NPC's
personality**, not the player's.

---

## 4. Acquaintances and vague names

`Conocidos` is what separates "the blacksmith" from "a stranger."

```csharp
perfil.conocidos.Add("@JugadorA");
perfil.conocidos.Add("@Alcalde");
```

- If the subject is in `Conocidos`, the composer uses `Nombre`.
- If not, and the echo has already passed `saltosParaAnonimizar`, it uses `NombreVago`.
- Subjects with `EsJugador = true` are considered acquaintances by definition.

**What to expect:** the same echo can be "Aldric burned the village" for the blacksmith
and "a stranger burned the village" for a traveler. It is the same chain, told by two
listeners.

---

## 5. Listening radius

`radioEscucha > 0` limits propagation by distance. The propagator computes the
emitter-listener distance and the filter returns probability 0 if the listener is out of
range.

**Typical use:** NPCs in a village with `radioEscucha = 8`; the rumor does not jump to the
neighboring village without a bridge or a "messenger" NPC with radius 0.

**Note:** distance is measured in world units. If your scene uses an unusual scale, adjust
the radius or leave it at 0 (no limit).

---

## 6. Registering NPCs from code

With a component:

```csharp
var memoria = go.AddComponent<EcosMemoriaNpc>();
memoria.perfil = perfilAsset;
memoria.scope = new EcosScopeReferencia { modo = EcosScopeModo.JugadorLocal };
```

Without a component (server, tests):

```csharp
var perfil = new EcosPerfilNpc
{
    Id = "Herrero",
    Nombre = "el herrero",
    Scope = EcosScope.Jugador("A"),
    Locuacidad = 0.8f,
    Credulidad = 0.6f,
    Autoridad = 0.4f
};

perfil.Conocidos.Add("@JugadorA");
EcosSystem.RegistrarNpc(perfil);
```

To unregister:

```csharp
EcosSystem.DesregistrarNpc("Herrero");
```

> `DesregistrarNpc` does not create a runtime if none exists: it is safe to call it when
> exiting Play mode or destroying NPCs.

---

## 7. Scene identity (`EcosIdentidad`)

If you do not want to write ids on every emitter, add `Ecos ▸ Marcadores ▸ Identidad de Eco`
to the NPC or the location:

| Field | Purpose |
| --- | --- |
| `sujetoId` | Subject id (`@Herrero`). Empty = GameObject name. |
| `scopeModo` | Global, JugadorLocal, JugadorPorId, Faccion, Lugar, Grupo, Sistema. |
| `scopeId` | Channel id when the mode is not Global/JugadorLocal. |

`EcosScopeReferencia` inherits the channel and id from this identity if the component does
not specify them. It is the way to make a trigger dragged into the scene "just work."

---

## 8. Design patterns

### Trait distribution

- **Village:** medium-high talkativeness, high credulity, low authority.
- **Guard:** low talkativeness, low credulity, high authority.
- **Nobility:** medium talkativeness, medium credulity, very high authority.
- **Outsider:** low talkativeness, medium credulity, high radioEscucha (they travel).

### Narrative arcs

- An NPC with a high `sesgoExageracion` can **rise one level on their own**: use it to
  create the "village liar."
- An NPC with high `autoridad` **slows** degradation: use it for a captain who preserves
  the official version.
- An NPC with low `memoria` **loses** the echo: use it so that a rumor disappears without
  needing to delete it.

### What NOT to do

- Do not set `locuacidad = 0` and expect the NPC to "receive but not tell": that is
  exactly what it does (it does not re-propagate).
- Do not use `radioEscucha` to isolate channels: that is what `EcosScope` is for.
- Do not share a mutable profile between NPCs if you change their `Conocidos` at runtime:
  the asset caches the profile. Create one instance per NPC (`ConstruirPerfil`) or use the
  component, which already does it.

---

## 9. What to expect when tuning

| Change | Observable effect |
| --- | --- |
| `locuacidad` 0,5 → 0,9 | More contagions; the chain advances earlier and branches more. |
| `credulidad` 0,5 → 0,9 | Accepts more exaggerated versions; effective confidence rises. |
| `autoridad` 0,5 → 0,9 | The version it repeats degrades less and is believed more. |
| `memoria` 0,5 → 0,9 | Remembers for longer; the echo takes longer to die. |
| `sesgoExageracion` 0 → 0,8 | Can rise one level on its own (braggart). |
| `sesgoIntencion` 0 → 0,8 | Phrases shift toward Threat; the fact does not change. |
| `radioEscucha` 0 → 8 | The rumor stops crossing from one area to another. |
| `capacidadMemoria` 24 → 128 | Retains more facts; useful for chronicles and reputation. |
| `conocidos` + `@JugadorA` | The proper name appears in its phrases. |
