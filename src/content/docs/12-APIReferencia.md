# 12 — Referencia de API

Convención: `Core` = `xoloDev.Ecos.Core` (sin Unity). `Runtime` = `xoloDev.Ecos`.
`Editor` = `xoloDev.Ecos.Editor`. `Sentis` = `xoloDev.Ecos.Sentis`.

---

## 1. Tipos del dominio (`Core`)

### `EcoEvento` (readonly struct)

La unidad que viaja. Campos:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `Id` | int | Único y monótono; se conserva en la cadena. |
| `Scope` | `EcosScope` | Canal de aislamiento. |
| `SujetoId` | string | `@JugadorA`, `@Herrero`. |
| `AccionId` | string | `quemar`, `diezmar_bandidos`; puede ser la variante inversa. |
| `ObjetoId` | string | `aldea`, `@Nadie`. |
| `AccionOriginalId` | string | Acción del hecho original; se conserva tras una inversión. |
| `ObjetoOriginalId` | string | Objeto del hecho original. |
| `Intensidad` | int 0..100 | Magnitud real del hecho. |
| `Nivel` | `EcosNivelExageracion` | Literal..Distorsionado. |
| `Intencion` | `EcosIntencion` | Neutral..Lamento. |
| `DireccionDeformacion` | `EcosDireccionDeformacion` | Neutro, Atenuar, Exagerar o Invertir. |
| `CategoriaId` | int | -1 = sin clasificar. |
| `Confianza` | float 0..1 | Credibilidad. |
| `Tiempo` | double | Reloj de simulación. |
| `Entrega` | double | Cuándo debe entregarse. |
| `Saltos` | byte | Bocas recorridas. |
| `OrigenId` | int | Eco padre (-1 = fuente). |
| `NarradorId` | string | Quién cuenta esta versión. |
| `Semilla` | int | Determinismo del compositor. |

Métodos:

| Método | Devuelve | Para qué |
| --- | --- | --- |
| `EstaVivo(EcosConfiguracion)` | bool | Confianza ≥ umbral y saltos ≤ máximo. |
| `EsInversion` | bool | `AccionId` ya no coincide con `AccionOriginalId`. |
| `Derivar(...)` | `EcoEvento` | Copia con cambios; null = conserva. |
| `Resumen()` | string | Línea de log. |

### `EcosScope` (readonly struct)

`Global`, `Jugador(id)`, `Faccion(id)`, `Lugar(id)`, `Grupo(id)`, `Sistema(id)`.
Propiedades: `Kind`, `Id`. Igualdad por valor.

### `EcosEnums`

| Tipo | Valores |
| --- | --- |
| `EcosNivelExageracion` | Literal, Suavizado, Adornado, Exagerado, Distorsionado |
| `EcosDireccionDeformacion` | Neutro, Atenuar, Exagerar, Invertir |
| `EcosIntencion` | Neutral, Advertencia, Alarde, Chisme, Amenaza, Lamento |
| `EcosScopeKind` | Global, Jugador, Faccion, Lugar, Grupo, Sistema |
| `EcosGenero` | Masculino, Femenino, Neutro |
| `EcosNumero` | Singular, Plural |
| `EcosTiempoVerbal` | Pasado, Presente |
| `EcosTipoEnlace` | Testigo, Escucho, Dedujo, Repitio |
| `EcosModoSemilla` | Fija, AleatoriaPorSesion |

Utilidades:

| Miembro | Para qué |
| --- | --- |
| `EcosNiveles.Cantidad` | 5 |
| `EcosNiveles.FactorMagnitud(nivel)` | 1,0 / 1,4 / 1,8 / 2,2 / 2,6 |
| `EcosNiveles.Credibilidad(nivel)` | 1,00 / 0,85 / 0,70 / 0,45 / 0,25 |
| `EcosNiveles.DesdePresion(float)` | Convierte presión en nivel. |
| `EcosNiveles.Etiqueta(nivel)` | Nombre legible. |
| `EcosDirecciones.Cantidad` | 4 |
| `EcosDirecciones.Etiqueta(direccion)` | Neutro / Atenuar / Exagerar / Invertir. |
| `EcosIntenciones.Cantidad` | 6 |
| `EcosIntenciones.Etiqueta(intencion)` | Nombre legible. |
| `EcosSemillaSesion.Nueva()` | Semilla nueva para una sesión (runtime). |
| `EcosSemillaPartida.ParaNuevaPartida(config, out semilla)` | Config fija + semilla para guardar en el save. |
| `EcosSemillaPartida.ParaContinuarPartida(config, semilla)` | Config fija con la semilla guardada. |

### `EcosConfiguracion`

Todos los campos públicos con sus valores por defecto. Ver
[04 — Configuración](04-Configuracion.md) para la lista completa.

### `EcosPerfilNpc`

| Miembro | Tipo | Para qué |
| --- | --- | --- |
| `Id`, `Nombre`, `Scope` | — | Identidad y canal. |
| `Locuacidad`, `Credulidad`, `Memoria`, `Autoridad` | float 0..1 | Rasgos. |
| `SesgoExageracion`, `SesgoIntencion`, `SesgoVelocidad` | float -1..1 | Sesgos. |
| `SesgoElementalClave` | string | Categoría fetiche. |
| `RadioEscucha` | float | 0 = sin límite. |
| `Conocidos` | `HashSet<string>` | Nombres propios. |
| `MemoriaEcos` | `Dictionary<int, EcoEvento>` | Memoria a corto plazo. |
| `CapacidadMemoria` | int | Tope. |
| `Conoce(id)` | bool | ¿Lo tiene en `Conocidos`? |
| `CrearFuente(id, nombre)` | static | Perfil neutro para un jugador/mundo. |
| `Recordar(in eco)` | void | Guarda respetando capacidad. |
| `HaOlvidado(in eco, ahora, ttlBase)` | bool | Olvido por tiempo. |
| `EstaEnRango(distancia)` | bool | Radio de escucha. |

### `EcosBibliotecaFragmentos`

| Miembro | Para qué |
| --- | --- |
| `Sujetos`, `Acciones`, `Objetos` | Listas de diccionario. |
| `Modificadores`, `Plantillas` | Adornos y estructuras. |
| `Atribuciones`, `Coletillas` | Voz del rumor. |
| `CrearPorDefecto()` | Biblioteca de ejemplo. |
| `ConstruirIndices()` | Indexa por id. |
| `Invalidar()` | Fuerza reindexado. |
| `TrySujeto/TryAccion/TryObjeto(id, out)` | Búsquedas. |
| `SujetoDesconocido` | Constante `@Desconocido`. |

### `EcoEvento` + composición

| Tipo | Miembro | Para qué |
| --- | --- | --- |
| `EcosCompositorProcedural` | `Componer(in eco, oyente)` | Frase final. |
| | `Planificar(in eco, oyente)` | `EcosPlanFrase` con slots. |
| `EcosPlanFrase` | `Sujeto`, `Verbo`, `Objeto`, `Cantidad`, `Atribucion`, `Coletilla`, `Prefijo`, `Adverbio`, `Magnitud`, `Color`, `Sufijo`, `Plantilla`, `Texto` | Piezas. |
| | `Direccion` | Dirección efectiva: atenuar, exagerar o invertir. |
| | `AccionDesconocida`, `SujetoAnonimizado` | Diagnóstico. |

### `EcosEscaladorCantidades`

| Miembro | Para qué |
| --- | --- |
| `Calcular(accion, in eco, variarPorOyente, ref rng)` | Cifra automática para el nivel y la dirección actuales. |
| `DireccionSugerida(nivel, intencion)` | Dirección por defecto (Suavizado atenúa; Lamento atenúa; resto exagera). |
| `TieneTablaExplicita(accion)` | True si `CantidadesPorNivel` sustituye a la curva. |

### `EcosRegistroCategorias`

| Miembro | Para qué |
| --- | --- |
| `Categorias` | Lista de `EcosCategoriaElemental`. |
| `Registrar(categoria)` | Devuelve id. |
| `TryPorClave(clave, out id)` | Clave -> id. |
| `TryCategoria(id, out categoria)` | Id -> categoría. |
| `NombreDe(id)` | Nombre visible. |
| `ConstruirVectores(proveedor)` | Calcula centroides. |
| `CrearPorDefecto()` | Fuego, veneno, etc. |
| `SinCategoria` | -1. |

`EcosCategoriaElemental`: `Clave`, `Nombre`, `Sinonimos[]`,
`GananciaPropagacion`, `GananciaExageracion`, `GananciaCredibilidad`,
`SustantivosDeColor[]`.

### `EcosGrafoDeEcos` / `EcosCanalDeEcos` / `EcosEventoBus`

| Tipo | Miembro | Para qué |
| --- | --- | --- |
| `EcosEventoBus` | `ObtenerCanal(scope)` | Crea/obtiene canal. |
| | `TryObtenerCanal(scope, out)` | Consulta sin crear. |
| | `Publicar(in eco)` | Encola. |
| | `Suscribir(scope, sink/callback)` | Devuelve `IDisposable`. |
| | `Canales`, `Pendientes`, `Vaciar()` | Diagnóstico. |
| `EcosCanalDeEcos` | `Grafo`, `Npcs`, `Pendientes` | Estado. |
| | `RegistrarNpc`, `DesregistrarNpc` | Censo. |
| | `Encolar`, `TryDesencolar`, `Notificar` | Ciclo interno. |
| `EcosGrafoDeEcos` | `Anadir`, `TryNodo`, `RegistrarConocimiento` | Nodos. |
| | `Conoce(npcId, ecoId)` | ¿Lo sabe? |
| | `ConocidosPor(npcId)`, `EcosDe(sujetoId)` | Consultas. |
| | `TryEcoMasRelevante(npcId, out)` | Atajo. |
| | `Purgar(ahora, ttl, out eliminados)` | Limpieza. |

### `EcosDossierSujeto`

| Campo | Rango | Para qué |
| --- | --- | --- |
| `SujetoId` | string | Sujeto. |
| `Ecos` | int | Hechos considerados. |
| `Favorables`, `Desfavorables` | int | Desglose por valencia. |
| `Reputacion` | -100..100 | Media ponderada. |
| `Ambivalencia` | 0..1 | Relato dividido. |
| `CredibilidadMedia` | 0..1 | Confianza media de los relatos. |
| `Contradicciones` | int | Pares incompatibles. |
| `Peso` | float | Peso total de los hechos. |
| `Detalle` | `List<EcoEvento>` | Hechos que sostienen la ficha. |
| `EsAmbivalente` | bool | `Ambivalencia >= 0.5`. |
| `Polaridad` | -1..1 | `Reputacion / 100`. |

Métodos: `Vacio(sujetoId)`, `Calcular(...)`,
`CalcularDesdeGrafo(sujetoId, grafo, biblioteca, relaciones, npcId,
requiereMismoPaciente)`, `Resumen()`.

---

## 2. Contratos (puntos de extensión)

| Interfaz | Método | Para qué |
| --- | --- | --- |
| `IEcosDegradador` | `Evaluar(in eco, in contexto)` | Nivel de exageración. |
| `IEcosClasificadorIntencion` | `Clasificar(in eco, in contexto)` | Intención. |
| `IEcosProveedorEmbeddings` | `TryObtenerVector(texto, out vector)` | Vector de frase. |
| `IEcosProveedorEmbeddingsLote` | `ObtenerVectoresEnLote(claves, destino)` | Lote. |
| `IEcosMapeadorSemantico` | `Mapear(in eco)` | Acción -> categoría. |
| `IEcosTablaAfinidad` | `Obtener(a, b)`, `Establecer(a, b, afinidad)` | Matriz. |
| `IEcosReglaPropagacion` | `Aplica`, `Transformar`, `Nombre`, `Prioridad` | Regla del pipeline. |
| `IEcosReaccion` | `Reaccionar(in eco, in contexto)` | Gameplay durante el salto. |
| `IEcosFiltroContagio` | `Probabilidad(in eco, in contexto)` | ¿Se contagia? |
| `IEcosReloj` | `Ahora`, `Avanzar(dt)` | Tiempo. |
| `IEcosSink` | `RecibirEco(in eco)` | Suscriptor. |
| `IEcosCompositorTexto` | `Componer`, `Planificar` | Texto. |
| `IEcosEventoBus` | `Publicar`, `Suscribir`, `ObtenerCanal` | Bus. |
| `IEcosRuntime` | `Registrar`, `Tick`, `RegistrarNpc`, ... | Fachada. |

### Implementaciones de fábrica

| Tipo | Notas |
| --- | --- |
| `EcosDegradadorHeuristico` | Presión + bandas, monótono. |
| `EcosClasificadorIntencionHeuristico` | Por acción + sesgo. |
| `EcosFiltroContagioEstandar` | Probabilidad multiplicativa. |
| `EcosProveedorEmbeddingsHash` | 96 dims, sin dependencias. |
| `EcosMapeadorElemental` | Nearest-prototype + umbral. |
| `EcosTablaAfinidad` | Matriz simétrica. |
| `EcosPipeline` | Reglas + reacciones ordenadas. |
| `EcosRelojManual` | Tú llamas a `Tick`. |
| `EcosCompositorProcedural` | Diccionario + semilla. |

### Reglas estándar (`EcosReglasEstandar.cs`)

| Regla | Prioridad | Efecto |
| --- | --- | --- |
| `EcosReglaAnonimizacion` | 50 | `SujetoId = @Desconocido` desde `SaltosParaAnonimizar`. |
| `EcosReglaDegradacion` | 100 | Nivel + intención + confianza. |
| `EcosReglaDeformacionNarrativa` | 120 | En Distorsionado, cambia a la variante `AccionInversaId` si existe. |
| `EcosReglaContradiccion` | 150 | Penaliza creencias incompatibles. |
| `EcosReglaAfinidadElemental` | 200 | Afinidad modula magnitud/credibilidad. |
| `EcosReglaSesgoNarrador` | 300 | Sesgos del narrador. |
| `EcosReglaDesvanecimiento` | 400 | Credibilidad por salto. |

`EcosReglaBase` implementa `IEcosReglaPropagacion` y permite heredar.

---

## 3. Infraestructura (`Core`)

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

Todos los `Con...` devuelven el builder (fluido). `ConstruirPipelinePorDefecto` es
estático y se usa cuando no inyectas pipeline.

### `EcosRuntimeDefault`

| Miembro | Para qué |
| --- | --- |
| `Bus`, `Compositor`, `Mapeador`, `Categorias`, `Biblioteca`, `Config`, `Reloj`, `Pipeline`, `Relaciones` | Servicios. |
| `Propagador` | Motor de difusión. |
| `Npcs` | Censo. |
| `OnEcoRegistrado` | Evento de hechos. |
| `Registrar`, `CrearEco`, `RegistrarEvento`, `Tick` | Ciclo. |
| `RegistrarNpc`, `DesregistrarNpc`, `RegistrarPerfilFuente`, `TryPerfilFuente` | Perfiles. |
| `AnadirPuente`, `AnadirRegla`, `AnadirReaccion`, `QuitarRegla`, `QuitarReaccion` | Extensión en vivo. |
| `Narrar(in eco, oyente)` | Atajo al compositor. |

### `EcosPropagador`

| Miembro | Para qué |
| --- | --- |
| Constructor `(bus, config, pipeline, filtro, afinidad, categorias)` | Montaje manual. |
| `Puentes` | Puentes registrados. |
| `AnadirPuente(puente)` | Añade uno. |
| `OnContagio` | Evento `(eco, emisor, receptor)`. |
| `Tick(deltaTiempo)` | Avanza la difusión. |

### `EcosPuenteDeScope`

Campos: `Origen`, `Destino`, `Anonimizar`, `SaltosMinimos`, `Probabilidad`,
`PerdidaConfianza`, `NarradorDestino`. Constructor `(origen, destino, anonimizar)`.
Método `TryCruzar(in eco, ahora, semilla, out cruzado)`.

---

## 4. Runtime (Unity)

### `EcosSystem` (fachada estática)

| Miembro | Para qué |
| --- | --- |
| `Runtime` | Runtime activo. |
| `Inicializado` | ¿Hay runtime? |
| `OnInicializado`, `OnFinalizado` | Eventos. |
| `Inicializar(IEcosRuntime)` / `Inicializar(builder)` | Inyecta. |
| `Finalizar()` | Apaga y limpia. |
| `AsegurarRuntime()` | Crea uno por defecto con aviso. |
| `Tick(dt)` | Avanza. |
| `RegistrarEvento(...)` | Publica un hecho. |
| `CrearEco(...)` | Crea, publica y devuelve el eco. |
| `Narrar(eco, oyente)` | Frase. |
| `Planificar(eco, oyente)` | Plan. |
| `Suscribir(scope, sink/callback)` | Devuelve `IDisposable`. |
| `RegistrarNpc`, `DesregistrarNpc`, `RegistrarPerfilFuente` | Perfiles. |
| `TryEcoMasRelevante(scope, npcId, out eco)` | Consulta. |
| `EcosDe(scope, sujetoId)` | Lista. |
| `TryDossier(scope, sujetoId, out ficha)` | Ficha del canal. |
| `TryDossierDeNpc(scope, npcId, sujetoId, out ficha)` | Verdad privada. |

### Componentes

| Componente | Menú | Para qué |
| --- | --- | --- |
| `EcosBootstrap` | `Ecos/Ecos Bootstrap` | Runtime con heurísticas. |
| `EcosBootstrapSentis` | `Ecos/Ecos Bootstrap (Sentis)` | Runtime + modelo. |
| `EcosEmisor` | `Ecos/Eco Emisor (base)` | Clase base. |
| `EcosTriggerAction` | `Ecos/Eco Trigger Action` | Emisor de diseñador. |
| `EcosListener` | `Ecos/Eco Listener` | UnityEvents. |
| `EcosMemoriaNpc` | `Ecos/Memoria de NPC` | Boca + memoria. |
| `EcosReaccionComponente` | `Ecos/Reacción de NPC` | Reacción condicional. |
| `EcosJugadorLocal` | `Ecos/Marcadores/Jugador Local` | Id del jugador. |
| `EcosIdentidad` | `Ecos/Marcadores/Identidad de Eco` | Sujeto + scope. |

### Assets (`ScriptableObject`)

| Asset | Menú | Contenido |
| --- | --- | --- |
| `EcosConfigAsset` | `Ecos/Configuración` | Números. |
| `EcosBibliotecaAsset` | `Ecos/Biblioteca de Fragmentos` | Vocabulario. |
| `EcosCategoriasAsset` | `Ecos/Categorías Elementales` | Categorías + afinidad. |
| `EcosPerfilNpcAsset` | `Ecos/Perfil de NPC` | Personalidad. |

Métodos clave:

| Asset | Método | Devuelve |
| --- | --- | --- |
| `EcosConfigAsset` | `ToConfig()` | `EcosConfiguracion` |
| `EcosBibliotecaAsset` | `Construir()` | `EcosBibliotecaFragmentos` |
| `EcosBibliotecaAsset` | `Validar()` | `List<string>` avisos |
| `EcosCategoriasAsset` | `ConstruirRegistro()` | `EcosRegistroCategorias` |
| `EcosCategoriasAsset` | `ConstruirTabla()` | `IEcosTablaAfinidad` |
| `EcosPerfilNpcAsset` | `ConstruirPerfil(id, scope)` | `EcosPerfilNpc` |

---

## 5. Sentis (`Runtime/Sentis`)

### `EcosBootstrapSentis`

Campos: `modelo` (`ModelAsset`), `tokenizador` (`TextAsset`), `backend`
(`BackendType`), `longitudMaxima`, `loteMaximo`, `umbral`, `precalentarAlArrancar`,
`logDiagnostico`. Propiedad `Proveedor` y menú contextual de diagnóstico.

### `EcosProveedorEmbeddingsSentis`

| Miembro | Para qué |
| --- | --- |
| `TryCrear(modelo, tokenizador, out proveedor, out error, backend, longitudMaxima)` | Creación segura. |
| `EstaListo`, `Nombre`, `Dimension`, `Backend` | Estado. |
| `Umbral`, `LoteMaximo` | Ajustes. |
| `TryObtenerVector`, `ObtenerVectoresEnLote`, `Precalentar` | Inferencia. |
| `EntradasEnCache`, `TokenizadorDescripcion`, `Describir()` | Diagnóstico. |
| `Dispose()` | Libera `Worker`. |

---

## 6. Editor (`Editor`)

| Elemento | Menú | Para qué |
| --- | --- | --- |
| `EcosDemoBuilder` | `Ecos/Construir Escena de Demo` | Genera la escena completa. |
| `EcosVentanaDebug` | `Window/Ecos/Consola de Ecos` | Estado + laboratorio de frases. |
| `EcosMenuAssets` | `Assets/Create/Ecos/Conjunto completo de assets` | Crea config, biblioteca y categorías. |
| `EcosTriggerActionEditor` | — | Botón "Emitir ahora". |
| `EcosBibliotecaAssetEditor` | — | Validación + preset. |
| `EcosCategoriasAssetEditor` | — | Validación + preset. |

---

## 7. Onnx opcional (`#if ECOS_ONNX`)

`xoloDev.Ecos.Onnx.EcosProveedorEmbeddingsOnnx` implementa
`IEcosProveedorEmbeddings`/`Lote` con `Microsoft.ML.OnnxRuntime`. No se compila por
defecto (define `ECOS_ONNX`). Se usa en tests headless o herramientas de escritorio.

---

## 8. Qué `using` necesito

| Quiero... | Using |
| --- | --- |
| Datos, reglas, tests | `xoloDev.Ecos.Core` |
| Componentes, assets, fachada | `xoloDev.Ecos` |
| Modelo Sentis | `xoloDev.Ecos.Sentis` + `Unity.InferenceEngine` |
| Editores | `xoloDev.Ecos.Editor` + `UnityEditor` |
| ONNX Runtime | `xoloDev.Ecos.Onnx` (con define) |
