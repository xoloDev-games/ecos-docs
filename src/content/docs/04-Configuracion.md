# 04 — Configuración

Todos los números viven en un asset (`EcosConfigAsset`) que en runtime se convierte en
`EcosConfiguracion` (POCO testeable). Nada de esto requiere recompilar.

> **Regla general:** cada campo tiene un tooltip en el Inspector con el mismo texto (o
> más) que esta página. Si dudas del efecto de un valor, mira aquí la fórmula.

---

## 1. Propagación

### `maxSaltos` (int, 1..12 · por defecto 4)

Bocas máximas por las que viaja un eco. Es el **techo de la cadena**.

- `3` — rumor local (aldea pequeña).
- `4` — pueblo (por defecto).
- `6` — campaña/demo: cadena visible completa.
- `8+` — sagas; necesitarás ajustar degradación y credibilidad.

**Efecto de subirlo:** más versiones del rumor, más deformación acumulada y más coste.
**Efecto de bajarlo:** el relato se corta antes, más cerca de la verdad.

### `probabilidadContagioBase` (float 0..1 · 0,65)

Probabilidad de contagio **antes** de aplicar rasgos, nivel, credibilidad y afinidad.
La fórmula real es multiplicativa:

```
p = base
  × (0.35 + 1.15 × locuacidadEmisor)
  × (0.40 + 1.20 × credulidadReceptor)
  × (0.70 + 0.60 × autoridadEmisor)
  × confianzaEco
  × (1 − 0.12 × nivel)
  × afinidadElemental × gananciaCategoría
```

**Efecto de subirlo:** el rumor prende más y viaja más rápido.
**Ojo:** con `maxContagiosPorEco = 0` (abanico), subirlo **aplana la cadena**: casi todos
los NPCs se enteran en el primer salto y ya no quedan bocas nuevas. Si quieres
profundidad, súbelo **junto con** `maxContagiosPorEco = 1`.

### `maxContagiosPorEco` (int, 0..16 · 0)

Cuántas bocas **nuevas** puede contagiar un eco en un solo paso.

| Valor | Efecto | Sensación |
| --- | --- | --- |
| `0` | Abanico clásico: todos los que pasan la tirada se enteran a la vez. | El rumor "explota" y se satura. Realista en multitudes. |
| `1` | Boca a boca: exactamente una boca nueva por salto. | **Cadena visible.** Recomendado para narrativa y demos. |
| `2-3` | Híbrido: se abre un poco sin saturar. | Rumores que se bifurcan en dos o tres corrillos. |

**Efecto esperado al pasar de 0 a 1:** la profundidad deja de depender del azar y
recorre el censo del canal. Con 6 NPCs y `maxSaltos = 6` ves `v1..v6`.

### `contagioGarantizado` (bool · false)

Modo determinista: el eco **siempre** salta a la siguiente boca, sin tirada de contagio.
La degradación, la intención y la pérdida de credibilidad siguen aplicándose. La
profundidad la marcan `maxSaltos` y el número de NPCs.

- **True**: demos, tutoriales, escenas guionizadas. Cadena que **nunca** se corta.
- **False**: producción. El azar hace que cada partida tenga rumores distintos.

**Por qué existe:** con `maxContagiosPorEco = 1` hay **una** tirada por salto y su
probabilidad cae con la confianza y el nivel; un solo fallo mata el rumor a mitad. En
una demo eso se lee como bug ("sólo llega a 3 saltos").

### `maxEventosPorTick` (int, 16..4096 · 256)

Techo de ecos procesados por frame. Si hay más cola, espera al siguiente frame.

**Efecto:** no cambia la historia, sólo el ritmo y el coste. Con cientos de NPCs y
cadenas largas, súbelo si ves que el rumor va "a tirones".

### `maxNodosPorCanal` (int, 64..8192 · 512)

Nodos que guarda el grafo de cada canal antes de podar los ecos más antiguos.

**Efecto:** memorias largas (crónicas, reputación histórica) necesitan más nodos.
Sube la memoria del proceso si tienes muchos canales.

### `tiempoDeVidaEco` (float, 10..7200 · 900 s)

Cuánto "está fresco" un eco. Pasado ese tiempo deja de difundirse y se purga.

**Efecto:** valores altos mantienen rumores vivos durante toda la partida; bajos los
hacen olvidar rápido (útil en partidas largas con mucho ruido).

### `retardoPropagacionBase` (float, 0,5..60 · 4 s)

Retardo entre boca y boca cuando `intervaloDeformacion = 0`. El retardo real es
`base × (1 + 0,15 × nivel) ± jitter − 2 × sesgoVelocidad`.

**Efecto:** da "tiempo de chisme". 4 s es un rumor que se cuenta en una conversación;
0,5 s es un pueblo histérico.

### `retardoPropagacionJitter` (float, 0..30 · 3 s)

Aleatoriedad del retardo (± segundos). `0` = cadencia fija por boca.

### `intervaloDeformacion` (float, 0..120 · 0)

**TIMER de deformación.** Si es `> 0`, manda sobre todo lo anterior: cada X segundos
exactos la información salta de un NPC a otro y se deforma. Se ignoran el escalado por
nivel, el azar y los sesgos.

| Valor | Efecto |
| --- | --- |
| `0` | Retardo clásico orgánico (base + jitter + sesgos). |
| `2` | Cadena de 6 en 12 s. Ideal para demo. |
| `5` | Cadena de 6 en 30 s. Ritmo de "rumor que corre despacio". |
| `0,25` | Casi instantáneo; útil para tests. |

---

## 2. Degradación y credibilidad

### `factorDegradacionPorSalto` (float 0..1 · 0,22)

Presión de distorsión añadida **por salto**. Es el mando principal de la escalera.
La presión total es:

```
presión = factorDegradacionPorSalto × saltos
        + pesoLocuacidadEnDistorsion × locuacidadEmisor
        + pesoSesgoExageracion × sesgoExageracionEmisor
        + 0.15 × (1 − autoridadEmisor)
        − 0.10 × memoriaEmisor
        + 0.35 × (1 − confianzaEco)
        − 0.12 × (intensidad / 100)
        + afinidadExageracion + categoríaGananciaExageracion
```

Y se convierte en nivel con las bandas:

| Presión | Nivel |
| --- | --- |
| `< 0.20` | Literal |
| `< 0.42` | Suavizado |
| `< 0.64` | Adornado |
| `< 0.86` | Exagerado |
| `≥ 0.86` | Distorsionado |

El degradador es **monótono** (trinquete): el nivel del eco nunca "mejora" al viajar. La
cifra sí puede bajar dentro de un nivel (por ejemplo, Suavizado atenúa) y volver a subir en
el siguiente; la monotonía es del nivel, no de la cantidad.

| Valor | Cadena de 6 saltos esperada |
| --- | --- |
| `0,10` | Literal, Literal, Literal, Suavizado, Suavizado, Adornado |
| `0,22` | Literal, Literal, Suavizado, Adornado, Exagerado, Distorsionado |
| `0,33` | Literal, Suavizado, Adornado, Exagerado, Distorsionado, Distorsionado |
| `0,45` | Literal, Adornado, Exagerado, Distorsionado, Distorsionado, Distorsionado |

### `factorCredibilidadPorSalto` (float 0..1 · 0,16)

Credibilidad que pierde el eco por salto. La fórmula de la regla de degradación es:

```
confianza -= factorCredibilidadPorSalto + (1 − credibilidadDelNivel) × 0.25
```

donde `credibilidadDelNivel` es `1.00 / 0.85 / 0.70 / 0.45 / 0.25`.

**Efecto:** `0,16` es un rumor normal (muere alrededor del salto 4 si no sube la
confianza). `0,04` permite cadenas de 6 sin que se vuelva increíble antes de tiempo.

### `pesoLocuacidadEnDistorsion` (float 0..1 · 0,15)

Peso de la locuacidad del narrador en la distorsión. `0` = la personalidad no altera
el nivel (sólo si repite o no).

### `pesoSesgoExageracion` (float 0..1 · 0,35)

Peso del sesgo de exageración del perfil (`-1..+1`) en la presión. `0,35` permite que un
fanfarrón suba un nivel él solo; además, en `EcosReglaSesgoNarrador` su sesgo mueve la
**intensidad** (`± 8 puntos` por unidad de sesgo).

### `umbralConfianzaMinima` (float 0..1 · 0,15)

Por debajo de esta credibilidad el eco se entrega una última vez a los sinks (para que
la UI lo muestre), pero **ya no se propaga**.

| Valor | Efecto |
| --- | --- |
| `0,15` | Prudente: los rumores mueren si se vuelven increíbles. |
| `0,02` | Cadenas de 6 garantizadas (preset demo). |
| `0,50` | Mundo escéptico: sólo lo verosímil viaja. |

### `umbralIntensidadMinima` (int 0..100 · 10)

Intensidad mínima para que un eco merezca contarse. `10` deja pasar casi todo; `30`
filtra el ruido de gameplay (abrir puertas, romper cajas).

---

## 3. Contradicciones y ambivalencia

### `penalizacionContradiccion` (float 0..1 · 0,25)

Pérdida de credibilidad cuando el eco contradice a otro que el receptor ya cree (mismo
paciente, acciones antagonistas). Se pondera por la credibilidad de la creencia previa.

### `penalizacionContradiccionMaxima` (float 0..1 · 0,50)

Tope de pérdida acumulada en un mismo contagio.

### `bonusSinergia` (float 0..1 · 0,08)

Credibilidad extra cuando el eco **refuerza** una creencia previa (p. ej. "quemó el
bosque" + "arrasó la aldea").

### `contradiccionRequiereMismoPaciente` (bool · true)

- **True** (recomendado): "mató a un pastor" sólo choca con "salvó a un pastor".
  Matar a un pastor y salvar a un aldeano es **ambivalencia**, no contradicción.
- **False**: cualquier par de acciones antagonistas choca; el sujeto sólo puede
  sostener una versión de sí mismo por canal.

> Los relatos en pugna **no se borran nunca**: alimentan `EcosDossierSujeto`
> (reputación, ambivalencia, contradicciones). Ver
> [03 — Conceptos](03-Conceptos.md).

---

## 4. Multijugador / aislamiento

### `anonimizarAlCruzarScope` (bool · true)

Al cruzar un puente de canal, el eco pierde la identidad del jugador.

### `saltosParaAnonimizar` (int 0..8 · 3)

**Cómo funciona, en dos capas:**

1. **Regla de anonimización (pipeline, prioridad 50):** a partir de ese salto, el
   `SujetoId` del eco se sustituye por `@Desconocido`. Todo el sistema (incluida la
   ficha del sujeto) deja de saber quién lo hizo.
2. **Compositor:** si el oyente no conoce al sujeto y el eco llega a ese salto, se usa
   su `NombreVago` ("un forastero"). Además, en nivel `Distorsionado` hay un 35 % de
   probabilidad de anonimizar aunque se conozca.

| Valor | Efecto esperado |
| --- | --- |
| `0` | Anónimo desde el origen (rumor de "alguien"). |
| `3` | Nombre propio las 3 primeras bocas; después "alguien". **Por defecto.** |
| `6` (con `maxSaltos = 6`) | El nombre ("Aldric") se conserva en `v0..v5`; en `v6` (saltos = 6) pasa a `@Desconocido`. Preset demo. |
| `> maxSaltos` | Nunca se anonimiza por saltos. |

---

## 5. Determinismo

### `semillaMundo` (int · 1337)

Semilla maestra. Mismo valor ⇒ misma historia, en cualquier máquina.

### `modoSemilla` (`Fija` · `AleatoriaPorSesion`)

Cómo se elige la semilla maestra al construir el runtime:

| Valor | Qué hace | Cuándo usarlo |
| --- | --- | --- |
| `Fija` | Usa siempre `semillaMundo`. | Tests, replays, QA y **continuar una partida guardada**. |
| `AleatoriaPorSesion` | Sortea una semilla nueva en cada construcción del runtime. | Demos y sesiones donde quieres variedad. |

`AleatoriaPorSesion` es lo que trae la demo: **cada Play cuenta el rumor con otras
palabras, adornos, colores y coletillas**. Cambia la **redacción**, no el hecho: el verbo,
el paciente, la secuencia de niveles y las cifras siguen saliendo de los datos y de las
reglas. La semilla usada queda en `runtime.Config.SemillaMundo`.

#### “Sesión” no es lo mismo que “partida”

- **Sesión:** cada vez que se construye el runtime. En Unity, cada Play; en un build, cada
  arranque de la aplicación (o cada reconstrucción del runtime).
- **Partida:** el save slot lógico, desde “Nueva partida” hasta que el jugador continúa.

`AleatoriaPorSesion` **no guarda la semilla**. Si el jugador cierra el juego y continúa, el
runtime se reconstruye y la sesión nueva vuelve a sortear. Para que una partida nueva tenga
su propia semilla y **continuar la conserve**, usa `EcosSemillaPartida`:

```csharp
// Nueva partida: sortea y devuelve la semilla para guardarla en tu save.
int semillaGuardada;
var configNueva = EcosSemillaPartida.ParaNuevaPartida(configBase, out semillaGuardada);

var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(configNueva)
    .Construir();
// save.SemillaEcos = semillaGuardada;
```

```csharp
// Continuar: misma semilla guardada (+ los hechos/estado del save) -> misma historia.
var configCargada = EcosSemillaPartida.ParaContinuarPartida(configBase, save.SemillaEcos);

var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(configCargada)
    .Construir();
```

Ambos helpers clonan la configuración y la dejan en modo `Fija`; el asset original no se
modifica. El Core no impone un sistema de guardado: tú decides dónde persistir la semilla.

Para tests, replays y QA sin save, deja `modoSemilla = Fija` y fija `semillaMundo`: misma
semilla ⇒ misma frase byte a byte.

### `variacionPorOyente` (bool · true)

Añade el id del oyente a la semilla de composición: cada NPC lo cuenta con otras
palabras, pero de forma reproducible.

### `autoRegistrarPerfilesFuente` (bool · true)

Crea un perfil de "fuente" (narrador) para el sujeto de cada eco, de modo que hasta los
hechos de un jugador tengan estilo propio. Desmárcalo si registras los perfiles a mano.

---

## 6. Presets listos para pegar

| Preset | maxSaltos | maxContagiosPorEco | contagioGarantizado | intervaloDeformacion | factorDegradacion | factorCredibilidad | umbralConfianza | saltosParaAnonimizar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Producción / abanico** | 4 | 0 | false | 0 | 0,22 | 0,16 | 0,15 | 3 |
| **Boca a boca (juego)** | 6 | 1 | false | 0 | 0,20 | 0,10 | 0,10 | 4 |
| **Demo / guion** | 6 | 1 | **true** | **2** | 0,22 | 0,04 | 0,02 | 6 |
| **MMO / Edge** | 3 | 0 | false | 0 | 0,25 | 0,20 | 0,25 | 2 |
| **Secreto (sigilo)** | 4 | 1 | false | 0 | 0,15 | 0,25 | 0,30 | 0 |

Cómo aplicarlos:

- **Inspector:** edita `EcosConfig.asset`.
- **Código:**

```csharp
var config = new EcosConfiguracion
{
    MaxSaltos = 6,
    MaxContagiosPorEco = 1,
    ContagioGarantizado = true,
    IntervaloDeformacion = 2f,
    FactorDegradacionPorSalto = 0.22f,
    FactorCredibilidadPorSalto = 0.04f,
    UmbralConfianzaMinima = 0.02f,
    SaltosParaAnonimizar = 6
};
```

- **Escena de demo:** `Ecos ▸ Construir Escena de Demo` reaplica el preset de demo, incluido
  `modoSemilla = AleatoriaPorSesion` para que cada Play suene distinto.

---

## 7. Qué esperar al cambiar cada cosa

| Cambio | Efecto observable |
| --- | --- |
| `maxSaltos` 4 → 6 | El eco llega a `v6`; la última versión es más exagerada e increíble. |
| `maxContagiosPorEco` 0 → 1 | De "todos se enteran a la vez" a "cadena de 6 bocas visible". |
| `contagioGarantizado` false → true | La cadena deja de cortarse por azar; siempre llega al techo. |
| `intervaloDeformacion` 0 → 2 | El rumor avanza a tic-tac: un salto cada 2 s. |
| `factorDegradacionPorSalto` 0,22 → 0,33 | Se saltan niveles intermedios y satura en `Distorsionado` antes. |
| `factorCredibilidadPorSalto` 0,16 → 0,04 | El rumor sobrevive a los 6 saltos en vez de morir al cuarto. |
| `umbralConfianzaMinima` 0,15 → 0,02 | La última boca se emite aunque casi nadie la crea. |
| `saltosParaAnonimizar` 3 → 6 | El nombre propio aguanta toda la cadena. |
| `probabilidadContagioBase` 0,65 → 0,9 | Con abanico, se satura antes; con una boca por salto, evita cortes. |
| `pesoSesgoExageracion` 0 → 0,6 | Los perfiles fanfarrones distorsionan mucho más que los neutros. |
| `umbralIntensidadMinima` 10 → 30 | Los hechos triviales dejan de convertirse en rumores. |
