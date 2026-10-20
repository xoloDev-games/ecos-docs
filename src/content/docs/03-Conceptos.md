# 03 — Conceptos

Todo el sistema cabe en siete ideas. Si entiendes estas, el resto es configuración.

---

## 1. Eco (`EcoEvento`) — un HECHO, no una frase

Un eco es un struct de datos:

```
SujetoId + AccionId + ObjetoId + Nivel + Intencion + Intensidad + Confianza + Saltos + Semilla
```

- **No contiene texto.** Sólo ids de diccionario.
- Es **inmutable**: cada salto produce una copia derivada con `Derivar(...)`.
- Conserva su `Id` a lo largo de la cadena (es el *mismo* rumor, contado distinto).

**Qué cambia al propagarse:** `Nivel`, `Intencion`, `Intensidad`, `Confianza`,
`Saltos`, `NarradorId`, `Semilla`. **Qué NO cambia nunca:** `AccionId` y `ObjetoId` (el
verbo y el paciente). `SujetoId` sólo cambia a `@Desconocido` por la regla de
anonimización. Ese es el contrato de *Cero Alucinaciones*: se deforma el relato, no la
identidad del hecho.

## 2. Canal (`EcosScope`) — aislamiento

Un canal es una cola + un grafo (quién sabe qué). Los tipos:

| Tipo | Uso | Aislamiento |
| --- | --- | --- |
| `Global` | Clima, invasiones, ecos del mundo | Lo ven **todos** (observadores). |
| `Jugador(id)` | Canal privado de cada jugador | Sólo su jugador y sus NPCs. |
| `Faccion(id)` | Gremios, guardias | Sólo si un puente lo conecta. |
| `Lugar(id)` | Aldeas, ciudades | Igual. |
| `Grupo(id)` | Colectivos arbitrarios | Igual. |
| `Sistema(id)` | Debug, tutoriales | Aislado del gameplay. |

**Regla de oro multijugador:** sin puente explícito, dos jugadores **nunca** comparten
rumor. Con `EcosPuenteDeScope` puedes hacer que un jugador "filtre" a su facción
(normalmente anonimizando).

> **Cuidado con `Global` en demo.** Un `EcosListener` suscrito a `Global` es un
> *observador*: recibe el eco **original**, no las versiones deformadas. Para ver la
> cadena, suscríbete al canal del jugador. El generador de demo ya lo hace así.

## 3. Nivel de exageración (`EcosNivelExageracion`)

Cinco escalones discretos. No llevan texto: seleccionan plantillas y fragmentos.

| Nivel | Significado | Ejemplo de efecto |
| --- | --- | --- |
| `Literal` | Tal cual ocurrió | "quemó la aldea" |
| `Suavizado` | Se omite detalle | "más o menos, quemó la aldea" |
| `Adornado` | Se enfatiza sin cambiar el hecho | "dicen que en plena noche…" |
| `Exagerado` | Se magnifica la magnitud | "sin dejar ni una piedra" |
| `Distorsionado` | Aparece lo imposible | "con ayuda del demonio…" |

La **presión de distorsión** decide el nivel (ver [04](04-Configuracion.md)):

```
presión = factorDegradacionPorSalto × saltos
        + pesoLocuacidadEnDistorsion × locuacidad
        + pesoSesgoExageracion × sesgoExageracion
        + 0.15 × (1 − autoridad)
        − 0.10 × memoria
        + 0.35 × (1 − confianza)
        − 0.12 × (intensidad / 100)
        + afinidad + categoría
```

Bandas: `<0.20` Literal · `<0.42` Suavizado · `<0.64` Adornado · `<0.86` Exagerado ·
resto Distorsionado.

## 4. Intención (`EcosIntencion`) — la VOZ, no el contenido

`Neutral`, `Advertencia`, `Alarde`, `Chisme`, `Amenaza`, `Lamento`.

Determina **plantilla + atribución + coletilla**. "Yo lo vi con estos ojos" o "qué
desgracia" son voces; el hecho sigue siendo el mismo. El clasificador de intención es
heurístico (barato); no usa el modelo.

## 5. Confianza / credibilidad (`Confianza`)

Número `0..1` que cae en cada salto (`factorCredibilidadPorSalto`), con el nivel, con
las contradicciones y con el sesgo del narrador. Si baja de `umbralConfianzaMinima`,
el eco **muere**: se entrega una última vez a la UI y deja de propagarse.

Un rumor de sexta mano es poco creíble. Eso es la simulación, no un bug.

## 6. Salto (`Saltos`) y anonimización

`Saltos` cuenta las bocas por las que ha pasado. Dos usos:

- Corta la cadena en `maxSaltos`.
- **Anonimiza** el sujeto en dos capas:
  1. La regla del pipeline sustituye `SujetoId` por `@Desconocido` cuando
     `Saltos >= SaltosParaAnonimizar`.
  2. El compositor usa `NombreVago` ("un forastero", "alguien con poder") cuando el
     oyente no conoce al protagonista.

`SaltosParaAnonimizar = 0` ⇒ `@Desconocido` desde el primer eco.
`= 6` con `maxSaltos = 6` ⇒ el nombre se conserva en `v0..v5`; en `v6` (saltos = 6) la
regla ya lo sustituye (preset demo).

## 7. Dato vs. adorno (la clave de este asset)

- El **hecho** es: sujeto + verbo + paciente + **cantidad declarada**.
- La **degradación** no puede cambiar el verbo ni el paciente, pero **sí** puede:
  - escalar la cifra declarada (500 → 1300 m; 10 → 1000 bandidos);
  - cambiar el colectivo ("un grupo de" → "un pelotón de");
  - cambiar el instrumento ("con su espada" → "con las manos desnudas");
  - añadir énfasis, prefijos, coletillas y color elemental.

Eso es un rumor de verdad: **el dato se deforma, la identidad del hecho no**. Detalle
completo en [06 — Cantidades](06-Cantidades.md).

---

## Diagrama de flujo

![Flujo de un eco](flujo-eco.png)

1. **Fuente** registra el eco (`EcosSystem.RegistrarEvento`).
2. El **bus** lo encola en su canal con un retardo.
3. El **propagador** lo entrega: grafo + notificación a sinks.
4. Si sigue vivo, tantea a cada NPC del canal.
5. Por cada contagio: aplica **reglas** (anonimización → degradación → contradicción
   → afinidad → sesgo → desvanecimiento) y re-encola la versión derivada.
6. Los **sinks** (listeners, memoria, UI) reciben cada versión.
7. Los **puentes** deciden si cruza a otro canal.
