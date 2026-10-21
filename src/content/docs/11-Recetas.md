# 11 — Recetas

Escenarios completos, con valores y resultado esperado. Copia, ajusta ids y prueba.

---

## Receta 1 — Cadena de 6 bocas (la demo)

**Objetivo:** ver el mismo rumor deformarse seis veces, una boca por salto.

### Datos

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

### Escena

- 1 `EcosManager` con `Ecos Bootstrap (Sentis)`.
- 1 jugador con `EcosJugadorLocal` (`id = A`).
- 6 NPCs con `EcosMemoriaNpc` + `EcosListener`:
  - mismo `scope` (`JugadorLocal`),
  - `participarEnDifusion = true`,
  - `soloCuandoSoyElNarrador = true`,
  - perfiles distintos (uno cotilla, uno escéptico, uno capitán...).
- 1 trigger con `accionId = diezmar_bandidos`, `objetoId = @Nadie`, `intensidad = 90`.

### Resultado esperado

Consola, cada 2 s:

```
v0  @JugadorA  eliminó a un grupo de 10 bandidos, con su espada        Literal        conf 1.00
v1  NPC 1      eliminó a una banda de ~2 bandidos, con su espada       Suavizado      conf 0.96
v2  NPC 2      eliminó a una hueste de ~35 bandidos, sin ayuda...      Adornado       conf 0.88
v3  NPC 3      eliminó a un ejército de ~70 bandidos, con las manos... Exagerado     conf 0.62
v4  NPC 4      eliminó a un pelotón de ~110 bandidos, con las manos... Distorsionado conf 0.39
v5  NPC 5      ...                                                     Distorsionado  conf 0.20
v6  NPC 6      ...                                                     Distorsionado  conf 0.08
```

Las frases exactas dependen de las plantillas y de la semilla; lo importante es que
**la cifra baja y luego sube, el colectivo y el instrumento cambian** y la confianza cae.

**Si sólo llega a 3-4 saltos:** falta `contagioGarantizado` o `maxContagiosPorEco = 1`.
**Si todos los NPCs muestran lo mismo:** falta `soloCuandoSoyElNarrador`.
**Si la cadena tarda una eternidad:** baja `intervaloDeformacion`.

---

## Receta 2 — El francotirador que "dispara cada vez más lejos"

**Objetivo:** exagerar una distancia de forma creíble.

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
    // Sin CantidadesPorNivel: la curva automática calcula 500, 450, 850, 1.200 y 1.800.
    Valencia = -70,
    Peso = 0.85f
}
```

**Resultado esperado:** 500 → 450 → 850 → 1.200 → 1.800 m. La confianza cae, el nivel
Suavizado pierde detalle y los niveles altos recuperan la magnitud. La curva de medidas es
más suave que la de recuentos para que un disparo no acabe en 50.000 m.

**Variación:** para un arma mágica, usa `CantidadesPorNivel = new[] { 500, 900, 1500,
2400, 4000 }` y sube `factorDegradacionPorSalto` para que el nivel llegue antes. El
override es opcional: sólo lo necesitas si quieres una escalera exacta.

---

## Receta 3 — La hazaña de los 110 bandidos

**Objetivo:** el ejemplo canónico del rumor.

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
    // Sin tabla de cifras: 10 -> ~2 -> ~35 -> ~70 -> ~110.
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

**Resultado esperado:**

```
"eliminó a un grupo de 10 bandidos, con su espada"
"eliminó a una banda de ~2 bandidos, con su espada"
"eliminó a una hueste de ~35 bandidos, sin ayuda de nadie"
"eliminó a un ejército de ~70 bandidos, con las manos desnudas"
"eliminó a un pelotón de ~110 bandidos, con las manos desnudas"
```

**Por qué funciona:** el verbo y el paciente (los bandidos) no cambian; la cifra la
calcula la curva automática y el colectivo/instrumento son datos opcionales del
diseñador.

**Si quieres que el relato gire:** añade `AccionInversaId` a la acción original y declara
la variante opuesta. Por ejemplo, `regicidio` (10 soldados) → `salvar_rey` (100 soldados,
preposición `contra`). En Distorsionado, `EcosReglaDeformacionNarrativa` cambia la acción,
el objeto y la valencia, pero conserva `AccionOriginalId`. La variante es texto declarado,
no generado; ver [06 — Cantidades](06-Cantidades.md#4-inversión-cuando-el-relato-gira).

---

## Receta 4 — Anonimización: tres niveles

**Objetivo:** controlar cuándo el nombre propio se convierte en "un forastero".

### A. Anónimo desde el principio

```
saltosParaAnonimizar = 0
```

Resultado: desde el primer eco, "alguien" o "un forastero". Útil para rumores de
fondo ("dicen que alguien quemó el bosque").

### B. Nombre durante 3 bocas

```
saltosParaAnonimizar = 3
```

Resultado:

```
v0: "Aldric quemó la aldea"
v1: "Aldric quemó la aldea"
v2: "Aldric quemó la aldea"
v3: "un forastero quemó la aldea"   <- regla de anonimización (Saltos >= 3)
```

### C. Nombre toda la cadena (demo)

```
saltosParaAnonimizar = 6   (con maxSaltos = 6)
```

Resultado: "Aldric" en `v0..v5`; en `v6` (saltos = 6) la regla lo sustituye por
`@Desconocido`. En `Distorsionado` aún puede anonimizarse antes por la tirada del 35 %
del compositor; si quieres impedirlo, pon `saltosParaAnonimizar` por encima de
`maxSaltos` y evita el nivel máximo.

**Qué mirar:** la ficha del sujeto (`EcosSystem.TryDossier`). En el caso A/B, a partir
del salto de anonimización el eco deja de atribuirse a `@JugadorA` y la reputación del
canal deja de moverse por ese relato.

---

## Receta 5 — Dos jugadores aislados (y un puente a la guardia)

**Objetivo:** A y B no comparten nada; la guardia oye rumores anonimizados de ambos.

### Escena

- Jugador A con `EcosJugadorLocal.id = A`.
- Jugador B con `EcosJugadorLocal.id = B` (otra escena/instancia).
- NPCs de A con `scope = Jugador:A`.
- NPCs de B con `scope = Jugador:B`.
- Guardia con `scope = Faccion:guardia`.

### Puentes (en el bootstrap de cada jugador)

```csharp
var puenteA = new EcosPuenteDeScope(EcosScope.Jugador("A"), EcosScope.Faccion("guardia"), true)
{
    SaltosMinimos = 3,
    Probabilidad = 0.6f,
    PerdidaConfianza = 0.2f
};
```

Repite para B. Añade ambos al bootstrap (`puentes` en el Inspector o
`builder.ConPuente(...)`).

**Resultado esperado:**

- Un hecho de A **nunca** aparece en el canal de B.
- A partir del tercer salto, la guardia recibe "un forastero…" (sin nombre).
- La guardia puede repropagar dentro de su facción, pero no vuelve a A/B sin otro
  puente.

**Error típico:** poner a los NPCs de A en `Global` "para que vean todo". Eso rompe el
aislamiento: A y B comparten el mismo canal global.

---

## Receta 6 — Biblioteca bilingüe

**Objetivo:** el mismo juego en español e inglés sin duplicar lógica.

1. Duplica `EcosBiblioteca_ES` → `EcosBiblioteca_EN`.
2. Traduce sólo los textos visibles.
3. Mantén ids, categorías, valencias, pesos y todas las tablas numéricas.
4. Elige el asset al arrancar:

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

**Resultado esperado:**

- ES: "eliminó a un pelotón de ~110 bandidos, con las manos desnudas".
- EN: "killed a platoon of ~110 bandits bare-handed".

El modelo multilingüe mapea "killed" y "eliminó" a la misma categoría, así que las
afinidades y el color no cambian de idioma.

**Ojo:** las plantillas EN necesitan su propio orden de palabras. No traduzcas la
plantilla ES palabra por palabra: crea una plantilla EN
(`{atribucion}{sujeto} {verbo}{objeto}{magnitud}{sufijo}` funciona igual, pero revisa
artículos y concordancia).

---

## Receta 7 — Contradicciones y ambivalencia

**Objetivo:** un sujeto que mató a un pastor **y** salvó a un aldeano. No es un bug: es
un dilema.

1. Declara las acciones con valencia opuesta:

```csharp
Id = "matar_pastor",  Valencia = -100, Peso = 0.9f, AntagonistaDe = new[] { "salvar_aldeano" };
Id = "salvar_aldeano", Valencia =  100, Peso = 0.9f;
```

2. Deja `contradiccionRequiereMismoPaciente = true` (por defecto).
3. Emite ambos hechos en el mismo canal.

**Resultado esperado en la ficha:**

```
Reputación:     ~0 (se compensan)
Ambivalencia:   alta (0.7-1.0)
Contradicciones: 0   <- son pacientes distintos
```

Si emites "matar_pastor" y "salvar_pastor" (mismo paciente), entonces sí:

```
Contradicciones: 1
Confianza del segundo eco: reducida por penalizacionContradiccion
```

**Para verlo:**

```csharp
EcosDossierSujeto ficha;
EcosSystem.TryDossier(EcosScope.Jugador("A"), "@JugadorA", out ficha);
Debug.Log(ficha.Reputacion + " / " + ficha.Ambivalencia + " / " + ficha.Contradicciones);
```

---

## Receta 8 — Reputación de facción con un sink

**Objetivo:** reaccionar a hechos, no a frases.

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

**Resultado esperado:** `Alarmas` sube una vez por eco recibido, no por frase. Si el
mismo eco llega en seis versiones, recibes seis avisos (uno por salto). Si sólo quieres
el primero, filtra por `eco.Saltos == 0` o por `eco.Id`.

---

## Receta 9 — El fuego corre más (degradador propio)

**Objetivo:** que los rumores de fuego suban un nivel extra, sin tocar el resto.

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

Registro:

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConDegradador(new DegradadorFuego())
    .Construir();
```

**Resultado esperado:** un rumor de fuego salta de `Adornado` a `Exagerado` en el mismo
salto. El resto de categorías sigue igual. **Cuidado:** si lo combinas con
`factorDegradacionPorSalto = 0,33`, el fuego satura en `Distorsionado` en dos saltos.

---

## Receta 10 — Modo sigilo: el rumor no debe correr

**Objetivo:** un asesinato en una mansión; sólo unos pocos se enteran.

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

Perfiles: mayordomo (`locuacidad 0.2`, `credulidad 0.4`), invitados (`0.5/0.6`),
guardia (`0.3/0.2`).

**Resultado esperado:** el rumor muere a los 2-3 saltos por credibilidad o por falta de
contagio. La frase se vuelve anónima pronto. Es el opuesto exacto de la demo.

---

## Receta 11 — El juego del teléfono en la taberna

**Objetivo:** 12 NPCs, cadena larga, ritmo de conversación.

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

**Resultado esperado:** un salto cada 1,5 s; la cadena avanza mientras haya NPCs. Con 12
bocas y `maxSaltos = 8`, se corta en 8. La degradación es más lenta que en la demo, así
que la última versión es menos loca pero más "humana".

**Ajuste:** si quieres que se corte por censo y no por saltos, sube `maxSaltos` a 12.

---

## Receta 12 — Replay determinista (tests y QA)

**Objetivo:** reproducir exactamente la misma cadena en dos ejecuciones.

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

**Resultado esperado:** las mismas frases, en el mismo orden, con la misma confianza.
Cambiar `SemillaMundo` cambia las palabras (dentro de las plantillas) pero no la
secuencia de niveles ni las cifras.

Si lo que quieres es que **cada sesión** suene distinta, usa
`modoSemilla = EcosModoSemilla.AleatoriaPorSesion`. El runtime sortea una semilla y la deja
en `runtime.Config.SemillaMundo`; el resto del replay sigue siendo determinista. La demo lo
trae activado. No cambia el hecho (verbo/paciente) ni la escalera de niveles: sólo la
redacción.

Ojo: una **sesión** es cada construcción del runtime (cada Play / arranque). Si quieres una
semilla por **partida guardada** que se conserve al continuar, usa
`EcosSemillaPartida.ParaNuevaPartida` al crear la partida, guarda la semilla en tu save y
`EcosSemillaPartida.ParaContinuarPartida` al cargarla. Ver
[04 — Configuración](04-Configuracion.md#sesión-no-es-lo-mismo-que-partida).

**Tests headless:**

```bash
dotnet test tests/Ecos.Tests.csproj
```

---

## Receta 13 — Guardar/cargar rumores

No hay un sistema de save integrado. Si lo necesitas:

1. Guarda la **semilla del mundo** y la **lista de hechos registrados**
   (`sujetoId`, `accionId`, `objetoId`, `intensidad`, `intencion`, `scope`, tiempo).
2. Al cargar, reconstruye el runtime con la misma semilla y vuelve a registrar los
   hechos en orden.
3. Avanza el reloj el mismo tiempo.

**Por qué:** el sistema es determinista y no guarda estado oculto. Replay = save. Si
prefieres persistir el grafo, guarda también `Nivel`, `Confianza`, `Saltos` y `Semilla`
de cada nodo; `EcoEvento` es un struct de datos planos, fácil de serializar con tu
propio DTO.

**No guardes textos**: se recomponen desde los ids y la semilla. Así una traducción o
un cambio de plantilla se aplica también a las partidas guardadas.

---

## Receta 14 — Debug sin escena

**Objetivo:** probar la curva automática de cantidades sin entrar en Play.

1. `Window ▸ Ecos ▸ Consola de Ecos`.
2. En el **Laboratorio de frases**, escribe acción, objeto y sujeto.
3. Mueve el nivel y la intención.
4. Pulsa **Generar**.

**Resultado esperado:** la frase para cada combinación, sin propagación. Es la forma
más rápida de validar la curva automática, un override o una plantilla nueva.

---

## Tabla resumen

| Quiero... | Receta | Mando clave |
| --- | --- | --- |
| Cadena de 6 visible | 1 | `maxSaltos=6`, `maxContagiosPorEco=1`, `contagioGarantizado=true` |
| Exagerar una distancia | 2 | `CantidadBase` + curva automática (u override suave) |
| Exagerar un recuento | 3 | `CantidadBase` + `CantidadComoObjeto` + contenedor opcional |
| Ocultar al culpable | 4 | `saltosParaAnonimizar` |
| Aislar jugadores | 5 | scopes + puentes |
| Bilingüe | 6 | dos bibliotecas con los mismos ids |
| Dilema moral | 7 | `Valencia` opuesta + `AntagonistaDe` |
| Reaccionar a hechos | 8 | `IEcosSink` |
| Un elemento más loco | 9 | `IEcosDegradador` |
| Rumor que no corre | 10 | base baja + umbral alto |
| Cadena larga y lenta | 11 | `intervaloDeformacion` |
| Reproducir en QA | 12 | `SemillaMundo` + reloj manual |
| Guardar partida | 13 | replay de hechos |
| Probar sin Play | 14 | Consola de Ecos |
