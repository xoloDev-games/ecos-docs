# 02 — Inicio rápido (escena jugable en 10 minutos)

Hay dos caminos: **generar la demo** (0 código, 1 clic) o **montarla a mano** (entiendes
cada pieza). Empieza por la demo y luego vuelve aquí.

---

## A. La vía de 1 clic

1. Instala el paquete ([01 — Instalación](01-Instalacion.md)). El modelo es opcional; la
   demo funciona sin él con el proveedor hash.
2. Menú **`Ecos ▸ Construir Escena de Demo`**.
3. Pulsa **Play** y camina con **WASD** hacia los cubos de colores.

> La demo usa el paquete **Input System**. Si el proyecto está en *Input Manager (Old)*,
> cambia **Project Settings ▸ Player ▸ Active Input Handling** a *Input System Package
> (New)* o *Both* y reinicia el Editor.

Qué acabas de ver:

- **5 disparadores** (uno por género). Al pisarlos, el jugador emite un **hecho**.
- **6 NPCs** que se pasan el rumor **de uno en uno** (una boca por salto).
- La etiqueta de cada NPC muestra `v{boca} · [categoría] · nivel · confianza`.
- El rumor llega a la sexta boca **deformado**: más cifra, más floritura, menos credibilidad.

El constructor reaplica su preset en cada reconstrucción, así que puedes experimentar en
el Inspector sin miedo: vuelve a ejecutar el menú para recuperar el escaparate.

---

## B. La vía manual (5 componentes)

### Paso 1 — Los datos (assets)

Menú **`Assets ▸ Create ▸ Ecos ▸ Conjunto completo de assets`** crea de golpe:

| Asset | Contenido |
| --- | --- |
| `EcosConfig.asset` | Los números (saltos, retardos, umbrales, semilla). |
| `EcosBiblioteca.asset` | El vocabulario (sujetos, acciones, objetos, plantillas). |
| `EcosCategorias.asset` | Dominios elementales y su matriz de afinidad. |

### Paso 2 — El cerebro (1 objeto)

1. GameObject vacío `EcosManager`.
2. Añade **`Ecos Bootstrap (Sentis)`**.
3. Rellena:
   - `configuracion` → `EcosConfig.asset`
   - `biblioteca` → `EcosBiblioteca.asset`
   - `categorias` → `EcosCategorias.asset`
   - `modelo` → `model.onnx` **sólo si lo has descargado y exportado**
   - `tokenizador` → `sentencepiece.bpe.model.bytes` **sólo si usas modelo**
4. Si usas modelo, deja `backend = GPUCompute` y `umbral = 0,45`. Si no, el bootstrap
   usará el proveedor hash automáticamente.

> El orden de ejecución es `-1000`: el runtime existe antes que cualquier otro
> componente, así que nada choca con `NullReferenceException` en `Awake`.
>
> **No necesitas modelo para completar este tutorial.** El paquete no incluye pesos; el
> fallback hash permite probar toda la cadena. El modelo sólo mejora la clasificación
> semántica. Ver [10 — Modelo semántico](10-SemanticaONNX.md).

### Paso 3 — El jugador (2 objetos/componentes)

1. Tu personaje (cápsula, cápsula de un CharacterController, lo que sea).
2. Añade **`Marcadores ▸ Jugador Local`** y pon `id = A`.
   Esto fija el canal `Jugador:A`, que compartirán emisores y NPCs.

### Paso 4 — Un disparador (0 código)

1. Un cubo cualquiera con **Collider ▸ Is Trigger**.
2. Añade **`Eco Trigger Action`**.
3. Configura:
   - `scope.modo = JugadorLocal`
   - `sujetoId = @JugadorA`
   - `accionId = quemar`
   - `objetoId = aldea`
   - `intensidad = 80`
   - `emitirAlEntrarEnTrigger = true`
   - `logEmisiones = true`

### Paso 5 — Los NPCs (0 código)

Por cada NPC:

1. Añade **`Memoria de NPC`**.
   - `perfil` → crea un asset de perfil (menú `Assets ▸ Create ▸ Ecos ▸ Perfil de NPC`).
   - `scope.modo = JugadorLocal`
   - `participarEnDifusion = true`
   - `logEcos = true`
2. Añade **`Eco Listener`** (sólo si quieres eventos de Unity además de la memoria).
   - `scope.modo = JugadorLocal`
   - `soloCuandoSoyElNarrador = true` ← clave para ver la cadena, no 6 copias.
   - `oyente` → el mismo asset de perfil.

### Paso 6 — Probar

Pisa el cubo. En consola verás algo así:

```
[Ecos] Emitido: [Jugador:A] @JugadorA quemar aldea | Literal/Advertencia conf=1.00 saltos=0
[Ecos] Listener NPC 1 <- ... Literal ...  "Aldric prendió fuego a la aldea."
[Ecos] NPC 1 -> NPC 2 : ... Suavizado conf=0.88 saltos=2
[Ecos] Listener NPC 2 <- ... Suavizado ... "Aldric prendió fuego a la aldea, más o menos."
...
```

---

## C. El ajuste mínimo que cambia todo

En `EcosConfig.asset`:

| Campo | Valor para ver cadenas | Por qué |
| --- | --- | --- |
| `maxSaltos` | `6` | Seis bocas de profundidad. |
| `maxContagiosPorEco` | `1` | Caminar boca a boca en vez de abanico. |
| `intervaloDeformacion` | `2` | Cada 2 s hay un salto (cadena completa en 12 s). |
| `contagioGarantizado` | `true` | Sólo para demos: evita que un mal dado corte la cadena. |
| `factorDegradacionPorSalto` | `0.22` | Recorre los 5 niveles sin saturar. |
| `factorCredibilidadPorSalto` | `0.04` | La credibilidad aguanta 6 saltos. |
| `umbralConfianzaMinima` | `0.02` | El eco no muere a mitad. |
| `saltosParaAnonimizar` | `6` | El nombre se conserva hasta la última boca. |

Esto es exactamente el preset de la demo. Si activas `contagioGarantizado`, **en
producción vuelve a desactivarlo**: el azar es lo que hace que cada partida tenga
rumores distintos.

---

## D. Siguiente parada

- Quieres entero el vocabulario y las variaciones: [05 — Biblioteca y textos](05-BibliotecaYTextos.md).
- Quieres números que escalan (500→1300 m, 10→1000 bandidos): [06 — Cantidades](06-Cantidades.md).
- Quieres escenarios listos para copiar: [11 — Recetas](11-Recetas.md).
