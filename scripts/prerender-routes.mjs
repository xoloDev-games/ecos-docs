import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const indexPath = path.join(dist, 'index.html')
const docsSourcePath = path.join(root, 'src', 'docs.js')

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html does not exist; run "vite build" first')
}

const indexHtml = fs.readFileSync(indexPath, 'utf8')
const docsSource = fs.readFileSync(docsSourcePath, 'utf8')
const slugs = [...docsSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])

const uniqueSlugs = [...new Set(slugs)]

function writeRoute(routeDirectory, fileName = 'index.html') {
  fs.mkdirSync(routeDirectory, { recursive: true })
  fs.writeFileSync(path.join(routeDirectory, fileName), indexHtml)
}

for (const slug of uniqueSlugs) {
  writeRoute(path.join(dist, 'docs', slug))
  writeRoute(path.join(dist, 'docs'), `${slug}.html`)

  writeRoute(path.join(dist, 'en', 'docs', slug))
  writeRoute(path.join(dist, 'en', 'docs'), `${slug}.html`)
}

// The language root and the docs index are also useful for clean static navigation.
writeRoute(path.join(dist, 'en'))
writeRoute(path.join(dist, 'en', 'docs'))

console.log(`Static routes generated: ${uniqueSlugs.length * 4 + 2}`)
