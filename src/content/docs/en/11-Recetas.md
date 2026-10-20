# 11 — Recipes

Complete scenarios, with values and an expected result. Copy them, adjust the ids and try them out.

---

## Recipe 1 — A chain of 6 mouths (the demo)

**Goal:** watch the same rumor deform six times, one mouth per hop.

### Data

`EcosConfig.asset`:

```
maxSaltos                  = 6
maxContagiosPorEco         = 1
contagioGarantizado        = true
intervaloDeformacion       = 2
factorDegradacionPorSalto  = 0.22
factorCredibilidadPorSalto = 0.04
umbralConfianzaMinima      = 0.02
saltosParaAnonimizar       = 6
```

### Scene

- 1 `EcosManager` with `Ecos Bootstrap (Sentis)`.
- 1 player with `EcosJugadorLocal` (`id = A`).
- 6 NPCs with `EcosMemoriaNpc` + `EcosListener`:
  - same `scope` (`JugadorLocal`),
  - `participarEnDifusion = true`,
  - `soloCuandoSoyElNarrador = true`,
  - different profiles (one gossip, one skeptic, one captain...).
- 1 trigger with `accionId = diezmar_bandidos`, `objetoId = @Nadie`, `intensidad = 90`.

### Expected result

Console, every 2 s:

```
v0  @JugadorA  eliminó a un grupo de 10 bandidos, con su espada        Literal        conf 1.00
v1  NPC 1      eliminó a una banda de ~30 bandidos, con su espada      Suavizado      conf 0.96
v2  NPC 2      eliminó a una hueste de ~95 bandidos, sin ayuda...      Adornado       conf 0.88
v3  NPC 3      eliminó a un ejército de ~350 bandidos, con las manos... Exagerado     conf 0.62
v4  NPC 4      eliminó a un pelotón de ~1.100 bandidos, con las manos... Distorsionado conf 0.39
v5  NPC 5      ...                                                     Distorsionado  conf 0.20
v6  NPC 6      ...                                                     Distorsionado  conf 0.08
```

The exact sentences depend on the templates and the seed; what matters is that
**the figure, the collective and the instrument scale** and confidence drops.

**If it only reaches 3-4 hops:** `contagioGarantizado` or `maxContagiosPorEco = 1` is missing.
**If every NPC shows the same thing:** `soloCuandoSoyElNarrador` is missing.
**If the chain takes forever:** lower `intervaloDeformacion`.

---

## Recipe 2 — The sniper who "shoots ever farther"

**Goal:** exaggerate a distance believably.

```csharp
new EcosAccion
{
    Id = "abatir_distancia",
    VerboSingular = "eliminó a",
    VerboPlural = "eliminaron a",
    Categoria = "larga_distancia",
    CantidadBase = 500,
    UnidadCantidad = "metros",
    PreposicionCantidad = "desde"
    // No CantidadesPorNivel: the automatic curve computes 500, 750, 1,000, 1,400 and 2,000.
    Valencia = -70,
    Peso = 0.85f
}
```

**Expected result:** 500 → 750 → 1,000 → 1,400 → 2,000 m. Confidence drops, but the
story remains plausible. The measurement curve is gentler than the head-count one so
that a shot does not end up at 50,000 m.

**Variation:** for a magic weapon, use `CantidadesPorNivel = new[] { 500, 900, 1500,
2400, 4000 }` and raise `factorDegradacionPorSalto` so the level arrives sooner. The
override is optional: you only need it if you want an exact ladder.

---

## Recipe 3 — The feat of the ~1,100 bandits

**Goal:** the canonical rumor example.

```csharp
new EcosAccion
{
    Id = "diezmar_bandidos",
    VerboSingular = "eliminó a",
    VerboPlural = "eliminaron a",
    Categoria = "pacifico",
    IntencionSugerida = EcosIntencion.Alarde,
    CantidadBase = 10,
    UnidadCantidad = "bandidos",
    CantidadComoObjeto = true,
    // No figure table: 10 -> ~30 -> ~90 -> ~350 -> ~1,100.
    ContenedoresPorNivel = new[]
    {
        "un grupo de", "una banda de", "una hueste de", "un ejército de", "un pelotón de"
    },
    InstrumentosPorNivel = new[]
    {
        "con su espada", "con su espada", "sin ayuda de nadie",
        "con las manos desnudas", "con las manos desnudas"
    },
    Valencia = 50,
    Peso = 0.70f
}
```

**Expected result:**

```
"eliminó a un grupo de 10 bandidos, con su espada"
"eliminó a una banda de ~30 bandidos, con su espada"
"eliminó a una hueste de ~90 bandidos, sin ayuda de nadie"
"eliminó a un ejército de ~350 bandidos, con las manos desnudas"
"eliminó a un pelotón de ~1.100 bandidos, con las manos desnudas"
```

**Why it works:** the verb and the patient (the bandits) do not change; the figure is
computed by the automatic curve and the collective/instrument are optional designer
data.

---

## Recipe 4 — Anonymization: three levels

**Goal:** control when a proper name becomes "a stranger".

### A. Anonymous from the start

```
saltosParaAnonimizar = 0
```

Result: from the very first echo, "someone" or "a stranger". Useful for background
rumors ("they say someone burned the forest").

### B. Name for 3 mouths

```
saltosParaAnonimizar = 3
```

Result:

```
v0: "Aldric quemó la aldea"
v1: "Aldric quemó la aldea"
v2: "Aldric quemó la aldea"
v3: "un forastero quemó la aldea"   <- regla de anonimización (Saltos >= 3)
```

### C. Name for the whole chain (demo)

```
saltosParaAnonimizar = 6   (con maxSaltos = 6)
```

Result: "Aldric" in `v0..v5`; at `v6` (`saltos = 6`) the rule replaces it with
`@Desconocido`. At `Distorted` it can still be anonymized earlier by the composer's
35 % roll; if you want to prevent that, set `saltosParaAnonimizar` above `maxSaltos`
and avoid the top level.

**What to look at:** the subject's dossier (`EcosSystem.TryDossier`). In case A/B, from
the anonymization hop onward the echo stops being attributed to `@JugadorA` and the
channel's reputation stops moving because of that story.

---

## Recipe 5 — Two isolated players (and a bridge to the guard)

**Goal:** A and B share nothing; the guard hears anonymized rumors from both.

### Scene

- Player A with `EcosJugadorLocal.id = A`.
- Player B with `EcosJugadorLocal.id = B` (another scene/instance).
- A's NPCs with `scope = Jugador:A`.
- B's NPCs with `scope = Jugador:B`.
- Guard with `scope = Faccion:guardia`.

### Bridges (in each player's bootstrap)

```csharp
var puenteA = new EcosPuenteDeScope(EcosScope.Jugador("A"), EcosScope.Faccion("guardia"), true)
{
    SaltosMinimos = 3,
    Probabilidad = 0.6f,
    PerdidaConfianza = 0.2f
};
```

Repeat for B. Add both to the bootstrap (`puentes` in the Inspector or
`builder.ConPuente(...)`).

**Expected result:**

- A fact from A **never** appears in B's channel.
- From the third hop onward, the guard receives "a stranger…" (no name).
- The guard can re-propagate inside its faction, but it does not return to A/B without
  another bridge.

**Typical mistake:** putting A's NPCs in `Global` "so they see everything". That breaks
isolation: A and B share the same global channel.

---

## Recipe 6 — Bilingual library

**Goal:** the same game in Spanish and English without duplicating logic.

1. Duplicate `EcosBiblioteca_ES` → `EcosBiblioteca_EN`.
2. Translate only the visible texts.
3. Keep ids, categories, valences, weights and all numeric tables.
4. Choose the asset at startup:

```csharp
public EcosBibliotecaAsset es;
public EcosBibliotecaAsset en;
public EcosBootstrapSentis bootstrap;

void Awake()
{
    bootstrap.biblioteca =
        Application.systemLanguage == SystemLanguage.English ? en : es;
}
```

**Expected result:**

- ES: "eliminó a un pelotón de ~1.100 bandidos, con las manos desnudas".
- EN: "killed a platoon of ~1,100 bandits bare-handed".

The multilingual model maps "killed" and "eliminó" to the same category, so affinities
and color do not change with the language.

**Note:** EN templates need their own word order. Do not translate the ES template word
for word: create an EN template
(`{atribucion}{sujeto} {verbo}{objeto}{magnitud}{sufijo}` works the same, but check
articles and agreement).

---

## Recipe 7 — Contradictions and ambivalence

**Goal:** a subject who killed a shepherd **and** saved a villager. It is not a bug: it is
a dilemma.

1. Declare the actions with opposite valence:

```csharp
Id = "matar_pastor",  Valencia = -100, Peso = 0.9f, AntagonistaDe = new[] { "salvar_aldeano" };
Id = "salvar_aldeano", Valencia =  100, Peso = 0.9f;
```

2. Leave `contradiccionRequiereMismoPaciente = true` (the default).
3. Emit both facts in the same channel.

**Expected result in the dossier:**

```
Reputación:     ~0 (se compensan)
Ambivalencia:   alta (0.7-1.0)
Contradicciones: 0   <- son pacientes distintos
```

If you emit "matar_pastor" and "salvar_pastor" (same patient), then yes:

```
Contradicciones: 1
Confianza del segundo eco: reducida por penalizacionContradiccion
```

**To see it:**

```csharp
EcosDossierSujeto ficha;
EcosSystem.TryDossier(EcosScope.Jugador("A"), "@JugadorA", out ficha);
Debug.Log(ficha.Reputacion + " / " + ficha.Ambivalencia + " / " + ficha.Contradicciones);
```

---

## Recipe 8 — Faction reputation with a sink

**Goal:** react to facts, not to sentences.

```csharp
public sealed class ReputacionGuardia : IEcosSink, IDisposable
{
    private readonly IDisposable _sub;
    public int Alarmas { get; private set; }

    public ReputacionGuardia()
    {
        _sub = EcosSystem.Suscribir(EcosScope.Faccion("guardia"), this);
    }

    public void RecibirEco(in EcoEvento eco)
    {
        if (eco.AccionId == "quemar" || eco.AccionId == "matar_pastor")
            Alarmas++;
    }

    public void Dispose() { _sub.Dispose(); }
}
```

**Expected result:** `Alarmas` goes up once per echo received, not per sentence. If the
same echo arrives in six versions, you receive six notifications (one per hop). If you
only want the first one, filter by `eco.Saltos == 0` or by `eco.Id`.

---

## Recipe 9 — Fire spreads faster (custom degrader)

**Goal:** make fire rumors go up one extra level, without touching the rest.

```csharp
using System;
using xoloDev.Ecos.Core;

public sealed class DegradadorFuego : IEcosDegradador
{
    public EcosNivelExageracion Evaluar(in EcoEvento eco, in EcosContextoPropagacion contexto)
    {
        if (contexto.Categorias != null && eco.CategoriaId >= 0)
        {
            string nombre = contexto.Categorias.NombreDe(eco.CategoriaId);
            if (string.Equals(nombre, "fuego", StringComparison.OrdinalIgnoreCase))
                return (EcosNivelExageracion)Math.Min(4, (int)eco.Nivel + 1);
        }
        return eco.Nivel;
    }
}
```

Registration:

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConDegradador(new DegradadorFuego())
    .Construir();
```

**Expected result:** a fire rumor jumps from `Adorned` to `Exaggerated` on the same hop.
The rest of the categories stay the same. **Careful:** if you combine it with
`factorDegradacionPorSalto = 0,33`, fire saturates at `Distorted` in two hops.

---

## Recipe 10 — Stealth mode: the rumor must not spread

**Goal:** a murder in a mansion; only a few people find out.

```
maxSaltos                  = 4
maxContagiosPorEco         = 1
contagioGarantizado        = false
probabilidadContagioBase   = 0.25
factorDegradacionPorSalto  = 0.15
factorCredibilidadPorSalto = 0.25
umbralConfianzaMinima      = 0.30
saltosParaAnonimizar       = 0
umbralIntensidadMinima     = 30
```

Profiles: butler (`locuacidad 0.2`, `credulidad 0.4`), guests (`0.5/0.6`), guard
(`0.3/0.2`).

**Expected result:** the rumor dies at 2-3 hops, either from credibility or from lack of
contagion. The sentence becomes anonymous early. It is the exact opposite of the demo.

---

## Recipe 11 — The telephone game in the tavern

**Goal:** 12 NPCs, a long chain, conversation pacing.

```
maxSaltos            = 8
maxContagiosPorEco   = 1
contagioGarantizado  = false
probabilidadContagioBase = 0.95
intervaloDeformacion = 1.5
factorDegradacionPorSalto = 0.18
factorCredibilidadPorSalto = 0.07
umbralConfianzaMinima = 0.05
```

**Expected result:** one hop every 1.5 s; the chain advances as long as there are NPCs.
With 12 mouths and `maxSaltos = 8`, it is cut at 8. Degradation is slower than in the
demo, so the last version is less crazy but more "human".

**Tuning:** if you want it to be cut by census rather than by hops, raise `maxSaltos`
to 12.

---

## Recipe 12 — Deterministic replay (tests and QA)

**Goal:** reproduce exactly the same chain across two runs.

```csharp
var config = new EcosConfiguracion
{
    SemillaMundo = 424242,
    MaxSaltos = 6,
    MaxContagiosPorEco = 1,
    ContagioGarantizado = true,
    IntervaloDeformacion = 0f,
    RetardoPropagacionBase = 1f,
    RetardoPropagacionJitter = 0f
};

var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(config)
    .ConBiblioteca(EcosHechosDeDemo.CrearBibliotecaDeDemo())
    .ConReloj(new EcosRelojManual())
    .Construir();

runtime.RegistrarNpc(new EcosPerfilNpc { Id = "N1", Scope = EcosScope.Jugador("A"), Locuacidad = 1f });
runtime.RegistrarNpc(new EcosPerfilNpc { Id = "N2", Scope = EcosScope.Jugador("A"), Locuacidad = 1f });
runtime.RegistrarEvento("A", "rescatar", "@Nadie", 90);

for (int i = 0; i < 20; i++) runtime.Tick(1.0);
```

**Expected result:** the same sentences, in the same order, with the same confidence.
Changing `SemillaMundo` changes the words (within the templates) but not the sequence of
levels or the figures.

If what you want is for **each session** to sound different, use
`modoSemilla = EcosModoSemilla.AleatoriaPorSesion`. The runtime draws a seed and leaves
it in `runtime.Config.SemillaMundo`; the rest of the replay is still deterministic. The
demo ships with it enabled. It does not change the fact (verb/patient) or the ladder of
levels: only the wording.

Note: a **session** is each construction of the runtime (each Play / startup). If you
want a seed per **saved game** that is preserved when continuing, use
`EcosSemillaPartida.ParaNuevaPartida` when creating the game, store the seed in your save
and `EcosSemillaPartida.ParaContinuarPartida` when loading it. See
[04 — Configuration](04-Configuracion.md#session-is-not-the-same-as-playthrough).

**Headless tests:**

```bash
dotnet test tests/Ecos.Tests.csproj
```

---

## Recipe 13 — Saving/loading rumors

There is no built-in save system. If you need one:

1. Save the **world seed** and the **list of registered facts**
   (`sujetoId`, `accionId`, `objetoId`, `intensidad`, `intencion`, `scope`, time).
2. On load, rebuild the runtime with the same seed and register the facts again in
   order.
3. Advance the clock by the same amount of time.

**Why:** the system is deterministic and keeps no hidden state. Replay = save. If you
prefer to persist the graph, also save `Nivel`, `Confianza`, `Saltos` and `Semilla` for
each node; `EcoEvento` is a flat data struct, easy to serialize with your own DTO.

**Do not save texts**: they are recomposed from the ids and the seed. That way a
translation or a template change also applies to saved games.

---

## Recipe 14 — Debugging without a scene

**Goal:** test the automatic quantity curve without entering Play mode.

1. `Window ▸ Ecos ▸ Consola de Ecos`.
2. In the **Sentence lab**, type the action, the object and the subject.
3. Move the level and the intention.
4. Press **Generate**.

**Expected result:** the sentence for each combination, with no propagation. It is the
fastest way to validate the automatic curve, an override or a new template.

---

## Summary table

| I want to... | Recipe | Key setting |
| --- | --- | --- |
| See a chain of 6 | 1 | `maxSaltos=6`, `maxContagiosPorEco=1`, `contagioGarantizado=true` |
| Exaggerate a distance | 2 | `CantidadBase` + automatic curve (or a gentle override) |
| Exaggerate a head count | 3 | `CantidadBase` + `CantidadComoObjeto` + optional container |
| Hide the culprit | 4 | `saltosParaAnonimizar` |
| Isolate players | 5 | scopes + bridges |
| Be bilingual | 6 | two libraries with the same ids |
| Pose a moral dilemma | 7 | opposite `Valencia` + `AntagonistaDe` |
| React to facts | 8 | `IEcosSink` |
| Make one element wilder | 9 | `IEcosDegradador` |
| A rumor that does not spread | 10 | low base + high threshold |
| A long, slow chain | 11 | `intervaloDeformacion` |
| Reproduce in QA | 12 | `SemillaMundo` + manual clock |
| Save a playthrough | 13 | replay of facts |
| Test without Play | 14 | Consola de Ecos |
