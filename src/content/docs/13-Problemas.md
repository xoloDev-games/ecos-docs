# 13 — Solución de problemas

Busca tu síntoma. Cada entrada tiene **causa** y **solución**. Al final hay una lista de
comprobación rápida.

---

## 1. Instalación y compilación

### `The type or namespace name 'InferenceEngine' does not exist`

**Causa:** falta el paquete `com.unity.ai.inference` (o es una versión antigua con el
namespace `Unity.Sentis`).

**Solución:** instala `com.unity.ai.inference` 2.6.1 desde Package Manager. El runtime
usa `Unity.InferenceEngine` (Inference Engine 2.x), no `Unity.Sentis`.

### `The type or namespace name 'Tokenization' does not exist`

**Causa:** el paquete de Inference Engine no incluye el módulo de tokenización en tu
versión.

**Solución:** actualiza a 2.6.1 o superior. Si tu versión no lo tiene, usa el
`EcosProveedorEmbeddingsHash` (sin modelo) o el proveedor ONNX opcional.

### `Assembly with name 'xoloDev.Ecos' already exists`

**Causa:** tienes el paquete UPM **y** una copia manual en `Assets/Ecos`, o dos copias
del `.asmdef`.

**Solución:** deja **una** instalación. Si usas UPM, borra la carpeta manual
`Assets/Ecos/Scripts` (no borres tus assets de demo).

### `OnnxImportException` al importar `model.onnx`

**Causa:** operadores o tipos no soportados por tu versión/backend (típico de un INT8
dinámico con `DynamicQuantizeLinear`/`MatMulInteger`, o de un modelo exportado con ops
nuevas).

**Solución:** usa el FP16 que exportaste con `keep_io_types=True` (capítulo 10). No
renombres un INT8 a `model.onnx`: Inference Engine 2.6.1 no lo importa. Si persiste,
prueba `backend = CPU`. Revisa la Consola para el operador exacto. Si no necesitas
semántica, deja el modelo vacío y usa el proveedor hash.

### El tokenizador aparece como `DefaultAsset`, no como `TextAsset`

**Causa:** el fichero se llama `sentencepiece.bpe.model` (extensión `.model`).

**Solución:** renómbralo a `sentencepiece.bpe.model.bytes`. Unity lo importa como
`TextAsset` y expone `bytes`.

### `NullReferenceException` en `Awake` de otro componente

**Causa:** ese componente llama a `EcosSystem` antes de que exista el runtime.

**Solución:** el `EcosBootstrap` usa `[DefaultExecutionOrder(-1000)]`; no lo cambies. Si
el componente es tuyo, usa `EcosSystem.AsegurarRuntime()` o muévelo a `Start`.

---

## 2. La cadena no avanza / no se ve

### Sólo llega a 3-4 saltos (con `maxSaltos = 6`)

**Causa:** con `maxContagiosPorEco = 1` hay una tirada por salto y la probabilidad cae
con la confianza y el nivel. Un fallo corta la cadena.

**Solución (demo):** `contagioGarantizado = true` y
`factorCredibilidadPorSalto = 0.04`, `umbralConfianzaMinima = 0.02`.

**Solución (juego):** sube `probabilidadContagioBase`, baja
`factorCredibilidadPorSalto` o añade más NPCs. No uses `contagioGarantizado` en
producción.

### El eco no se propaga en absoluto

| Causa | Comprobación | Solución |
| --- | --- | --- |
| No hay NPCs en el canal | `EcosSystem.Runtime.Npcs` o la consola de debug | Añade `EcosMemoriaNpc` con `participarEnDifusion = true`. |
| El NPC no está en el mismo scope | Logs `[Jugador:A]` vs `[Global]` | Iguala el `scope` del emisor y del NPC. |
| `umbralIntensidadMinima` alto | La intensidad del trigger es menor | Baja el umbral o sube la intensidad. |
| `umbralConfianzaMinima` alto | La confianza cae rápido | Bájalo o baja `factorCredibilidadPorSalto`. |
| `radioEscucha` pequeño | Distancia entre NPCs | Súbelo o pon 0. |
| `locuacidad = 0` en todos | Perfiles | Sube la locuacidad. |

### El rumor llega, pero la frase no cambia entre saltos

**Causa 1:** todos los listeners están suscritos a `Global` (son observadores y reciben
el eco original).

**Solución:** suscríbete al canal del jugador/facción.

**Causa 2:** falta `soloCuandoSoyElNarrador` en los listeners de NPC.

**Solución:** actívalo. Así cada etiqueta conserva su versión (`v1`, `v2`, ...).

**Causa 3:** `factorDegradacionPorSalto` demasiado bajo o `maxSaltos` corto.

**Solución:** 0,22 con 6 saltos; comprueba el nivel en los logs.

### La cadena avanza a tirones

**Causa:** `maxEventosPorTick` bajo o demasiados canales.

**Solución:** súbelo a 512-1024; revisa `Pendientes` en la consola de debug.

### El eco "desaparece" de golpe

**Causa:** murió por confianza (`< umbralConfianzaMinima`) o por `tiempoDeVidaEco`.

**Solución:** es el comportamiento esperado. Si no lo quieres, baja
`factorCredibilidadPorSalto` o sube `umbralConfianzaMinima`... hacia abajo. Revisa el log
de la última entrega.

---

## 3. Cantidades

### No sale ningún número

| Causa | Solución |
| --- | --- |
| `CantidadBase = 0` | Declara la cifra real del hecho. |
| `UnidadCantidad` vacío | Rellénalo (`metros`, `bandidos`). |
| La acción usada no es la que crees | Revisa el `accionId` del trigger. |

### La cifra no escala

- El eco no está subiendo de nivel (mira `factorDegradacionPorSalto`).
- Has puesto un `CantidadesPorNivel` con el mismo valor repetido: el override manda
  sobre la curva automática. Déjalo vacío si quieres la curva.
- La acción no tiene `CantidadBase` o `UnidadCantidad`.

### La cifra cambia entre NPCs

Es el comportamiento esperado si `VariacionPorOyente` está activo: la curva aplica un
margen determinista del ±8 % y redondea a cifras naturales. Con la misma semilla, el
mismo NPC repite la misma cifra. Desactívalo si necesitas una cifra idéntica para todos.

### El objeto del trigger no aparece

Es correcto si `CantidadComoObjeto = true`: la cantidad sustituye al objeto. Si querías
ambos, usa `CantidadComoObjeto = false` y una plantilla con `{magnitud}`.

### Sale "bandidos., con su espada"

**Causa:** puntuación en `{objeto}` o en la plantilla, y el instrumento se añade con
coma.

**Solución:** mueve la puntuación a `{sufijo}` o `{coletilla}`.

### Sale el id crudo en vez del nombre

**Causa:** falta la entrada en `Sujetos` u `Objetos`.

**Solución:** añádela o usa `@Nadie` para no pintar objeto. El id crudo es el aviso
honesto del sistema, no un bug.

---

## 4. Anonimización

### El nombre no desaparece nunca

- `saltosParaAnonimizar` es mayor que `maxSaltos`.
- El sujeto es jugador (`EsJugador = true`) y el oyente lo conoce.
- El nivel no llega a `Distorsionado` (la tirada del 35 % no ocurre).

**Solución:** baja `saltosParaAnonimizar` (3 es el valor por defecto), no marques
`EsJugador`, o acepta que el nombre se conserve.

### El nombre desaparece demasiado pronto

`saltosParaAnonimizar = 0` o el nivel es `Distorsionado` y la tirada ha salido. Súbelo a
3-4.

### El nombre desaparece, pero la ficha sigue atribuyendo el hecho

La ficha se calcula del grafo; si el eco se registró antes de la regla de anonimización,
el nodo original conserva el `SujetoId`. La versión anonimizada es otro nodo. Es
intencional: el canal sabe la verdad y el rumor no.

---

## 5. Modelo / Sentis

### "Se usará la heurística de respaldo"

- `modelo` o `tokenizador` sin asignar.
- El `.onnx` no se importó como `ModelAsset`.
- `TryCrear` falló (mira el error completo).

**Solución:** asigna ambos; revisa la Consola; prueba FP16 y `CPU`.

### La primera frase tarda mucho

**Causa:** caché vacía.

**Solución:** `precalentarAlArrancar = true`; asegúrate de que las categorías tienen
`Sinonimos`.

### Categorías absurdas

**Causa:** umbral bajo o sinónimos que no representan el tipo de frase.

**Solución:** sube `umbral` a 0,5-0,6; reescribe los sinónimos como frases de acción
("abatió al objetivo a distancia"), no como roles (\$"sniper").

### GPU no disponible / errores de backend

**Solución:** `backend = CPU`. En móvil, prueba `CPU` con el FP16 que exportaste; si
exportas un INT8 compatible con tu versión de Inference Engine, úsalo como alternativa.

### El modelo ocupa demasiado en el build

- Usa el proveedor hash (0 MB de modelo) o un modelo compatible más pequeño.
- Excluye el modelo del build si usas el proveedor hash (no lo asignes).
- Revisa `longitudMaxima`: no afecta al tamaño del asset, sólo a la inferencia.
- El paquete no incluye pesos; el tamaño del modelo depende del que exportes tú.

---

## 6. Multijugador

### El jugador B ve los rumores de A

**Causa:** ambos están en `Global` o comparten el mismo `EcosJugadorLocal.id`.

**Solución:** un `EcosJugadorLocal` por jugador con ids distintos; emisores y NPCs en
`Jugador:A` / `Jugador:B`.

### El puente no cruza nada

| Causa | Solución |
| --- | --- |
| `SaltosMinimos` alto | Bájalo o deja que la cadena avance. |
| `Probabilidad` baja | Súbela a 1 para probar. |
| Origen/destino mal escritos | Muestra los `EcosScope` en el log. |
| El eco muere antes | Sube la confianza o baja el umbral. |

### El puente filtra el nombre

`Anonimizar = true` es el valor recomendado. Si quieres conservarlo, ponlo a false (y
asume el riesgo de mezclar identidades entre canales).

---

## 7. UI y listeners

### `onFrase` sale vacía

- `componerFrase = false`.
- No hay runtime (`EcosSystem.Runtime == null`).
- El listener está desactivado.

### El UnityEvent no muestra el valor en el Inspector

Es normal: UnityEvent no previsualiza el payload. Lee el valor **dentro** del método
enganchado (`void MiMetodo(EcoRumor r)`).

### El cartel muestra el resumen técnico en vez de la frase

Estás usando `onResumen` en lugar de `onFrase`. Cambia el evento.

### Memory leak de suscripciones

Guarda el `IDisposable` y libéralo en `OnDisable`. Los componentes del asset ya lo
hacen.

---

## 8. Rendimiento

| Síntoma | Causa | Solución |
| --- | --- | --- |
| FPS bajos con muchos NPCs | Abanico + `maxContagiosPorEco = 0` | Pon 1 y baja `maxEventosPorTick`. |
| Picos al arrancar | Precalentamiento del modelo | Es esperado; muévelo a una pantalla de carga. |
| Memoria alta | FP16 + buffers | CPU, proveedor hash o modelo cuantizado compatible. |
| Logs enormes | `logContagios = true` | Desactívalo en producción. |
| El grafo crece sin parar | `maxNodosPorCanal` alto | Bájalo; el grafo poda los más antiguos. |

---

## 9. Determinismo

### Todas las sesiones dan exactamente la misma frase

**Causa:** `semillaMundo` es fija (por defecto `1337`) y el runtime se reinicia con los
mismos ids y NPCs; el sistema es determinista por diseño.

**Solución:**

- Si quieres variedad entre **sesiones** (cada Play / arranque): pon
  `modoSemilla = AleatoriaPorSesion` en `EcosConfigAsset` (la demo lo trae activado). Cada
  runtime sortea una semilla y cambian palabras, adornos y coletillas; el verbo, el
  paciente y las cifras siguen siendo los mismos.
- Si quieres una semilla por **partida guardada** que se conserve al continuar: usa
  `EcosSemillaPartida.ParaNuevaPartida` al crear la partida, guarda la semilla en tu save y
  `EcosSemillaPartida.ParaContinuarPartida` al cargarla.
- Si quieres reproducir una sesión concreta: deja `modoSemilla = Fija` y usa la misma
  `semillaMundo`, el mismo orden de NPCs y el mismo reloj.

### Dos ejecuciones dan frases distintas

- `SemillaMundo` distinta.
- `variacionPorOyente` cambia el orden de los oyentes.
- Estás usando `Time.time` en el compositor (no debería).
- El modelo semántico no es determinista en GPU (puede haber pequeñas diferencias de
  coma flotante); para tests usa el proveedor hash o CPU.

**Solución:** misma semilla, mismo reloj manual, mismos NPCs en el mismo orden.

### El replay no coincide

El orden de registro de NPCs importa (afecta al orden de las tiradas). Registra siempre
en el mismo orden o usa ids estables y ordena antes de registrar.

---

## 10. "He cambiado el código/datos y no se aplica"

**Causa:** Unity no ha recompilado, o la escena conserva valores serializados antiguos.

**Solución:**

1. Espera a que Unity termine de compilar (barra de progreso).
2. Si cambiaste el **preset** o los **valores de los componentes**, vuelve a ejecutar
   `Ecos ▸ Construir Escena de Demo`. Los valores están serializados en la escena y en
   los assets; el builder los reaplica.
3. Si cambiaste datos de la biblioteca en código, el builder los refresca por id; vuelve
   a construir.
4. Si cambiaste sólo lógica del Core, basta con recompilar (no hace falta reconstruir).

> Este fue un falso bug real en el desarrollo: los logs seguían mostrando 3 saltos
> porque el editor no había recompilado. Antes de tocar código, comprueba la Consola y
> la barra de compilación.

---

## 11. Lista de comprobación rápida

1. ¿Hay un `EcosBootstrap`/`EcosBootstrapSentis` en la escena? (orden -1000)
2. ¿El jugador tiene `EcosJugadorLocal` con id?
3. ¿Emisor y NPCs resuelven el **mismo** scope?
4. ¿Los NPCs tienen `participarEnDifusion = true`?
5. ¿Los listeners de NPC tienen `soloCuandoSoyElNarrador = true`?
6. ¿`maxSaltos` y `maxContagiosPorEco` son los que crees?
7. ¿`contagioGarantizado` está activo sólo en demo?
8. ¿La acción existe en la biblioteca? (si no, verás el id crudo)
9. ¿La cantidad está en la acción correcta?
10. ¿El modelo está asignado y el tokenizador es `.bytes`?
11. ¿Has reconstruido la escena tras cambiar el preset?
12. ¿La Consola muestra errores de importación o de compilación?

---

## 12. Dónde mirar

| Herramienta | Para qué |
| --- | --- |
| `Window ▸ Ecos ▸ Consola de Ecos` | Canales, colas, nodos, "quién sabe qué" y laboratorio de frases. |
| `logEventos` del bootstrap | Cada hecho registrado. |
| `logContagios` del bootstrap | Cada salto `emisor -> receptor`. |
| `logEcos` del listener | Cada versión recibida con su frase. |
| `logEcos` de la memoria | Cada eco guardado por el NPC. |
| Menú contextual del `EcosBootstrapSentis` | Diagnóstico del proveedor semántico. |
| `EcoEvento.Resumen()` | Línea compacta: canal, sujeto, acción, objeto, nivel, intención, confianza, saltos. |
