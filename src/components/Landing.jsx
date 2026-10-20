import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  Check,
  Cpu,
  GitFork,
  Layers,
  LockKeyhole,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { UNITY_MIN, VERSION } from '../docs.js'

const chain = [
  {
    version: 'v0',
    level: 'Literal',
    text: 'eliminó a un grupo de 10 bandidos, con su espada',
    confidence: 100,
    tone: 'clean',
  },
  {
    version: 'v1',
    level: 'Suavizado',
    text: 'eliminó a una banda de ~30 bandidos, con su espada',
    confidence: 96,
    tone: 'clean',
  },
  {
    version: 'v2',
    level: 'Adornado',
    text: 'eliminó a una hueste de ~90 bandidos, sin ayuda de nadie',
    confidence: 88,
    tone: 'warm',
  },
  {
    version: 'v3',
    level: 'Exagerado',
    text: 'eliminó a un ejército de ~350 bandidos, con las manos desnudas',
    confidence: 62,
    tone: 'warm',
  },
  {
    version: 'v4',
    level: 'Distorsionado',
    text: 'eliminó a un pelotón de ~1.100 bandidos, con las manos desnudas',
    confidence: 39,
    tone: 'hot',
  },
  {
    version: 'v5',
    level: 'Rumor',
    text: 'eliminó a una horda de ~1.200 bandidos, sin ningún arma',
    confidence: 21,
    tone: 'hot',
  },
]

const features = [
  {
    icon: ShieldCheck,
    title: 'Cero alucinaciones',
    text: 'El compositor sólo une fragmentos que tú escribiste. El modelo clasifica; nunca redacta.',
  },
  {
    icon: Waves,
    title: 'Cadenas de 6 saltos',
    text: 'Una boca nueva por salto, versiones por oyente y un rastro visible de v0 a v5.',
  },
  {
    icon: Layers,
    title: 'Cantidades automáticas',
    text: 'De 10 a ~1.100 bandidos, de 500 a 2.000 metros. Declaras la cifra real; la curva hace el resto.',
  },
  {
    icon: Users,
    title: 'Memoria y contradicciones',
    text: 'Cada NPC recuerda, compara y puede creer dos cosas incompatibles a la vez.',
  },
  {
    icon: GitFork,
    title: 'Aislamiento por scopes',
    text: 'Jugadores, facciones, lugares y grupos. Puentes explícitos que anonimizan la fuente.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Bilingüe ES/EN',
    text: 'Dos bibliotecas de texto con los mismos ids y un modelo multilingüe opcional.',
  },
  {
    icon: Cpu,
    title: 'Edge AI, sin servidor',
    text: 'Todo corre en local. GPU opcional y fallback hash determinista si no hay modelo.',
  },
  {
    icon: Boxes,
    title: 'Core headless',
    text: 'El dominio no referencia Unity y se valida con dotnet test en cualquier máquina.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Ocurre un hecho',
    text: 'Un trigger, un UnityEvent o una llamada a la API registra la acción, el objeto y una cantidad.',
  },
  {
    number: '02',
    title: 'El mundo lo cuenta',
    text: 'Cada salto elige una boca, aplica su sesgo y sube el nivel de exageración.',
  },
  {
    number: '03',
    title: 'Los NPC deciden',
    text: 'Memoria, reputación y contradicciones convierten el rumor en una reacción concreta.',
  },
]

const chapters = [
  ['instalacion', 'Instalación', 'Requisitos, UPM y primera escena.'],
  ['inicio-rapido', 'Inicio rápido', 'Una cadena funcionando en 10 minutos.'],
  ['configuracion', 'Configuración', 'Todas las tuercas y sus valores.'],
  ['modelo', 'Modelo semántico', 'Descarga, FP16 y fallback hash.'],
  ['recetas', 'Recetas', 'Escenarios completos para copiar.'],
  ['api', 'Referencia de API', 'Clases, componentes y miembros.'],
]

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero__ambient hero__ambient--one" />
        <div className="hero__ambient hero__ambient--two" />

        <div className="hero__inner">
          <div className="hero__content">
            <span className="eyebrow">
              <Sparkles size={15} />
              Unity {UNITY_MIN} · v{VERSION}
            </span>

            <h1>
              El mismo hecho.
              <br />
              <em>Seis versiones.</em>
            </h1>

            <p className="hero__lead">
              Ecos convierte los eventos de tu mundo en rumores que viajan de boca en boca,
              se deforman y cambian lo que cada NPC cree. Sin texto generado por IA, sin
              servidor y sin hechos inventados.
            </p>

            <div className="hero__actions">
              <Link className="button button--primary" to="/docs/instalacion">
                Empezar ahora
                <ArrowRight size={18} />
              </Link>
              <Link className="button button--ghost" to="/docs/manual">
                <BookOpen size={18} />
                Leer el manual
              </Link>
            </div>

            <div className="hero__stats" aria-label="Resumen del sistema">
              <div>
                <strong>6</strong>
                <span>saltos visibles</span>
              </div>
              <div>
                <strong>5</strong>
                <span>niveles de degradación</span>
              </div>
              <div>
                <strong>0</strong>
                <span>hechos inventados</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>local</span>
              </div>
            </div>

            <p className="hero__note">
              <LockKeyhole size={14} />
              El modelo de IA es opcional y no está incluido. Sin él, el fallback hash sigue
              funcionando.
            </p>
          </div>

          <div className="chain-panel" aria-label="Ejemplo de cadena de rumores">
            <div className="chain-panel__header">
              <span>
                <Zap size={15} />
                Cadena de ejemplo
              </span>
              <span className="chain-panel__badge">6 bocas</span>
            </div>

            <div className="chain-list">
              {chain.map((item, index) => (
                <article className={`chain-card chain-card--${item.tone}`} key={item.version}>
                  <div className="chain-card__top">
                    <span className="chain-card__version">{item.version}</span>
                    <span className="chain-card__level">{item.level}</span>
                    <span className="chain-card__confidence">{item.confidence}%</span>
                  </div>
                  <p>{item.text}</p>
                  <div className="confidence-track" aria-hidden="true">
                    <span style={{ width: `${item.confidence}%` }} />
                  </div>
                  {index < chain.length - 1 && <span className="chain-card__link" aria-hidden="true" />}
                </article>
              ))}
            </div>

            <p className="chain-panel__foot">
              El verbo y el paciente no cambian. La magnitud, el adorno, la confianza y el
              anonimato sí.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--features">
        <div className="section__heading">
          <span className="section__kicker">Qué resuelve</span>
          <h2>Rumores con memoria, no texto improvisado</h2>
          <p>
            Un sistema de propagación determinista que puedes depurar, testear y explicar.
            Cada palabra sale de un diccionario que controlas.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <span className="feature-card__icon">
                <Icon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--split">
        <div className="section__heading section__heading--left">
          <span className="section__kicker">Cómo funciona</span>
          <h2>Tres pasos, un grafo de rumores</h2>
          <p>
            Ecos separa el hecho de su relato. El hecho es inmutable; el relato es lo que
            viaja, se ensucia y se cree.
          </p>
          <Link className="text-link" to="/docs/conceptos">
            Ver los conceptos
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="step-list">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-card__number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--model">
        <div className="model-panel">
          <div className="model-panel__copy">
            <span className="section__kicker">Modelo opcional</span>
            <h2>Semántica cuando la quieres. Fallback cuando no.</h2>
            <p>
              El modelo recomendado no viaja dentro del paquete. Descárgalo, expórtalo a ONNX
              FP16 y asígnalo al bootstrap. Si no lo haces, Ecos usa similitud léxica
              determinista y el resto del sistema sigue igual.
            </p>

            <ul className="check-list">
              <li>
                <Check size={16} />
                Modelo recomendado: <code>paraphrase-multilingual-MiniLM-L12-v2</code>
              </li>
              <li>
                <Check size={16} />
                Licencia Apache 2.0, con atribución
              </li>
              <li>
                <Check size={16} />
                GPUCompute por defecto, CPU como fallback
              </li>
              <li>
                <Check size={16} />
                Exportación FP16 documentada paso a paso
              </li>
            </ul>

            <Link className="button button--secondary" to="/docs/modelo">
              Guía del modelo
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="model-panel__code">
            <div className="code-window__bar">
              <span />
              <span />
              <span />
              <small>C# · sin modelo</small>
            </div>
            <pre>
              <code>{`var runtime = new EcosRuntimeBuilder()
    .ConBiblioteca(EcosBibliotecaFragmentos.CrearPorDefecto())
    .ConReloj(new EcosRelojManual())
    .Construir();

runtime.RegistrarNpc(new EcosPerfilNpc
{
    Id = "Herrero",
    Nombre = "el herrero",
    Scope = EcosScope.Jugador("A")
});

runtime.RegistrarEvento("A", "quemar", "aldea", 80);
runtime.Tick(1.0);`}</code>
            </pre>
            <div className="model-panel__foot">
              <BrainCircuit size={16} />
              El proveedor hash no necesita ONNX ni Inference Engine.
            </div>
          </div>
        </div>
      </section>

      <section className="section section--requirements">
        <div className="requirements-panel">
          <div>
            <span className="section__kicker">Requisitos</span>
            <h2>Unity 6.3 LTS o superior</h2>
            <p>
              Validado en <code>6000.3.19f1</code>. El runtime no depende del Input System;
              sólo la demo lo usa.
            </p>
          </div>
          <div className="requirements-grid">
            <div>
              <strong>Unity</strong>
              <span>{UNITY_MIN}</span>
            </div>
            <div>
              <strong>Inference Engine</strong>
              <span>com.unity.ai.inference 2.6.1</span>
            </div>
            <div>
              <strong>Input System</strong>
              <span>1.19.0 (sólo demo)</span>
            </div>
            <div>
              <strong>Modelo</strong>
              <span>Opcional, no incluido</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--chapters">
        <div className="section__heading">
          <span className="section__kicker">Documentación</span>
          <h2>De la primera escena a la API completa</h2>
          <p>
            Veintiuna páginas, catorce capítulos, recetas y referencia. En español e inglés,
            con ejemplos que puedes copiar.
          </p>
        </div>

        <div className="chapter-grid">
          {chapters.map(([slug, title, text]) => (
            <Link className="chapter-card" to={`/docs/${slug}`} key={slug}>
              <span>{title}</span>
              <p>{text}</p>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>

        <div className="section__cta">
          <Link className="button button--primary" to="/docs/manual">
            Abrir el manual completo
            <ArrowRight size={18} />
          </Link>
          <Link className="button button--ghost" to="/docs/changelog">
            Ver el changelog
          </Link>
        </div>
      </section>
    </>
  )
}
