import { useEffect, useMemo, useState } from 'react'
import GithubSlugger from 'github-slugger'

function cleanHeading(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

export function extractHeadings(content) {
  const slugger = new GithubSlugger()
  const headings = []
  let inFence = false

  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (!match) continue

    const text = cleanHeading(match[2])
    headings.push({
      level: match[1].length,
      text,
      id: slugger.slug(text),
    })
  }

  return headings
}

export default function Toc({ content }) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')

  useEffect(() => {
    setActiveId(headings[0]?.id ?? '')
  }, [headings])

  useEffect(() => {
    if (!headings.length) return undefined

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean)

    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <nav className="docs-toc" aria-label="En esta página">
      <span className="docs-toc__title">En esta página</span>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`docs-toc__link docs-toc__link--h${heading.level}${activeId === heading.id ? ' is-active' : ''}`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  )
}
