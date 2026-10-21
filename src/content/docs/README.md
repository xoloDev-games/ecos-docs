# Ecos — Documentación

> **Sistema de propagación y degradación de rumores para NPCs.**
> Un hecho ocurre una vez; el mundo lo cuenta mil veces, cada vez peor.
> Todo corre en local (Edge AI): sin servidor, sin GPU obligatoria y con determinismo total.

Namespace raíz: `xoloDev.Ecos` · Dominio puro: `xoloDev.Ecos.Core`

---

## Qué es y qué NO es

**Es** un motor de rumores:

- Un NPC vive un hecho ("el herrero quemó la aldea").
- El hecho se contagia boca a boca entre los NPCs de un canal.
- En cada salto el relato **deforma**: añade adornos, pierde detalle, sube o baja las
  cantidades, cambia la intención y baja la credibilidad.
- En Distorsionado puede girar a una **variante inversa declarada** ("cometió regicidio"
  → "intentó salvar al rey"), conservando el hecho original para auditarlo.
- El texto final lo redacta un **compositor procedural** desde diccionarios.

**No es** un generador de texto con IA. Ningún modelo escribe la frase.
El modelo ligero (opcional) aporta embeddings para mapear acciones a categorías
elementales; el *nivel de exageración* y la *intención* los deciden clasificadores
deterministas que también puedes sustituir por los tuyos (BYOM). Esto es la regla **Cero
Alucinaciones**: el juego nunca inventa verbos, culpables ni pacientes que el diseñador no
haya declarado.

![Arquitectura](arquitectura.png)

---

## Índice

| Documento | Para qué |
| --- | --- |
| [01 — Instalación](01-Instalacion.md) | Requisitos, paquete UPM y puesta en marcha. |
| [02 — Inicio rápido](02-InicioRapido.md) | Una escena jugable en 10 minutos. |
| [03 — Conceptos](03-Conceptos.md) | Eco, canal, nivel, intención, confianza, saltos. |
| [04 — Configuración](04-Configuracion.md) | Todas las tuercas, con su efecto esperado. |
| [05 — Biblioteca y textos](05-BibliotecaYTextos.md) | Sujetos, acciones, objetos, plantillas, atribuciones. |
| [06 - Cantidades y recuentos](06-Cantidades.md) | Curva no monótona: 500→450→1.800 m; inversión declarada. |
| [07 — Emitir ecos](07-EmitirEcos.md) | Triggers, UnityEvents, código, multijugador. |
| [08 — Escuchar y reaccionar](08-EscucharYReaccionar.md) | Listeners, memoria de NPC, reacciones, sinks propios. |
| [09 — NPCs y perfiles](09-NPCsYPerfiles.md) | Personalidad, rasgos, sesgos, memoria. |
| [10 — Modelo semántico](10-SemanticaONNX.md) | Modelo opcional: descarga, export FP16, backend y rendimiento. |
| [11 — Recetas](11-Recetas.md) | Copiar-pegar: escenarios concretos y qué esperar. |
| [12 — Referencia de API](12-APIReferencia.md) | Todas las clases y miembros públicos. |
| [13 — Solución de problemas](13-Problemas.md) | Síntomas típicos y su causa. |
| [14 — Empaquetado y venta](14-EmpaquetadoYVenta.md) | Cómo se genera la entrega y las licencias. |

Diagramas:

- `arquitectura.png` — capas y dependencias.
- `flujo-eco.png` — ciclo de vida de un eco, de la fuente a la sexta boca.

Manual en inglés: los mismos 14 capítulos están en [`en/README.md`](en/README.md).
La web pública sirve español en `/docs/...` e inglés en `/en/docs/...`.

El diseño interno y el porqué de cada decisión están en
[`arquitectura-interna.md`](arquitectura-interna.md) y
[`diseno-contradicciones.md`](diseno-contradicciones.md). El resto de páginas del
proyecto: [`changelog.md`](changelog.md), [`soporte.md`](soporte.md),
[`licencia-asset.md`](licencia-asset.md) y
[`licencias-terceros.md`](licencias-terceros.md).

---

## Los 60 segundos

```csharp
// 1. Runtime para tests o servidores (sin Unity).
var runtime = new EcosRuntimeBuilder()
    .ConBiblioteca(EcosBibliotecaFragmentos.CrearPorDefecto())
    .ConReloj(new EcosRelojManual())
    .Construir();

// 2. Un NPC que escucha en el canal del jugador "A".
runtime.RegistrarNpc(new EcosPerfilNpc
{
    Id = "Herrero", Nombre = "el herrero", Scope = EcosScope.Jugador("A")
});

// 3. Ocurre un hecho.
runtime.RegistrarEvento("A", "quemar", "aldea", 80);

// 4. Avanzar el mundo y leer lo que se cuenta.
runtime.Tick(1.0);
EcoEvento rumor;
if (runtime.Bus.ObtenerCanal(EcosScope.Jugador("A")).Grafo.TryEcoMasRelevante("Herrero", out rumor))
    Debug.Log(EcosSystem.Narrar(rumor, null));
```

En Unity, lo mismo pero arrastrando componentes: mira
[02 — Inicio rápido](02-InicioRapido.md).

---

## Garantías del sistema

| Garantía | Cómo se cumple |
| --- | --- |
| **Cero alucinaciones** | El eco es `Sujeto + Acción + Objeto + Nivel + Intención`; el compositor sólo sustituye tokens de diccionario. |
| **Determinismo** | `SemillaMundo` + una semilla derivada de eco y oyente. Misma semilla ⇒ misma frase, en cualquier máquina. `ModoSemilla` permite fijarla (replay/continuar) o sortearla por sesión sin romper el replay dentro de la sesión. |
| **1..N jugadores aislados** | Cada eco vive en un `EcosScope`; los canales no se ven salvo por un puente explícito. |
| **Coste acotado (Edge)** | Topes de saltos, de bocas por salto, de eventos por tick y de nodos por canal. |
| **Degradación creíble** | La credibilidad cae salto a salto; el nivel sube. Un rumor increíble muere. |
| **Dato ≠ adorno** | El nivel, la intención y la magnitud son etiquetas; la frase se materializa al final. |
