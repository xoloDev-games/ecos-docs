# 12 — API Reference

Convention: `Core` = `xoloDev.Ecos.Core` (no Unity). `Runtime` = `xoloDev.Ecos`.
`Editor` = `xoloDev.Ecos.Editor`. `Sentis` = `xoloDev.Ecos.Sentis`.

---

## 1. Domain types (`Core`)

### `EcoEvento` (readonly struct)

The unit that travels. Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `Id` | int | Unique and monotonic; preserved along the chain. |
| `Scope` | `EcosScope` | Isolation channel. |
| `SujetoId` | string | `@JugadorA`, `@Herrero`. |
| `AccionId` | string | `quemar`, `diezmar_bandidos`. |
| `ObjetoId` | string | `aldea`, `@Nadie`. |
| `Intensidad` | int 0..100 | Real magnitude of the fact. |
| `Nivel` | `EcosNivelExageracion` | Literal..Distorted. |
| `Intencion` | `EcosIntencion` | Neutral..Lament. |
| `CategoriaId` | int | -1 = unclassified. |
| `Confianza` | float 0..1 | Credibility. |
| `Tiempo` | double | Simulation clock. |
| `Entrega` | double | When it must be delivered. |
| `Saltos` | byte | Mouths traversed. |
| `OrigenId` | int | Parent echo (-1 = source). |
| `NarradorId` | string | Who tells this version. |
| `Semilla` | int | Composer determinism. |

Methods:

| Method | Returns | What for |
| --- | --- | --- |
| `EstaVivo(EcosConfiguracion)` | bool | Confidence ≥ threshold and hops ≤ maximum. |
| `Derivar(...)` | `EcoEvento` | Copy with changes; null = keep as is. |
| `Resumen()` | string | Log line. |

### `EcosScope` (readonly struct)

`Global`, `Jugador(id)`, `Faccion(id)`, `Lugar(id)`, `Grupo(id)`, `Sistema(id)`.
Properties: `Kind`, `Id`. Equality by value.

### `EcosEnums`

| Type | Values |
| --- | --- |
| `EcosNivelExageracion` | Literal, Suavizado, Adornado, Exagerado, Distorsionado |
| `EcosIntencion` | Neutral, Advertencia, Alarde, Chisme, Amenaza, Lamento |
| `EcosScopeKind` | Global, Jugador, Faccion, Lugar, Grupo, Sistema |
| `EcosGenero` | Masculino, Femenino, Neutro |
| `EcosNumero` | Singular, Plural |
| `EcosTiempoVerbal` | Pasado, Presente |
| `EcosTipoEnlace` | Testigo, Escucho, Dedujo, Repitio |
| `EcosModoSemilla` | Fija, AleatoriaPorSesion |

Utilities:

| Member | What for |
| --- | --- |
| `EcosNiveles.Cantidad` | 5 |
| `EcosNiveles.FactorMagnitud(nivel)` | 1,0 / 1,4 / 1,8 / 2,2 / 2,6 |
| `EcosNiveles.Credibilidad(nivel)` | 1,00 / 0,85 / 0,70 / 0,45 / 0,25 |
| `EcosNiveles.DesdePresion(float)` | Converts pressure into a level. |
| `EcosNiveles.Etiqueta(nivel)` | Human-readable name. |
| `EcosIntenciones.Cantidad` | 6 |
| `EcosIntenciones.Etiqueta(intencion)` | Human-readable name. |
| `EcosSemillaSesion.Nueva()` | New seed for a session (runtime). |
| `EcosSemillaPartida.ParaNuevaPartida(config, out semilla)` | Fixed config + seed to store in the save. |
| `EcosSemillaPartida.ParaContinuarPartida(config, semilla)` | Fixed config with the stored seed. |

### `EcosConfiguracion`

All the public fields with their default values. See
[04 — Configuration](04-Configuracion.md) for the full list.

### `EcosPerfilNpc`

| Member | Type | What for |
| --- | --- | --- |
| `Id`, `Nombre`, `Scope` | — | Identity and channel. |
| `Locuacidad`, `Credulidad`, `Memoria`, `Autoridad` | float 0..1 | Traits. |
| `SesgoExageracion`, `SesgoIntencion`, `SesgoVelocidad` | float -1..1 | Biases. |
| `SesgoElementalClave` | string | Fetish category. |
| `RadioEscucha` | float | 0 = no limit. |
| `Conocidos` | `HashSet<string>` | Proper names. |
| `MemoriaEcos` | `Dictionary<int, EcoEvento>` | Short-term memory. |
| `CapacidadMemoria` | int | Upper bound. |
| `Conoce(id)` | bool | Is it in `Conocidos`? |
| `CrearFuente(id, nombre)` | static | Neutral profile for a player/world. |
| `Recordar(in eco)` | void | Stores it, respecting capacity. |
| `HaOlvidado(in eco, ahora, ttlBase)` | bool | Forgetting over time. |
| `EstaEnRango(distancia)` | bool | Listening radius. |

### `EcosBibliotecaFragmentos`

| Member | What for |
| --- | --- |
| `Sujetos`, `Acciones`, `Objetos` | Dictionary lists. |
| `Modificadores`, `Plantillas` | Adornments and structures. |
| `Atribuciones`, `Coletillas` | The voice of the rumor. |
| `CrearPorDefecto()` | Example library. |
| `ConstruirIndices()` | Indexes by id. |
| `Invalidar()` | Forces reindexing. |
| `TrySujeto/TryAccion/TryObjeto(id, out)` | Lookups. |
| `SujetoDesconocido` | Constant `@Desconocido`. |

### `EcoEvento` + composition

| Type | Member | What for |
| --- | --- | --- |
| `EcosCompositorProcedural` | `Componer(in eco, oyente)` | Final sentence. |
| | `Planificar(in eco, oyente)` | `EcosPlanFrase` with slots. |
| `EcosPlanFrase` | `Sujeto`, `Verbo`, `Objeto`, `Cantidad`, `Atribucion`, `Coletilla`, `Prefijo`, `Adverbio`, `Magnitud`, `Color`, `Sufijo`, `Plantilla`, `Texto` | Pieces. |
| | `AccionDesconocida`, `SujetoAnonimizado` | Diagnostics. |

### `EcosRegistroCategorias`

| Member | What for |
| --- | --- |
| `Categorias` | List of `EcosCategoriaElemental`. |
| `Registrar(categoria)` | Returns the id. |
| `TryPorClave(clave, out id)` | Key -> id. |
| `TryCategoria(id, out categoria)` | Id -> category. |
| `NombreDe(id)` | Visible name. |
| `ConstruirVectores(proveedor)` | Computes centroids. |
| `CrearPorDefecto()` | Fire, poison, etc. |
| `SinCategoria` | -1. |

`EcosCategoriaElemental`: `Clave`, `Nombre`, `Sinonimos[]`,
`GananciaPropagacion`, `GananciaExageracion`, `GananciaCredibilidad`,
`SustantivosDeColor[]`.

### `EcosGrafoDeEcos` / `EcosCanalDeEcos` / `EcosEventoBus`

| Type | Member | What for |
| --- | --- | --- |
| `EcosEventoBus` | `ObtenerCanal(scope)` | Creates/gets a channel. |
| | `TryObtenerCanal(scope, out)` | Looks up without creating. |
| | `Publicar(in eco)` | Enqueues. |
| | `Suscribir(scope, sink/callback)` | Returns `IDisposable`. |
| | `Canales`, `Pendientes`, `Vaciar()` | Diagnostics. |
| `EcosCanalDeEcos` | `Grafo`, `Npcs`, `Pendientes` | State. |
| | `RegistrarNpc`, `DesregistrarNpc` | Census. |
| | `Encolar`, `TryDesencolar`, `Notificar` | Internal cycle. |
| `EcosGrafoDeEcos` | `Anadir`, `TryNodo`, `RegistrarConocimiento` | Nodes. |
| | `Conoce(npcId, ecoId)` | Does it know it? |
| | `ConocidosPor(npcId)`, `EcosDe(sujetoId)` | Queries. |
| | `TryEcoMasRelevante(npcId, out)` | Shortcut. |
| | `Purgar(ahora, ttl, out eliminados)` | Cleanup. |

### `EcosDossierSujeto`

| Field | Range | What for |
| --- | --- | --- |
| `SujetoId` | string | Subject. |
| `Ecos` | int | Facts considered. |
| `Favorables`, `Desfavorables` | int | Breakdown by valence. |
| `Reputacion` | -100..100 | Weighted average. |
| `Ambivalencia` | 0..1 | Divided story. |
| `CredibilidadMedia` | 0..1 | Average confidence of the stories. |
| `Contradicciones` | int | Incompatible pairs. |
| `Peso` | float | Total weight of the facts. |
| `Detalle` | `List<EcoEvento>` | Facts that support the dossier. |
| `EsAmbivalente` | bool | `Ambivalencia >= 0.5`. |
| `Polaridad` | -1..1 | `Reputacion / 100`. |

Methods: `Vacio(sujetoId)`, `Calcular(...)`,
`CalcularDesdeGrafo(sujetoId, grafo, biblioteca, relaciones, npcId,
requiereMismoPaciente)`, `Resumen()`.

---

## 2. Contracts (extension points)

| Interface | Method | What for |
| --- | --- | --- |
| `IEcosDegradador` | `Evaluar(in eco, in contexto)` | Exaggeration level. |
| `IEcosClasificadorIntencion` | `Clasificar(in eco, in contexto)` | Intention. |
| `IEcosProveedorEmbeddings` | `TryObtenerVector(texto, out vector)` | Sentence vector. |
| `IEcosProveedorEmbeddingsLote` | `ObtenerVectoresEnLote(claves, destino)` | Batch. |
| `IEcosMapeadorSemantico` | `Mapear(in eco)` | Action -> category. |
| `IEcosTablaAfinidad` | `Obtener(a, b)`, `Establecer(a, b, afinidad)` | Matrix. |
| `IEcosReglaPropagacion` | `Aplica`, `Transformar`, `Nombre`, `Prioridad` | Pipeline rule. |
| `IEcosReaccion` | `Reaccionar(in eco, in contexto)` | Gameplay during the hop. |
| `IEcosFiltroContagio` | `Probabilidad(in eco, in contexto)` | Is it contagious? |
| `IEcosReloj` | `Ahora`, `Avanzar(dt)` | Time. |
| `IEcosSink` | `RecibirEco(in eco)` | Subscriber. |
| `IEcosCompositorTexto` | `Componer`, `Planificar` | Text. |
| `IEcosEventoBus` | `Publicar`, `Suscribir`, `ObtenerCanal` | Bus. |
| `IEcosRuntime` | `Registrar`, `Tick`, `RegistrarNpc`, ... | Facade. |

### Factory implementations

| Type | Notes |
| --- | --- |
| `EcosDegradadorHeuristico` | Pressure + bands, monotonic. |
| `EcosClasificadorIntencionHeuristico` | By action + bias. |
| `EcosFiltroContagioEstandar` | Multiplicative probability. |
| `EcosProveedorEmbeddingsHash` | 96 dims, no dependencies. |
| `EcosMapeadorElemental` | Nearest-prototype + threshold. |
| `EcosTablaAfinidad` | Symmetric matrix. |
| `EcosPipeline` | Ordered rules + reactions. |
| `EcosRelojManual` | You call `Tick`. |
| `EcosCompositorProcedural` | Dictionary + seed. |

### Standard rules (`EcosReglasEstandar.cs`)

| Rule | Priority | Effect |
| --- | --- | --- |
| `EcosReglaAnonimizacion` | 50 | `SujetoId = @Desconocido` from `SaltosParaAnonimizar` onward. |
| `EcosReglaDegradacion` | 100 | Level + intention + confidence. |
| `EcosReglaContradiccion` | 150 | Penalizes incompatible beliefs. |
| `EcosReglaAfinidadElemental` | 200 | Affinity modulates magnitude/credibility. |
| `EcosReglaSesgoNarrador` | 300 | The narrator's biases. |
| `EcosReglaDesvanecimiento` | 400 | Credibility per hop. |

`EcosReglaBase` implements `IEcosReglaPropagacion` and allows inheritance.

---

## 3. Infrastructure (`Core`)

### `EcosRuntimeBuilder`

```csharp
var runtime = new EcosRuntimeBuilder()
    .ConConfiguracion(config)
    .ConBiblioteca(biblioteca)
    .ConCategorias(categorias)
    .ConProveedorEmbeddings(proveedor)
    .ConAfinidad(tabla)
    .ConMapeador(mapeador)
    .ConDegradador(degradador)
    .ConClasificadorIntencion(clasificador)
    .ConFiltroContagio(filtro)
    .ConCompositor(compositor)
    .ConBus(bus)
    .ConReloj(reloj)
    .ConPipeline(pipeline)
    .ConRelacionesAcciones(relaciones)
    .ConRegla(regla)
    .ConReaccion(reaccion)
    .ConPuente(origen, destino, anonimizar)
    .Construir();
```

All the `Con...` methods return the builder (fluent). `ConstruirPipelinePorDefecto` is
static and is used when you do not inject a pipeline.

### `EcosRuntimeDefault`

| Member | What for |
| --- | --- |
| `Bus`, `Compositor`, `Mapeador`, `Categorias`, `Biblioteca`, `Config`, `Reloj`, `Pipeline`, `Relaciones` | Services. |
| `Propagador` | Diffusion engine. |
| `Npcs` | Census. |
| `OnEcoRegistrado` | Event for facts. |
| `Registrar`, `CrearEco`, `RegistrarEvento`, `Tick` | Cycle. |
| `RegistrarNpc`, `DesregistrarNpc`, `RegistrarPerfilFuente`, `TryPerfilFuente` | Profiles. |
| `AnadirPuente`, `AnadirRegla`, `AnadirReaccion`, `QuitarRegla`, `QuitarReaccion` | Live extension. |
| `Narrar(in eco, oyente)` | Shortcut to the composer. |

### `EcosPropagador`

| Member | What for |
| --- | --- |
| Constructor `(bus, config, pipeline, filtro, afinidad, categorias)` | Manual assembly. |
| `Puentes` | Registered bridges. |
| `AnadirPuente(puente)` | Adds one. |
| `OnContagio` | Event `(eco, emisor, receptor)`. |
| `Tick(deltaTiempo)` | Advances diffusion. |

### `EcosPuenteDeScope`

Fields: `Origen`, `Destino`, `Anonimizar`, `SaltosMinimos`, `Probabilidad`,
`PerdidaConfianza`, `NarradorDestino`. Constructor `(origen, destino, anonimizar)`.
Method `TryCruzar(in eco, ahora, semilla, out cruzado)`.

---

## 4. Runtime (Unity)

### `EcosSystem` (static facade)

| Member | What for |
| --- | --- |
| `Runtime` | Active runtime. |
| `Inicializado` | Is there a runtime? |
| `OnInicializado`, `OnFinalizado` | Events. |
| `Inicializar(IEcosRuntime)` / `Inicializar(builder)` | Injects. |
| `Finalizar()` | Shuts down and cleans up. |
| `AsegurarRuntime()` | Creates a default one with a warning. |
| `Tick(dt)` | Advances. |
| `RegistrarEvento(...)` | Publishes a fact. |
| `CrearEco(...)` | Creates it, publishes it and returns the echo. |
| `Narrar(eco, oyente)` | Sentence. |
| `Planificar(eco, oyente)` | Plan. |
| `Suscribir(scope, sink/callback)` | Returns `IDisposable`. |
| `RegistrarNpc`, `DesregistrarNpc`, `RegistrarPerfilFuente` | Profiles. |
| `TryEcoMasRelevante(scope, npcId, out eco)` | Query. |
| `EcosDe(scope, sujetoId)` | List. |
| `TryDossier(scope, sujetoId, out ficha)` | Dossier for the channel. |
| `TryDossierDeNpc(scope, npcId, sujetoId, out ficha)` | Private truth. |

### Components

| Component | Menu | What for |
| --- | --- | --- |
| `EcosBootstrap` | `Ecos/Ecos Bootstrap` | Runtime with heuristics. |
| `EcosBootstrapSentis` | `Ecos/Ecos Bootstrap (Sentis)` | Runtime + model. |
| `EcosEmisor` | `Ecos/Eco Emisor (base)` | Base class. |
| `EcosTriggerAction` | `Ecos/Eco Trigger Action` | Designer emitter. |
| `EcosListener` | `Ecos/Eco Listener` | UnityEvents. |
| `EcosMemoriaNpc` | `Ecos/Memoria de NPC` | Mouth + memory. |
| `EcosReaccionComponente` | `Ecos/Reacción de NPC` | Conditional reaction. |
| `EcosJugadorLocal` | `Ecos/Marcadores/Jugador Local` | Player id. |
| `EcosIdentidad` | `Ecos/Marcadores/Identidad de Eco` | Subject + scope. |

### Assets (`ScriptableObject`)

| Asset | Menu | Content |
| --- | --- | --- |
| `EcosConfigAsset` | `Ecos/Configuración` | Numbers. |
| `EcosBibliotecaAsset` | `Ecos/Biblioteca de Fragmentos` | Vocabulary. |
| `EcosCategoriasAsset` | `Ecos/Categorías Elementales` | Categories + affinity. |
| `EcosPerfilNpcAsset` | `Ecos/Perfil de NPC` | Personality. |

Key methods:

| Asset | Method | Returns |
| --- | --- | --- |
| `EcosConfigAsset` | `ToConfig()` | `EcosConfiguracion` |
| `EcosBibliotecaAsset` | `Construir()` | `EcosBibliotecaFragmentos` |
| `EcosBibliotecaAsset` | `Validar()` | `List<string>` of warnings |
| `EcosCategoriasAsset` | `ConstruirRegistro()` | `EcosRegistroCategorias` |
| `EcosCategoriasAsset` | `ConstruirTabla()` | `IEcosTablaAfinidad` |
| `EcosPerfilNpcAsset` | `ConstruirPerfil(id, scope)` | `EcosPerfilNpc` |

---

## 5. Sentis (`Runtime/Sentis`)

### `EcosBootstrapSentis`

Fields: `modelo` (`ModelAsset`), `tokenizador` (`TextAsset`), `backend`
(`BackendType`), `longitudMaxima`, `loteMaximo`, `umbral`, `precalentarAlArrancar`,
`logDiagnostico`. Property `Proveedor` and a diagnostic context menu.

### `EcosProveedorEmbeddingsSentis`

| Member | What for |
| --- | --- |
| `TryCrear(modelo, tokenizador, out proveedor, out error, backend, longitudMaxima)` | Safe creation. |
| `EstaListo`, `Nombre`, `Dimension`, `Backend` | State. |
| `Umbral`, `LoteMaximo` | Settings. |
| `TryObtenerVector`, `ObtenerVectoresEnLote`, `Precalentar` | Inference. |
| `EntradasEnCache`, `TokenizadorDescripcion`, `Describir()` | Diagnostics. |
| `Dispose()` | Releases the `Worker`. |

---

## 6. Editor (`Editor`)

| Element | Menu | What for |
| --- | --- | --- |
| `EcosDemoBuilder` | `Ecos/Construir Escena de Demo` | Generates the whole scene. |
| `EcosVentanaDebug` | `Window/Ecos/Consola de Ecos` | Status + sentence lab. |
| `EcosMenuAssets` | `Assets/Create/Ecos/Conjunto completo de assets` | Creates config, library and categories. |
| `EcosTriggerActionEditor` | — | "Emit now" button. |
| `EcosBibliotecaAssetEditor` | — | Validation + preset. |
| `EcosCategoriasAssetEditor` | — | Validation + preset. |

---

## 7. Optional Onnx (`#if ECOS_ONNX`)

`xoloDev.Ecos.Onnx.EcosProveedorEmbeddingsOnnx` implements
`IEcosProveedorEmbeddings`/`Lote` with `Microsoft.ML.OnnxRuntime`. It is not compiled by
default (define `ECOS_ONNX`). It is used in headless tests or desktop tools.

---

## 8. Which `using` do I need?

| I want... | Using |
| --- | --- |
| Data, rules, tests | `xoloDev.Ecos.Core` |
| Components, assets, facade | `xoloDev.Ecos` |
| Sentis model | `xoloDev.Ecos.Sentis` + `Unity.InferenceEngine` |
| Editors | `xoloDev.Ecos.Editor` + `UnityEditor` |
| ONNX Runtime | `xoloDev.Ecos.Onnx` (with the define) |
