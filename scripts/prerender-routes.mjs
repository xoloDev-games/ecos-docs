import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const indexPath = path.join(dist, 'index.html')
const docsSourcePath = path.join(root, 'src', 'docs.js')

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html no existe; ejecuta "vite build" primero')
}

const indexHtml = fs.readFileSync(indexPath, 'utf8')
const docsSource = fs.readFileSync(docsSourcePath, 'utf8')
const slugs = [...docsSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])

const uniqueSlugs = [...new Set(slugs)]
for (const slug of uniqueSlugs) {
  const routeDirectory = path.join(dist, 'docs', slug)
  fs.mkdirSync(routeDirectory, { recursive: true })
  fs.writeFileSync(path.join(routeDirectory, 'index.html'), indexHtml)
  fs.writeFileSync(path.join(dist, 'docs', `${slug}.html`), indexHtml)
}

console.log(`Rutas estáticas generadas: ${uniqueSlugs.length}`)
