import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy } from 'lucide-react'
import { slugByFile } from '../docs.js'

const base = import.meta.env.BASE_URL

function transformOutsideCode(text, transform) {
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, index) => (index % 2 === 1 ? part : transform(part))).join('')
}

function prepareMarkdown(content) {
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/^#\s+[^\n]*\n+/, '')

  return transformOutsideCode(normalized, (text) => {
    let next = text.replace(/!\[([^\]]*)\]\((?!https?:|data:|\/)([^)]+)\)/g, (_, alt, src) => {
      return `![${alt}](${base}images/${src})`
    })

    next = next.replace(/\[([^\]]+)\]\(([^)]+?\.md)(#[^)]+)?\)/g, (match, label, file, hash = '') => {
      const cleanFile = file.replace(/^\.\.\//, '').replace(/^\.\//, '')
      const slug = slugByFile[cleanFile]
      if (!slug) return match
      return `[${label}](/docs/${slug}${hash})`
    })

    return next
  })
}

function CodeBlock({ children, node, ...props }) {
  const preRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = preRef.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block">
      <button className="code-block__copy" type="button" onClick={copy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  )
}

function MarkdownLink({ href = '', children, node, ...props }) {
  if (href.startsWith('/docs/')) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

export default function Markdown({ content }) {
  const prepared = useMemo(() => prepareMarkdown(content), [content])

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'append', properties: { className: 'heading-anchor', ariaLabel: 'Enlace a esta sección' } }],
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
        components={{
          a: MarkdownLink,
          pre: CodeBlock,
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
          img: ({ alt, node, ...props }) => <img alt={alt ?? ''} loading="lazy" {...props} />,
          input: ({ node, ...props }) => <input {...props} disabled={props.type === 'checkbox'} />,
        }}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  )
}
