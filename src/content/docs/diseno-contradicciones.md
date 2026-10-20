# Contradicciones, acumulación y ambivalencia moral

> Documento de diseño del eje REPUTACIONAL de Ecos. Explica por qué un sujeto puede tener
> varios ecos a la vez, cuándo dos hechos chocan, y cómo se mide el dilema moral sin borrar
> nunca un rumor. La implementación vive en `Scripts/Core` y está cubierta por
> `tests/Contradicciones/ContradiccionesTests.cs`.

---

## 1. La pregunta

> "¿Puede un jugador tener más de 1 eco encima? Siempre que no se encimen las categorías…"

Sí, y **ya es el caso por defecto**. `EcoEvento.Id` es único por `CrearEco()`, así que cada
hecho es un **nodo independiente** en el grafo (`EcosGrafoDeEcos._nodos`). Nada fusiona ni
sobrescribe: `_porNpc[npc]` es un `HashSet<int>` y `EcosMemoriaNpc._memoria` una lista.

Lo que faltaba no era poder acumular, sino **decidir cuándo dos hechos chocan**. Eso son tres
ejes ortogonales, y el diseño original sólo cubría los dos primeros:

| Eje | Pregunta que responde | Dónde vive |
|---|---|---|
| **Espacio** | ¿quién lo sabe? | `EcosScope` + `EcosPuenteDeScope` (canales aislados) |
| **Credibilidad** | cuánto sobrevive el relato | `EcoEvento.Confianza`, `EcosNivelExageracion` |
| **Valor moral** | cuánto suma o resta al sujeto | **`EcosAccion.Valencia` / `.Peso`** (nuevo) |

La "dispersión regional" y el "porcentaje de validez" que planteabas, por tanto, **no son
alternativas**: el primero es el eje espacial (ya existía) y el segundo el de credibilidad
(también existía). Lo que faltaba era el tercero.

## 2. Los tres casos

| Hechos sobre el jugador | Relación | Resultado |
|---|---|---|
| `asesinar pastor` + `asesinar soldado` | misma acción, distinto paciente | **Acumulan** (dos nodos, misma valencia) |
| `asesinar pastor` + `salvar aldeano` | acciones opuestas, distinto paciente | **Ambivalencia**: conviven; la ficha lo mide |
| `asesinar pastor` + `salvar pastor` | acciones opuestas, **mismo paciente** | **Contradicción**: el recién llegado pierde crédito |
| `ser mago` + `usar fuego` | no son hechos, son **facetas** | Acumulan (ver §7) |

La clave de diseño: **el antagonismo es entre acciones, pero la contradicción exige el mismo
paciente**. Eso es exactamente lo que separa tu ejemplo acumulable del no acumulable.

## 3. Datos (editables en el asset)

En `EcosAccion` (que el diseñador ya edita en `EcosBibliotecaAsset`):

```csharp
public int      Valencia = 0;              // -100 (infame) .. +100 (heroico)
public float    Peso     = 0.5f;           // 0..1 cuánto pesa en la reputación
public string[] AntagonistaDe = new string[0]; // acciones con las que choca (simétrico)
```

Y una tabla de consulta, `EcosRelacionesAcciones`, calcada de `EcosTablaAfinidad`:

```csharp
EcosRelacionAccion.Neutra      // conviven
EcosRelacionAccion.Sinergia    // se refuerzan ("quemar" + "arrasar")
EcosRelacionAccion.Antagonista // se contradicen ("asesinar" + "salvar")
```

`EcosRelacionesAcciones.CrearPorDefecto(biblioteca)` vuelca los `AntagonistaDe` de la
biblioteca y añade unas sinergias de ejemplo. No hay IA: es una tabla.

## 4. La regla de propagación

`EcosReglaContradiccion` (prioridad **150**: después de degradar, antes de la afinidad
elemental). Cuando un eco sobre *S* llega a un receptor:

1. Recorre los ecos sobre *S* que **ese receptor ya cree** (`Grafo.EcosDe(S)` + `Conoce`).
2. Si alguno es **antagonista y del mismo paciente**, acumula penalización de credibilidad:
   `PenalizacionContradiccion × (0.5 + 0.5 × confianza_previa)`, con tope
   `PenalizacionContradiccionMaxima`.
3. Si es **sinergia**, suma `BonusSinergia`.
4. Con `ContradiccionRequiereMismoPaciente = false`, cualquier par antagonista choca (útil
   para narrativas donde sólo se recuerda una versión del personaje).

**Nunca se borra un eco.** La regla sólo modula la confianza con la que prende el nuevo
relato: los relatos en pugna conviven, compitiendo. Esa tensión *es* el contenido.

## 5. La ficha del sujeto

`EcosDossierSujeto` es un valor **derivado** (no guarda estado ni se serializa): se calcula del
grafo de un canal, así que jamás se desincroniza. Tres lecturas, una por eje:

| Campo | Rango | Qué dice |
|---|---|---|
| `Reputacion` | -100..100 | media de valencias ponderada por peso y credibilidad |
| `Ambivalencia` | 0..1 | `1 − abs(Σ v·p·c) / Σ abs(v·p·c)`. 1 = perfectamente dividido |
| `Contradicciones` | nº | pares de hechos que no pueden ser verdad a la vez |
| `CredibilidadMedia` | 0..1 | cuánto se cree, de media, lo que se cuenta |
| `Detalle` | lista | los ecos, ordenados por Id (determinista) |

Como el grafo es **por canal**, la ficha responde gratis a *"¿qué se dice de Aldric en la aldea
alta?"* y *"...en la baja?"* con respuestas distintas. Y `CalcularDesdeGrafo(..., npcId)` da la
**verdad privada** de un NPC concreto.

## 6. API

```csharp
// Runtime (Core, sin Unity)
var ficha = EcosDossierSujeto.CalcularDesdeGrafo(sujeto, grafo, biblioteca, relaciones);

// Fachada Unity (EcosSystem)
EcosSystem.EcosDe(scope, sujeto);                  // todos los ecos del sujeto en el canal
EcosSystem.TryDossier(scope, sujeto, out ficha);   // la verdad DEL CANAL
EcosSystem.TryDossierDeNpc(scope, npc, sujeto, out ficha); // la verdad PRIVADA del NPC
```

## 7. Facetas vs. hechos

"Es un mago poderoso" o "usa el fuego" no son sucesos, son atributos del sujeto. El modelo ya
tiene las piezas declaradas para tratarlos como ecos (y que así pasen por el mismo compositor
y grafo): `EcosAccion.Transitiva = false` (sin objeto directo) y `EcosTiempoVerbal.Presente`.
Hoy **no están cableadas** en el compositor; es el siguiente paso natural, no parte de este
cambio.

## 8. Ajustes de configuración

| Campo | Por defecto | Qué hace |
|---|---|---|
| `PenalizacionContradiccion` | 0.25 | credibilidad perdida por contradicción |
| `PenalizacionContradiccionMaxima` | 0.50 | tope acumulado en un contagio |
| `BonusSinergia` | 0.08 | credibilidad extra por refuerzo |
| `ContradiccionRequiereMismoPaciente` | true | exigir el mismo paciente para chocar |

Todos están en `EcosConfiguracion` (Core) y `EcosConfigAsset` (Inspector).

## 9. Decisiones y advertencias

- **`EcosIntencion` NO es moral.** Es comunicativa (Neutral/Advertencia/Alarde/Chisme/Amenaza/
  Lamento); mezclar bueno/malo ahí envenenaría las plantillas de frase. La moral vive en la
  valencia.
- **El dossier no duplica estado.** Se recalcula del grafo: cero riesgo de desincronización.
- **Todo es determinista.** Las sumas de la ficha se ordenan por `Id` (la suma de floats es
  sensible al orden) y el desempate de la regla no usa azar.
- **Coste acotado.** `EcosGrafoDeEcos` mantiene un índice por sujeto (`_porSujeto`), así que
  `EcosDe` no escanea el grafo entero.
- **Sin borrado.** Si algún día se quiere "olvidar" un eco, eso es purga por tiempo
  (`TiempoDeVidaEco`), nunca una regla de contradicción.

## 10. Qué queda fuera (futuro)

- Viraje de **intención** del narrador según la ambivalencia ("unos lo cuentan como héroe,
  otros como verdugo"): hoy la ficha lo mide numéricamente, pero no re-escribe la frase.
- **Propaganda**: una regla que suba la valencia percibida de un eco al cruzar ciertos canales.
- **Dossier por facción** con pesos distintos por oyente (cada canal valora distinto el mismo
  hecho).
- Trasladar la valencia al **asset de biblioteca del Inspector** con una vista dedicada
  (hoy ya aparece como campos del `EcosAccion`).
