# 08 — Escuchar y reaccionar

Recibir un eco es suscribirse a un canal. Hay tres niveles de uso:

1. **`Eco Listener`** — UnityEvents, 0 código.
2. **`Memoria de NPC`** — el NPC recuerda y puede volver a contar.
3. **`IEcosSink` / `IEcosReaccion`** — código propio para gameplay.

---

## 1. `Eco Listener` (UI, carteles, HUD)

Añade `Ecos ▸ Eco Listener`. Se suscribe al canal en `OnEnable` y se da de baja en
`OnDisable`.

### Campos

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `scope` | `EcosScopeReferencia` | Canal. Global = observador de todo. |
| `intensidadMinima` | int 0..100 | Ignora ecos por debajo. |
| `nivelMinimo` | enum | Ignora niveles por debajo. |
| `soloCuandoSoyElNarrador` | bool | Sólo reacciona a la versión que **este** NPC contaría. |
| `componerFrase` | bool | Genera la frase procedural. |
| `oyente` | `EcosPerfilNpcAsset` | Perfil para componer (anonimización, variación). |
| `OnRumorRecibido` | `UnityEvent<EcoEvento>` | Payload crudo (ids, nivel, intención, categoría). |
| `onRumor` | `UnityEvent<EcoRumor>` | Payload resuelto (categoría por nombre, frase). |
| `onFrase` | `UnityEvent<string>` | Frase lista para mostrar. |
| `onResumen` | `UnityEvent<string>` | Resumen técnico. |
| `onEcoRecibido` | `UnityEvent` | Sin argumentos (compatibilidad). |
| `logEcos` | bool | Log de cada eco. |

### El filtro que hace visible la cadena

`soloCuandoSoyElNarrador` es la diferencia entre:

- **Sin filtro:** los 6 listeners del canal reciben los 6 saltos y todos acaban
  mostrando la última versión. Parece que el rumor no se deformó.
- **Con filtro:** cada etiqueta conserva **su** versión (`v1`, `v2`, `v3`...). El eco
  original (`saltos = 0`) lo ven todos para arrancar igual.

Actívalo en los NPCs de la demo. En un HUD global, déjalo desactivado.

### Payload `EcoRumor`

| Campo | Tipo | Contenido |
| --- | --- | --- |
| `id` | string | Id del eco (se conserva en toda la cadena). |
| `sujetoId` | string | Id del protagonista (o `@Desconocido`). |
| `accionId` | string | Verbo. |
| `objetoId` | string | Paciente. |
| `intensidad` | int | 0..100. |
| `nivel` | enum | Literal..Distorsionado. |
| `intencion` | enum | Neutral..Lamento. |
| `categoriaId` | int | Índice interno de la categoría. |
| `categoria` | string | Nombre visible (`fuego`, `veneno`). |
| `confianza` | float | Credibilidad 0..1. |
| `saltos` | int | Bocas recorridas. |
| `frase` | string | Texto compuesto para este oyente. |
| `resumen` | string | `[canal] sujeto accion objeto | nivel/intencion conf saltos`. |

### Ejemplo: cartel de "se busca"

1. Un `TextMeshProUGUI` (o `Text`).
2. Un `Eco Listener` en el mismo objeto.
3. `scope = JugadorLocal`, `nivelMinimo = Adornado`.
4. `onFrase` → `+` → arrastra el texto → `SetText(string)`.

**Qué esperar:** el cartel sólo cambia cuando el rumor ya está adornado o peor. Cada
salto reescribe el texto con la versión de ese NPC (si activas el filtro).

---

## 2. `Memoria de NPC`

Añade `Ecos ▸ Memoria de NPC`. Es el componente que convierte un GameObject en una
**boca** de la difusión.

### Campos

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `perfil` | `EcosPerfilNpcAsset` | Personalidad (locuacidad, credulidad, sesgos). |
| `scope` | `EcosScopeReferencia` | Canal en el que participa. |
| `participarEnDifusion` | bool | Se registra como NPC: recibe y **repropaga**. |
| `maximoRecuerdos` | int 1..128 | Tamaño de su memoria local. |
| `onEcoEscuchado` | `UnityEvent<string>` | Frase compuesta con **su** perfil. |
| `onRecuerdoRelevante` | `UnityEvent<string>` | El recuerdo de mayor peso. |
| `logEcos` | bool | Log de cada eco escuchado. |

### API

```csharp
var memoria = npc.GetComponent<EcosMemoriaNpc>();

string queCuenta = memoria.Contar(0);                 // recuerdo más reciente
string loMasFuerte = memoria.ContarLoMasRelevante();  // intensidad x confianza

EcoEvento eco;
if (memoria.TryRecuerdoMasRelevante(out eco))
    Debug.Log(eco.Resumen());

memoria.OlvidarTodo();       // reinicio de partida
```

`Contar()` es la API natural para un diálogo:

```csharp
// "¿Qué sabes del herrero?"
string respuesta = memoria.ContarLoMasRelevante();
```

### Qué esperar al añadirlo

- El NPC entra en el censo de su canal (`participarEnDifusion = true`).
- Recibe cada eco que pasa la tirada y lo guarda.
- En el siguiente tick puede contagiar su versión a otro NPC.
- `onEcoEscuchado` te da la frase ya compuesta con su perfil (no la del vecino).

> **No dupliques propagación.** Si usas `EcosMemoriaNpc` para que el NPC participe,
> no añadas además un `EcoListener` que emita el mismo eco. El listener es para UI y
> reacciones, no para volver a publicar.

---

## 3. Sink propio (`IEcosSink`)

Para lógica de gameplay sin MonoBehaviour o con varias suscripciones:

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
        // Reacciona al HECHO, no al texto.
        if (eco.AccionId == "quemar" && eco.Nivel >= EcosNivelExageracion.Exagerado)
            Debug.Log("La facción " + _faccionId + " está alarmada.");
    }

    public void Dispose()
    {
        if (_suscripcion != null) _suscripcion.Dispose();
    }
}
```

**Regla:** guarda el `IDisposable` y libéralo en `OnDisable`/`Dispose`, o el sink seguirá
recibiendo ecos después de morir.

### Suscripción por callback

```csharp
IDisposable sub = EcosSystem.Suscribir(
    EcosScope.Jugador("A"),
    eco => Debug.Log("Ha llegado: " + eco.Resumen()));
```

---

## 4. Reacciones en el pipeline (`EcosReaccionComponente`)

Un sink reacciona **después** de que el eco llegue. Una reacción se ejecuta **durante**
la propagación, cuando el eco pasa de un NPC a otro, y puede leer el contexto completo
(emisor, receptor, afinidad, distancia).

### Sin código: `Reacción de NPC`

Añade `Ecos ▸ Reacción de NPC` al mismo GameObject que tiene la `Memoria de NPC`.

| Campo | Para qué |
| --- | --- |
| `memoria` | Sólo reacciona a ecos recibidos por ese NPC. |
| `nivelMinimo` | Nivel mínimo del eco. |
| `intensidadMinima` | Intensidad mínima (0..100). |
| `confianzaMinima` | Credibilidad mínima. Un escéptico exige relatos creíbles. |
| `categoriaRequerida` | Categoría elemental obligatoria (`fuego`). Vacío = cualquiera. |
| `intencionRequerida` | Intención obligatoria. `Neutral` = cualquiera. |
| `probabilidad` | Probabilidad de disparar cuando se cumplen las condiciones. |
| `onReaccionar` | `UnityEvent<string>` con la frase compuesta. |
| `logReacciones` | Log de cada reacción. |

Se registra solo en `OnEnable` y se quita en `OnDisable`; no hay que cablearlo en el
bootstrap.

**Ejemplo:** "si el eco es de fuego y viene exagerado, que el guardia toque la alarma".

```
memoria            = la del guardia
nivelMinimo        = Exagerado
intensidadMinima   = 60
categoriaRequerida = fuego
onReaccionar       -> Alarma.Sonar()
```

**Qué esperar:** la alarma suena cuando el guardia recibe una versión de fuego
suficientemente fuerte. No suena con el eco original (Literal) ni con un rumor de
veneno.

### Con código: `IEcosReaccion`

Para lógica que no encaja en un UnityEvent:

```csharp
using xoloDev.Ecos.Core;

public sealed class ReaccionMiedo : IEcosReaccion
{
    public void Reaccionar(in EcoEvento eco, in EcosContextoPropagacion contexto)
    {
        if (eco.Nivel < EcosNivelExageracion.Exagerado) return;
        if (contexto.Receptor == null) return;

        Debug.Log(contexto.Receptor.Nombre + " entra en pánico al oírlo.");
        // Aquí puedes disparar una animación, un bark, una huida...
    }
}
```

Registro:

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConReaccion(new ReaccionMiedo())
    .Construir();
```

También puedes añadirla a un runtime vivo:

```csharp
var runtime = EcosSystem.Runtime as EcosRuntimeDefault;
if (runtime != null) runtime.AnadirReaccion(new ReaccionMiedo());
```

---

## 5. Consultas: memoria, ecos y ficha del sujeto

### El eco más relevante de un NPC

```csharp
EcoEvento eco;
if (EcosSystem.TryEcoMasRelevante(EcosScope.Jugador("A"), "Herrero", out eco))
    Debug.Log(EcosSystem.Narrar(eco, perfilDelHerrero));
```

### Todos los ecos de un sujeto en un canal

```csharp
List<EcoEvento> ecos = EcosSystem.EcosDe(EcosScope.Lugar("aldea"), "@JugadorA");
```

### Ficha reputacional

```csharp
EcosDossierSujeto ficha;
if (EcosSystem.TryDossier(EcosScope.Lugar("aldea"), "@JugadorA", out ficha))
{
    Debug.Log("Reputación: " + ficha.Reputacion);       // -100..100
    Debug.Log("Ambivalencia: " + ficha.Ambivalencia);   // 0..1
    Debug.Log("Contradicciones: " + ficha.Contradicciones);
}
```

Y la verdad privada de un NPC:

```csharp
EcosSystem.TryDossierDeNpc(
    EcosScope.Lugar("aldea"), "Herrero", "@JugadorA", out ficha);
```

**Qué esperar:** la ficha del pueblo y la del herrero pueden diferir. Es intencional:
cada NPC tiene su versión. La ficha **no borra** ecos; los relatos en pugna conviven.

### Relaciones entre acciones

`EcosRelacionesAcciones` se construye desde `AntagonistaDe` de las acciones. Se usa para
detectar contradicciones y sinergias. No suele consultarse a mano.

---

## 6. Patrones de UI

### Barra de credibilidad

```csharp
listener.onRumor.AddListener(rumor =>
{
    barra.fillAmount = rumor.confianza;
    etiquetaNivel.text = EcosNiveles.Etiqueta(rumor.nivel);
});
```

### Color por categoría

```csharp
Color color = rumor.categoria == "fuego" ? Color.red :
              rumor.categoria == "veneno" ? Color.green :
              Color.white;
```

### Diálogo "¿qué sabes?"

```csharp
public string Preguntar(string npcId)
{
    var npc = BuscarNpc(npcId);
    var memoria = npc.GetComponent<EcosMemoriaNpc>();
    return memoria != null ? memoria.ContarLoMasRelevante() : "No sé nada.";
}
```

---

## 7. Errores frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| El listener no recibe nada | Se suscribió a un canal distinto del emisor. | Usa el mismo `scope` (normalmente `JugadorLocal`). |
| Todos los NPCs muestran la misma frase | Falta `soloCuandoSoyElNarrador`. | Actívalo en los listeners de NPC. |
| El listener recibe el eco original pero no los saltos | Está en `Global`. | Suscríbete al canal del jugador/facción. |
| El NPC no repropaga | `participarEnDifusion = false` o no hay perfil. | Actívalo; asigna un `EcosPerfilNpcAsset`. |
| `onFrase` sale vacía | `componerFrase = false` o no hay runtime. | Actívalo; comprueba el bootstrap. |
| Memory leak de suscripciones | No se libera el `IDisposable` en `OnDisable`. | Guárdalo y lístalo. |
| La ficha no cambia | Estás consultando otro canal o el eco no tiene `Valencia`/`Peso`. | Revisa `EcosAccion.Valencia`, `Peso` y el scope. |
