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

import manualEn from './content/docs/en/README.md?raw'
import instalacionEn from './content/docs/en/01-Instalacion.md?raw'
import inicioRapidoEn from './content/docs/en/02-InicioRapido.md?raw'
import conceptosEn from './content/docs/en/03-Conceptos.md?raw'
import configuracionEn from './content/docs/en/04-Configuracion.md?raw'
import bibliotecaEn from './content/docs/en/05-BibliotecaYTextos.md?raw'
import cantidadesEn from './content/docs/en/06-Cantidades.md?raw'
import emitirEn from './content/docs/en/07-EmitirEcos.md?raw'
import escucharEn from './content/docs/en/08-EscucharYReaccionar.md?raw'
import npcsEn from './content/docs/en/09-NPCsYPerfiles.md?raw'
import modeloEn from './content/docs/en/10-SemanticaONNX.md?raw'
import recetasEn from './content/docs/en/11-Recetas.md?raw'
import apiEn from './content/docs/en/12-APIReferencia.md?raw'
import problemasEn from './content/docs/en/13-Problemas.md?raw'
import empaquetadoEn from './content/docs/en/14-EmpaquetadoYVenta.md?raw'
import arquitecturaEn from './content/docs/en/arquitectura-interna.md?raw'
import disenoEn from './content/docs/en/diseno-contradicciones.md?raw'
import changelogEn from './content/docs/en/changelog.md?raw'
import soporteEn from './content/docs/en/soporte.md?raw'
import licenciaAssetEn from './content/docs/en/licencia-asset.md?raw'
import licenciasTercerosEn from './content/docs/en/licencias-terceros.md?raw'

export const VERSION = '1.2.0'
export const UNITY_MIN = '6.3 LTS (6000.3)'

const entries = [
  {
    slug: 'manual',
    file: 'README.md',
    icon: 'BookOpen',
    sectionEs: 'Primeros pasos',
    sectionEn: 'Getting started',
    titleEs: 'Manual completo',
    titleEn: 'Complete manual',
    shortEs: 'Mapa de los 14 capítulos, los diagramas y el modelo mental de Ecos.',
    shortEn: 'Map of the 14 chapters, the diagrams and the Ecos mental model.',
    descriptionEs:
      'Punto de entrada a la documentación: qué es Ecos, qué no es, cómo se organiza el manual y por dónde empezar.',
    descriptionEn:
      'Entry point to the documentation: what Ecos is, what it is not, how the manual is organized and where to start.',
    contentEs: manual,
    contentEn: manualEn,
  },
  {
    slug: 'instalacion',
    file: '01-Instalacion.md',
    icon: 'Download',
    sectionEs: 'Primeros pasos',
    sectionEn: 'Getting started',
    titleEs: 'Instalación',
    titleEn: 'Installation',
    shortEs: 'Requisitos, paquete UPM, dependencias y primera puesta en marcha.',
    shortEn: 'Requirements, UPM package, dependencies and first setup.',
    descriptionEs:
      'Instala Ecos en Unity 6.3 LTS, importa el sample y comprueba que el Editor, el runtime y el modelo opcional están listos.',
    descriptionEn:
      'Install Ecos in Unity 6.3 LTS, import the sample and verify the Editor, runtime and optional model are ready.',
    contentEs: instalacion,
    contentEn: instalacionEn,
  },
  {
    slug: 'inicio-rapido',
    file: '02-InicioRapido.md',
    icon: 'Rocket',
    sectionEs: 'Primeros pasos',
    sectionEn: 'Getting started',
    titleEs: 'Inicio rápido',
    titleEn: 'Quick start',
    shortEs: 'Una escena jugable en diez minutos, sin leer todo el manual.',
    shortEn: 'A playable scene in ten minutes, without reading the whole manual.',
    descriptionEs:
      'Crea los assets, configura un trigger, añade memoria a un NPC y observa la primera cadena de rumores.',
    descriptionEn:
      'Create the assets, configure a trigger, add memory to an NPC and watch the first rumor chain.',
    contentEs: inicioRapido,
    contentEn: inicioRapidoEn,
  },
  {
    slug: 'conceptos',
    file: '03-Conceptos.md',
    icon: 'Lightbulb',
    sectionEs: 'Primeros pasos',
    sectionEn: 'Getting started',
    titleEs: 'Conceptos',
    titleEn: 'Concepts',
    shortEs: 'Eco, canal, nivel, intención, confianza, saltos y scopes.',
    shortEn: 'Echo, channel, level, intention, confidence, hops and scopes.',
    descriptionEs:
      'El vocabulario del sistema: qué viaja, quién lo cuenta, cuánto se deforma y qué significa cada número.',
    descriptionEn:
      'The system vocabulary: what travels, who tells it, how much it deforms and what each number means.',
    contentEs: conceptos,
    contentEn: conceptosEn,
  },
  {
    slug: 'configuracion',
    file: '04-Configuracion.md',
    icon: 'SlidersHorizontal',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Configuración',
    titleEn: 'Configuration',
    shortEs: 'Todas las tuercas, sus valores por defecto y el efecto esperado.',
    shortEn: 'Every setting, its defaults and expected effect.',
    descriptionEs:
      'Referencia de configuración: saltos, probabilidades, degradación, semillas, anonimización y presets.',
    descriptionEn:
      'Configuration reference: hops, probabilities, degradation, seeds, anonymization and presets.',
    contentEs: configuracion,
    contentEn: configuracionEn,
  },
  {
    slug: 'biblioteca',
    file: '05-BibliotecaYTextos.md',
    icon: 'Library',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Biblioteca y textos',
    titleEn: 'Library and texts',
    shortEs: 'Sujetos, acciones, objetos, plantillas y atribuciones.',
    shortEn: 'Subjects, actions, objects, templates and attributions.',
    descriptionEs:
      'Cómo se construyen las frases desde diccionarios y cómo añadir vocabulario en español e inglés sin romper ids.',
    descriptionEn:
      'How sentences are built from dictionaries and how to add Spanish and English vocabulary without breaking ids.',
    contentEs: biblioteca,
    contentEn: bibliotecaEn,
  },
  {
    slug: 'cantidades',
    file: '06-Cantidades.md',
    icon: 'TrendingUp',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Cantidades',
    titleEn: 'Quantities',
    shortEs: 'La curva automática: de 10 a ~1.100 bandidos, de 500 a 2.000 m.',
    shortEn: 'The automatic curve: from 10 to ~1,100 bandits, from 500 to 2,000 m.',
    descriptionEs:
      'Escalado automático de cantidades, colectivos, instrumentos y cantidades como objeto, con ejemplos y límites.',
    descriptionEn:
      'Automatic quantity scaling, collectives, instruments and quantity-as-object, with examples and limits.',
    contentEs: cantidades,
    contentEn: cantidadesEn,
  },
  {
    slug: 'emitir',
    file: '07-EmitirEcos.md',
    icon: 'Megaphone',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Emitir ecos',
    titleEn: 'Emitting echoes',
    shortEs: 'Triggers, UnityEvents, código y multijugador.',
    shortEn: 'Triggers, UnityEvents, code and multiplayer.',
    descriptionEs:
      'Las formas de registrar un hecho: componente, evento de Unity, API del runtime y canales por jugador.',
    descriptionEn:
      'Ways to register a fact: component, Unity event, runtime API and per-player channels.',
    contentEs: emitir,
    contentEn: emitirEn,
  },
  {
    slug: 'escuchar',
    file: '08-EscucharYReaccionar.md',
    icon: 'Ear',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Escuchar y reaccionar',
    titleEn: 'Listening and reacting',
    shortEs: 'Listeners, memoria de NPC, reacciones y sinks propios.',
    shortEn: 'Listeners, NPC memory, reactions and custom sinks.',
    descriptionEs:
      'Cómo consume el juego los rumores: suscripciones, memoria, reacciones, contradicciones y sumideros personalizados.',
    descriptionEn:
      'How the game consumes rumors: subscriptions, memory, reactions, contradictions and custom sinks.',
    contentEs: escuchar,
    contentEn: escucharEn,
  },
  {
    slug: 'npcs',
    file: '09-NPCsYPerfiles.md',
    icon: 'Users',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'NPCs y perfiles',
    titleEn: 'NPCs and profiles',
    shortEs: 'Personalidad, rasgos, sesgos, memoria y participación.',
    shortEn: 'Personality, traits, biases, memory and participation.',
    descriptionEs:
      'Perfiles de NPC: qué recuerdan, a quién creen, cómo contagian y cómo se aíslan por scope.',
    descriptionEn:
      'NPC profiles: what they remember, whom they believe, how they spread and how they isolate by scope.',
    contentEs: npcs,
    contentEn: npcsEn,
  },
  {
    slug: 'modelo',
    file: '10-SemanticaONNX.md',
    icon: 'BrainCircuit',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Modelo semántico',
    titleEn: 'Semantic model',
    shortEs: 'Modelo recomendado, exportación FP16, backend y fallback hash.',
    shortEn: 'Recommended model, FP16 export, backend and hash fallback.',
    descriptionEs:
      'Integra el modelo opcional: descarga, exporta a ONNX FP16, asigna el tokenizador y valida GPU/CPU sin bloquear el runtime.',
    descriptionEn:
      'Integrate the optional model: download, export to ONNX FP16, assign the tokenizer and validate GPU/CPU without blocking the runtime.',
    contentEs: modelo,
    contentEn: modeloEn,
  },
  {
    slug: 'recetas',
    file: '11-Recetas.md',
    icon: 'ChefHat',
    sectionEs: 'Guía',
    sectionEn: 'Guide',
    titleEs: 'Recetas',
    titleEn: 'Recipes',
    shortEs: 'Escenarios completos para copiar, pegar y adaptar.',
    shortEn: 'Complete scenarios to copy, paste and adapt.',
    descriptionEs:
      'Recetas de propaganda, venganza, comercio, reputación, multijugador y cadenas de seis saltos.',
    descriptionEn:
      'Recipes for propaganda, revenge, trade, reputation, multiplayer and six-hop chains.',
    contentEs: recetas,
    contentEn: recetasEn,
  },
  {
    slug: 'api',
    file: '12-APIReferencia.md',
    icon: 'Code2',
    sectionEs: 'Referencia',
    sectionEn: 'Reference',
    titleEs: 'Referencia de API',
    titleEn: 'API reference',
    shortEs: 'Clases, interfaces, componentes y miembros públicos.',
    shortEn: 'Classes, interfaces, components and public members.',
    descriptionEs:
      'Referencia de la API pública del Core, el runtime de Unity, los componentes y las extensiones.',
    descriptionEn:
      'Public API reference for the Core, Unity runtime, components and extensions.',
    contentEs: api,
    contentEn: apiEn,
  },
  {
    slug: 'arquitectura',
    file: 'arquitectura-interna.md',
    icon: 'Network',
    sectionEs: 'Referencia',
    sectionEn: 'Reference',
    titleEs: 'Arquitectura interna',
    titleEn: 'Internal architecture',
    shortEs: 'Capas, dependencias, flujo de datos y decisiones técnicas.',
    shortEn: 'Layers, dependencies, data flow and technical decisions.',
    descriptionEs:
      'Cómo está construido Ecos por dentro: Core sin Unity, runtime, proveedores, canales y puntos de extensión.',
    descriptionEn:
      'How Ecos is built inside: Unity-free Core, runtime, providers, channels and extension points.',
    contentEs: arquitectura,
    contentEn: arquitecturaEn,
  },
  {
    slug: 'diseno',
    file: 'diseno-contradicciones.md',
    icon: 'GitBranch',
    sectionEs: 'Referencia',
    sectionEn: 'Reference',
    titleEs: 'Decisiones de diseño',
    titleEn: 'Design decisions',
    shortEs: 'Por qué el rumor se contradice, se anonimiza y nunca alucina.',
    shortEn: 'Why rumors contradict, anonymize and never hallucinate.',
    descriptionEs:
      'Las reglas de diseño detrás de la degradación, la ambivalencia, la confianza y la regla Cero Alucinaciones.',
    descriptionEn:
      'Design rules behind degradation, ambivalence, confidence and the Zero Hallucinations rule.',
    contentEs: diseno,
    contentEn: disenoEn,
  },
  {
    slug: 'problemas',
    file: '13-Problemas.md',
    icon: 'Wrench',
    sectionEs: 'Referencia',
    sectionEn: 'Reference',
    titleEs: 'Solución de problemas',
    titleEn: 'Troubleshooting',
    shortEs: 'Síntomas típicos, causa probable y arreglo.',
    shortEn: 'Typical symptoms, likely cause and fix.',
    descriptionEs:
      'Errores de importación, modelo, backend, scopes, textos, serialización y rendimiento.',
    descriptionEn:
      'Import, model, backend, scope, text, serialization and performance issues.',
    contentEs: problemas,
    contentEn: problemasEn,
  },
  {
    slug: 'empaquetado',
    file: '14-EmpaquetadoYVenta.md',
    icon: 'Package',
    sectionEs: 'Proyecto',
    sectionEn: 'Project',
    titleEs: 'Empaquetado y venta',
    titleEn: 'Packaging and sales',
    shortEs: 'Cómo se genera la entrega, la licencia y la ficha de tienda.',
    shortEn: 'How the release, license and store listing are built.',
    descriptionEs:
      'Guía de mantenedor: estructura del paquete UPM, modelo opcional, límites de Asset Store y checklist de publicación.',
    descriptionEn:
      'Maintainer guide: UPM package structure, optional model, Asset Store limits and publishing checklist.',
    contentEs: empaquetado,
    contentEn: empaquetadoEn,
  },
  {
    slug: 'changelog',
    file: 'changelog.md',
    icon: 'History',
    sectionEs: 'Proyecto',
    sectionEn: 'Project',
    titleEs: 'Changelog',
    titleEn: 'Changelog',
    shortEs: 'Cambios de cada versión, con lo añadido y lo verificado.',
    shortEn: 'Changes in each version, with additions and verification.',
    descriptionEs: 'Historial de versiones de Ecos, desde 1.0.0 hasta la versión actual.',
    descriptionEn: 'Ecos version history, from 1.0.0 to the current version.',
    contentEs: changelog,
    contentEn: changelogEn,
  },
  {
    slug: 'soporte',
    file: 'soporte.md',
    icon: 'LifeBuoy',
    sectionEs: 'Proyecto',
    sectionEn: 'Project',
    titleEs: 'Soporte',
    titleEn: 'Support',
    shortEs: 'Contacto, tiempo de respuesta y qué incluir en un reporte.',
    shortEn: 'Contact, response time and what to include in a report.',
    descriptionEs:
      'Cómo pedir ayuda, qué información adjuntar y qué cubre el soporte de Ecos.',
    descriptionEn:
      'How to ask for help, what information to attach and what Ecos support covers.',
    contentEs: soporte,
    contentEn: soporteEn,
  },
  {
    slug: 'licencia-asset',
    file: 'licencia-asset.md',
    icon: 'Scale',
    sectionEs: 'Proyecto',
    sectionEn: 'Project',
    titleEs: 'Licencia del asset',
    titleEn: 'Asset license',
    shortEs: 'Qué permite y qué prohíbe la licencia comercial de Ecos.',
    shortEn: 'What the Ecos commercial license allows and forbids.',
    descriptionEs:
      'Términos de uso comercial, redistribución, componentes de terceros y garantía.',
    descriptionEn:
      'Commercial use, redistribution, third-party components and warranty.',
    contentEs: licenciaAsset,
    contentEn: licenciaAssetEn,
  },
  {
    slug: 'licencias-terceros',
    file: 'licencias-terceros.md',
    icon: 'FileText',
    sectionEs: 'Proyecto',
    sectionEn: 'Project',
    titleEs: 'Terceros y modelo',
    titleEn: 'Third parties and model',
    shortEs: 'Apache 2.0, MIT y las dependencias de Unity.',
    shortEn: 'Apache 2.0, MIT and the Unity dependencies.',
    descriptionEs:
      'Licencias del modelo recomendado, el tokenizador y las dependencias de Unity que usa Ecos.',
    descriptionEn:
      'Licenses of the recommended model, tokenizer and Unity dependencies used by Ecos.',
    contentEs: licenciasTerceros,
    contentEn: licenciasTercerosEn,
  },
]

function makeDoc(entry, lang) {
  const en = lang === 'en'
  return {
    slug: entry.slug,
    file: entry.file,
    title: en ? entry.titleEn : entry.titleEs,
    short: en ? entry.shortEn : entry.shortEs,
    description: en ? entry.descriptionEn : entry.descriptionEs,
    section: en ? entry.sectionEn : entry.sectionEs,
    icon: entry.icon,
    content: en ? entry.contentEn : entry.contentEs,
  }
}

export const docs = entries.map((entry) => makeDoc(entry, 'es'))
export const docsEn = entries.map((entry) => makeDoc(entry, 'en'))

export const sections = ['Primeros pasos', 'Guía', 'Referencia', 'Proyecto']
export const sectionsEn = ['Getting started', 'Guide', 'Reference', 'Project']

export const docBySlug = Object.fromEntries(docs.map((doc) => [doc.slug, doc]))
export const docBySlugEn = Object.fromEntries(docsEn.map((doc) => [doc.slug, doc]))

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

export const slugByFileEn = slugByFile

export function getDocs(lang = 'es') {
  return lang === 'en' ? docsEn : docs
}

export function getSections(lang = 'es') {
  return lang === 'en' ? sectionsEn : sections
}

export function getDoc(slug, lang = 'es') {
  const source = lang === 'en' ? docBySlugEn : docBySlug
  return source[slug] ?? null
}

export function getAdjacent(slug, lang = 'es') {
  const list = getDocs(lang)
  const index = list.findIndex((doc) => doc.slug === slug)
  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  }
}

export function getSlugByFile(file, lang = 'es') {
  const map = lang === 'en' ? slugByFileEn : slugByFile
  return map[file] ?? null
}
