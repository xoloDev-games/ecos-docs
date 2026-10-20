import manual from './content/docs/README.md?raw'
import instalacion from './content/docs/01-Instalacion.md?raw'
import inicioRapido from './content/docs/02-InicioRapido.md?raw'
import conceptos from './content/docs/03-Conceptos.md?raw'
import configuracion from './content/docs/04-Configuracion.md?raw'
import biblioteca from './content/docs/05-BibliotecaYTextos.md?raw'
import cantidades from './content/docs/06-Cantidades.md?raw'
import emitir from './content/docs/07-EmitirEcos.md?raw'
import escuchar from './content/docs/08-EscucharYReaccionar.md?raw'
import npcs from './content/docs/09-NPCsYPerfiles.md?raw'
import modelo from './content/docs/10-SemanticaONNX.md?raw'
import recetas from './content/docs/11-Recetas.md?raw'
import api from './content/docs/12-APIReferencia.md?raw'
import problemas from './content/docs/13-Problemas.md?raw'
import empaquetado from './content/docs/14-EmpaquetadoYVenta.md?raw'
import arquitectura from './content/docs/arquitectura-interna.md?raw'
import diseno from './content/docs/diseno-contradicciones.md?raw'
import changelog from './content/docs/changelog.md?raw'
import soporte from './content/docs/soporte.md?raw'
import licenciaAsset from './content/docs/licencia-asset.md?raw'
import licenciasTerceros from './content/docs/licencias-terceros.md?raw'

export const VERSION = '1.1.0'
export const UNITY_MIN = '6.3 LTS (6000.3)'

export const docs = [
  {
    slug: 'manual',
    file: 'README.md',
    title: 'Manual completo',
    short: 'Mapa de los 14 capítulos, los diagramas y el modelo mental de Ecos.',
    description:
      'Punto de entrada a la documentación: qué es Ecos, qué no es, cómo se organiza el manual y por dónde empezar.',
    section: 'Primeros pasos',
    icon: 'BookOpen',
    content: manual,
  },
  {
    slug: 'instalacion',
    file: '01-Instalacion.md',
    title: 'Instalación',
    short: 'Requisitos, paquete UPM, dependencias y primera puesta en marcha.',
    description:
      'Instala Ecos en Unity 6.3 LTS, importa el sample y comprueba que el Editor, el runtime y el modelo opcional están listos.',
    section: 'Primeros pasos',
    icon: 'Download',
    content: instalacion,
  },
  {
    slug: 'inicio-rapido',
    file: '02-InicioRapido.md',
    title: 'Inicio rápido',
    short: 'Una escena jugable en diez minutos, sin leer todo el manual.',
    description:
      'Crea los assets, configura un trigger, añade memoria a un NPC y observa la primera cadena de rumores.',
    section: 'Primeros pasos',
    icon: 'Rocket',
    content: inicioRapido,
  },
  {
    slug: 'conceptos',
    file: '03-Conceptos.md',
    title: 'Conceptos',
    short: 'Eco, canal, nivel, intención, confianza, saltos y scopes.',
    description:
      'El vocabulario del sistema: qué viaja, quién lo cuenta, cuánto se deforma y qué significa cada número.',
    section: 'Primeros pasos',
    icon: 'Lightbulb',
    content: conceptos,
  },
  {
    slug: 'configuracion',
    file: '04-Configuracion.md',
    title: 'Configuración',
    short: 'Todas las tuercas, sus valores por defecto y el efecto esperado.',
    description:
      'Referencia de configuración: saltos, probabilidades, degradación, semillas, anonimización y presets.',
    section: 'Guía',
    icon: 'SlidersHorizontal',
    content: configuracion,
  },
  {
    slug: 'biblioteca',
    file: '05-BibliotecaYTextos.md',
    title: 'Biblioteca y textos',
    short: 'Sujetos, acciones, objetos, plantillas y atribuciones.',
    description:
      'Cómo se construyen las frases desde diccionarios y cómo añadir vocabulario en español e inglés sin romper ids.',
    section: 'Guía',
    icon: 'Library',
    content: biblioteca,
  },
  {
    slug: 'cantidades',
    file: '06-Cantidades.md',
    title: 'Cantidades',
    short: 'La escalera numérica: de 10 a 1000 bandidos, de 500 a 1300 m.',
    description:
      'Escaleras de cantidad, colectivos, instrumentos y cantidades como objeto, con ejemplos y límites.',
    section: 'Guía',
    icon: 'TrendingUp',
    content: cantidades,
  },
  {
    slug: 'emitir',
    file: '07-EmitirEcos.md',
    title: 'Emitir ecos',
    short: 'Triggers, UnityEvents, código y multijugador.',
    description:
      'Las formas de registrar un hecho: componente, evento de Unity, API del runtime y canales por jugador.',
    section: 'Guía',
    icon: 'Megaphone',
    content: emitir,
  },
  {
    slug: 'escuchar',
    file: '08-EscucharYReaccionar.md',
    title: 'Escuchar y reaccionar',
    short: 'Listeners, memoria de NPC, reacciones y sinks propios.',
    description:
      'Cómo consume el juego los rumores: suscripciones, memoria, reacciones, contradicciones y sumideros personalizados.',
    section: 'Guía',
    icon: 'Ear',
    content: escuchar,
  },
  {
    slug: 'npcs',
    file: '09-NPCsYPerfiles.md',
    title: 'NPCs y perfiles',
    short: 'Personalidad, rasgos, sesgos, memoria y participación.',
    description:
      'Perfiles de NPC: qué recuerdan, a quién creen, cómo contagian y cómo se aíslan por scope.',
    section: 'Guía',
    icon: 'Users',
    content: npcs,
  },
  {
    slug: 'modelo',
    file: '10-SemanticaONNX.md',
    title: 'Modelo semántico',
    short: 'Modelo recomendado, exportación FP16, backend y fallback hash.',
    description:
      'Integra el modelo opcional: descarga, exporta a ONNX FP16, asigna el tokenizador y valida GPU/CPU sin bloquear el runtime.',
    section: 'Guía',
    icon: 'BrainCircuit',
    content: modelo,
  },
  {
    slug: 'recetas',
    file: '11-Recetas.md',
    title: 'Recetas',
    short: 'Escenarios completos para copiar, pegar y adaptar.',
    description:
      'Recetas de propaganda, venganza, comercio, reputación, multijugador y cadenas de seis saltos.',
    section: 'Guía',
    icon: 'ChefHat',
    content: recetas,
  },
  {
    slug: 'api',
    file: '12-APIReferencia.md',
    title: 'Referencia de API',
    short: 'Clases, interfaces, componentes y miembros públicos.',
    description:
      'Referencia de la API pública del Core, el runtime de Unity, los componentes y las extensiones.',
    section: 'Referencia',
    icon: 'Code2',
    content: api,
  },
  {
    slug: 'arquitectura',
    file: 'arquitectura-interna.md',
    title: 'Arquitectura interna',
    short: 'Capas, dependencias, flujo de datos y decisiones técnicas.',
    description:
      'Cómo está construido Ecos por dentro: Core sin Unity, runtime, proveedores, canales y puntos de extensión.',
    section: 'Referencia',
    icon: 'Network',
    content: arquitectura,
  },
  {
    slug: 'diseno',
    file: 'diseno-contradicciones.md',
    title: 'Decisiones de diseño',
    short: 'Por qué el rumor se contradice, se anonimiza y nunca alucina.',
    description:
      'Las reglas de diseño detrás de la degradación, la ambivalencia, la confianza y la regla Cero Alucinaciones.',
    section: 'Referencia',
    icon: 'GitBranch',
    content: diseno,
  },
  {
    slug: 'problemas',
    file: '13-Problemas.md',
    title: 'Solución de problemas',
    short: 'Síntomas típicos, causa probable y arreglo.',
    description:
      'Errores de importación, modelo, backend, scopes, textos, serialización y rendimiento.',
    section: 'Referencia',
    icon: 'Wrench',
    content: problemas,
  },
  {
    slug: 'empaquetado',
    file: '14-EmpaquetadoYVenta.md',
    title: 'Empaquetado y venta',
    short: 'Cómo se genera la entrega, la licencia y la ficha de tienda.',
    description:
      'Guía de mantenedor: estructura del paquete UPM, modelo opcional, límites de Asset Store y checklist de publicación.',
    section: 'Proyecto',
    icon: 'Package',
    content: empaquetado,
  },
  {
    slug: 'changelog',
    file: 'changelog.md',
    title: 'Changelog',
    short: 'Cambios de cada versión, con lo añadido y lo verificado.',
    description: 'Historial de versiones de Ecos, desde 1.0.0 hasta la versión actual.',
    section: 'Proyecto',
    icon: 'History',
    content: changelog,
  },
  {
    slug: 'soporte',
    file: 'soporte.md',
    title: 'Soporte',
    short: 'Contacto, tiempo de respuesta y qué incluir en un reporte.',
    description:
      'Cómo pedir ayuda, qué información adjuntar y qué cubre el soporte de Ecos.',
    section: 'Proyecto',
    icon: 'LifeBuoy',
    content: soporte,
  },
  {
    slug: 'licencia-asset',
    file: 'licencia-asset.md',
    title: 'Licencia del asset',
    short: 'Qué permite y qué prohíbe la licencia comercial de Ecos.',
    description:
      'Términos de uso comercial, redistribución, componentes de terceros y garantía.',
    section: 'Proyecto',
    icon: 'Scale',
    content: licenciaAsset,
  },
  {
    slug: 'licencias-terceros',
    file: 'licencias-terceros.md',
    title: 'Terceros y modelo',
    short: 'Apache 2.0, MIT y las dependencias de Unity.',
    description:
      'Licencias del modelo recomendado, el tokenizador y las dependencias de Unity que usa Ecos.',
    section: 'Proyecto',
    icon: 'FileText',
    content: licenciasTerceros,
  },
]

export const sections = ['Primeros pasos', 'Guía', 'Referencia', 'Proyecto']

export const docBySlug = Object.fromEntries(docs.map((doc) => [doc.slug, doc]))

export const slugByFile = {
  'README.md': 'manual',
  '01-Instalacion.md': 'instalacion',
  '02-InicioRapido.md': 'inicio-rapido',
  '03-Conceptos.md': 'conceptos',
  '04-Configuracion.md': 'configuracion',
  '05-BibliotecaYTextos.md': 'biblioteca',
  '06-Cantidades.md': 'cantidades',
  '07-EmitirEcos.md': 'emitir',
  '08-EscucharYReaccionar.md': 'escuchar',
  '09-NPCsYPerfiles.md': 'npcs',
  '10-SemanticaONNX.md': 'modelo',
  '11-Recetas.md': 'recetas',
  '12-APIReferencia.md': 'api',
  '13-Problemas.md': 'problemas',
  '14-EmpaquetadoYVenta.md': 'empaquetado',
  'arquitectura-interna.md': 'arquitectura',
  'ARCHITECTURE.md': 'arquitectura',
  'DESIGN_CONTRADICCIONES.md': 'diseno',
  'diseno-contradicciones.md': 'diseno',
  'changelog.md': 'changelog',
  'soporte.md': 'soporte',
  'licencia-asset.md': 'licencia-asset',
  'licencias-terceros.md': 'licencias-terceros',
}

export function getDoc(slug) {
  return docBySlug[slug] ?? null
}

export function getAdjacent(slug) {
  const index = docs.findIndex((doc) => doc.slug === slug)
  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : null,
  }
}
