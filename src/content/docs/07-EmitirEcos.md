# 07 — Emitir ecos

Un eco nace cuando algo ocurre. Hay dos caminos: **componente** (diseñador, 0 código) o
**código** (gameplay, herramientas, servidores).

---

## 1. La vía del diseñador: `Eco Trigger Action`

Añade `Ecos ▸ Eco Trigger Action` a cualquier GameObject con Collider.

### Campos

| Campo | Tipo | Para qué | Ejemplo |
| --- | --- | --- | --- |
| `accionId` | string | Id de la acción en la biblioteca. | `quemar` |
| `objetoId` | string | Id del paciente. | `aldea` |
| `intensidad` | int 0..100 | Magnitud real del hecho **antes** de deformarse. | `80` |
| `intencion` | enum | Intención inicial (el clasificador puede cambiarla). | `Advertencia` |
| `emitirAlStart` | bool | Emite al arrancar la escena. | `false` |
| `emitirAlEntrarEnTrigger` | bool | Emite cuando algo entra en el trigger. | `true` |
| `tagDisparador` | string | Sólo dispara con esa tag. Vacío = cualquiera. | `Player` |
| `cooldown` | float | Segundos mínimos entre emisiones. `0` = sin límite. | `5` |
| `soloUnaVez` | bool | Sólo emite una vez mientras viva el componente (por sesión: cada Play o arranque). No se guarda en el save. | `false` |
| `onEmision` | UnityEvent | Se invoca tras emitir (VFX, audio). | — |
| `onFrase` | UnityEvent\<string\> | Recibe la frase compuesta. | — |
| `oyenteDemostracion` | `EcosPerfilNpcAsset` | Perfil para componer `onFrase`. | — |
| `logEmisiones` | bool | Log en consola. | `true` en demo |

### Campos heredados de `EcosEmisor`

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `scope` | `EcosScopeReferencia` | Canal donde se publica. Por defecto, el jugador local. |
| `sujetoId` | string | Quién protagoniza. Vacío = `EcosIdentidad` o nombre del GameObject. |

### Configuración típica de un cubo de demo

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

**Qué esperar:** al pisarlo, la consola muestra

```
[Ecos] Emitido: [Jugador:A] @JugadorA quemar aldea | Literal/Advertencia conf=1.00 saltos=0
```

y, si hay NPCs en el canal, empiezan los contagios.

### Disparar desde UI o animación

`EmitirEco()` es público. En un botón:

1. `OnClick()` → `+` → arrastra el GameObject del trigger.
2. Elige `EcosTriggerAction ▸ EmitirEco`.

También puedes engancharlo a `Animation Events`, `Timeline` o un `UnityEvent` propio.

### Reiniciar un trigger de un solo uso

```csharp
trigger.ReiniciarDisparador();
```

Vuelve a poner `_yaEmitido = false` y limpia el cooldown.

### Emitir en el canal de **otro** jugador

```csharp
trigger.EmitirEco(EcosScope.Jugador("B"));
```

Esto es útil para hechos del mundo que deben afectar a un jugador concreto (trampas,
eventos de guion).

---

## 2. La vía del código

### 2.1 La forma corta (canal de jugador)

```csharp
EcosSystem.RegistrarEvento("A", "quemar", "aldea", 80);
```

- `"A"` es el id del jugador; internamente crea `EcosScope.Jugador("A")`.
- `objetoId` por defecto es `"@Nadie"`.
- `intensidad` por defecto es `50`.

### 2.2 La forma completa (cualquier canal)

```csharp
EcosSystem.RegistrarEvento(
    EcosScope.Faccion("guardia"),
    "@Capitan",
    "arrestar",
    "@Contrabandista",
    intensidad: 60,
    intencion: EcosIntencion.Advertencia);
```

### 2.3 Crear y publicar devolviendo el eco

```csharp
EcoEvento eco = EcosSystem.CrearEco(
    EcosScope.Jugador("A"), "@JugadorA", "quemar", "aldea", 80);

// Ya está publicado: úsalo para log, UI o para derivar una variante.
EcoEvento variante = eco.Derivar(intensidad: 95);
EcosSystem.RegistrarEvento(variante);   // publica la variante como hecho nuevo
```

> `CrearEco` **publica**. No lo llames y después `RegistrarEvento(eco)` con el mismo eco:
> lo registrarías dos veces. Para fabricar un eco sin publicarlo, usa el constructor de
> `EcoEvento` (avanzado) y decide tú cuándo llamar a `RegistrarEvento`.

### 2.4 Emisor propio (recomendado para armas, hechizos, diálogos)

Hereda de `EcosEmisor` y llama a `Emitir(...)`:

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

Ventajas: hereda `scope`, `sujetoId`, `ResolverScope()`, `ResolverSujeto()` y el evento
`OnEcoEmitido`. No reimplementes el aislamiento.

### 2.5 Escuchar el eco emitido

```csharp
emisor.OnEcoEmitido += eco => Debug.Log("Emitido " + eco.Id);
```

---

## 3. Canales (`EcosScope`)

| Constructor | Tipo | Aislamiento |
| --- | --- | --- |
| `EcosScope.Global` | Global | Todos lo ven (observadores). |
| `EcosScope.Jugador("A")` | Jugador | Sólo el jugador A y sus NPCs. |
| `EcosScope.Faccion("guardia")` | Facción | Sólo esa facción (o por puente). |
| `EcosScope.Lugar("aldea")` | Lugar | Sólo esa localización. |
| `EcosScope.Grupo("rebeldes")` | Grupo | Colectivo arbitrario. |
| `EcosScope.Sistema("debug")` | Sistema | Aislado del gameplay. |

`EcosScopeReferencia` es el envoltorio de Inspector:

| Modo | Comportamiento |
| --- | --- |
| `JugadorLocal` | Resuelve el `EcosJugadorLocal` de la escena. |
| `Jugador` | Usa `idJugador`. |
| `Faccion` / `Lugar` / `Grupo` / `Sistema` | Usa `id`. |
| `Global` | Canal global. |

**Regla:** emisor y NPCs deben resolver **el mismo** canal. Si el emisor está en
`Jugador:A` y el NPC en `Global`, el NPC no recibirá las versiones deformadas (sólo el
original, como observador).

---

## 4. Multijugador: canales y puentes

### Aislar jugadores

1. Un `EcosJugadorLocal` por jugador, con `id` distinto (`A`, `B`).
2. En el bootstrap, `jugadores = [A, B]` (o deja `autodetectarJugadorLocal`).
3. Todos los emisores y NPCs de A usan `JugadorLocal` (o `Jugador:A`).

**Qué esperar:** el hecho de A nunca aparece en el canal de B. Ni siquiera en los logs.

### Puentes explícitos

Un puente decide si un eco cruza de un canal a otro. Se configura en el bootstrap:

| Campo de `EcosPuenteConfig` | Efecto |
| --- | --- |
| `origen` | Canal que escucha (normalmente un jugador). |
| `destino` | Canal al que publica (una facción, un lugar). |
| `anonimizar` | Al cruzar, pierde la identidad del jugador. |
| `saltosMinimos` | Sólo cruza si el eco ya ha viajado lo suficiente. |
| `probabilidad` | Probabilidad de cruce. |
| `perdidaConfianza` | Credibilidad que pierde al cruzar. |

```csharp
var puente = new EcosPuenteDeScope(EcosScope.Jugador("A"), EcosScope.Faccion("guardia"), true)
{
    SaltosMinimos = 3,
    Probabilidad = 0.8f,
    PerdidaConfianza = 0.2f
};
```

**Qué esperar:** a partir del tercer salto, la guardia recibe "un forastero quemó la
aldea" (sin el nombre del jugador), con menos confianza.

### Cuándo **no** usar Global

- Para un HUD que debe ver todo: Global está bien.
- Para que un NPC reaccione y **repropague**: usa el canal del jugador/facción.
- Para un rumor "del mundo" que nace sin dueño: Global es correcto, pero entonces no
  está aislado por jugador.

---

## 5. Buenos hábitos

1. **Un id de acción = un hecho.** No metas frases enteras en `accionId`.
2. **La intensidad es del hecho, no del relato.** 80 = masacre; 10 = ruido.
3. **No emitas en `Update`.** Usa eventos, triggers o cooldowns.
4. **Un trigger, un hecho.** Si necesitas variar la cantidad, declara acciones
   distintas ([06](06-Cantidades.md)).
5. **Log en desarrollo, no en producción.** `logContagios` puede ser muy verboso.
6. **El sujeto debe existir** en `Sujetos` o saldrá su id crudo. Para jugadores,
   `EsJugador = true` evita que se anonimicen por desconocimiento.
7. **Prueba sin escena:** `Window ▸ Ecos ▸ Consola de Ecos` permite emitir y ver la
   frase sin entrar en Play.

---

## 6. Errores frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| No pasa nada al pisar el cubo | Falta `Collider` con `Is Trigger`, o el otro collider no tiene Rigidbody/CharacterController. | Añade un `CharacterController` al jugador o un `Rigidbody` al trigger. |
| Se emite pero no se propaga | No hay NPCs registrados en ese canal (`participarEnDifusion = false`). | Actívalo en `EcosMemoriaNpc`. |
| Se propaga pero la frase no cambia | Todos los listeners están en `Global` (observadores) o falta `soloCuandoSoyElNarrador`. | Suscríbete al canal del jugador; activa el filtro en los listeners. |
| El nombre del jugador no sale | `@JugadorA` no está en `Sujetos`, o `SaltosParaAnonimizar` es 0. | Añádelo con `EsJugador = true`; ajusta el umbral. |
| `NullReferenceException` en `Awake` | Otro componente llama a `EcosSystem` antes que el bootstrap. | El bootstrap ya usa orden `-1000`; no lo cambies. |
