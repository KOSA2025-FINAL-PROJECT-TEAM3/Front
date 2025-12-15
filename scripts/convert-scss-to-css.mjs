import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
let sass
try {
  sass = await import('sass')
} catch (error) {
  console.error(
    'This script requires the `sass` package. Install it temporarily (devDependency) to run the conversion.',
  )
  console.error(error)
  process.exit(1)
}

const SRC_DIR = path.resolve('src')

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function findSassTarget(basePath) {
  const candidates = [
    `${basePath}.scss`,
    `${basePath}.sass`,
    `${basePath}.css`,
    path.join(basePath, 'index.scss'),
    path.join(basePath, 'index.sass'),
  ]

  const dir = path.dirname(basePath)
  const name = path.basename(basePath)
  candidates.push(path.join(dir, `_${name}.scss`))
  candidates.push(path.join(dir, `_${name}.sass`))

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate
  }
  return null
}

const stylesAliasImporter = {
  canonicalize(url) {
    if (!url.startsWith('@styles/')) return null
    const rest = url.slice('@styles/'.length)
    const basePath = path.join(SRC_DIR, 'styles', rest)
    return pathToFileURL(basePath)
  },
  async load(canonicalUrl) {
    const basePath = fileURLToPath(canonicalUrl)
    const resolved = await findSassTarget(basePath)
    if (!resolved) return null
    const contents = await fs.readFile(resolved, 'utf8')
    const ext = path.extname(resolved).toLowerCase()
    const syntax = ext === '.sass' ? 'sass' : ext === '.css' ? 'css' : 'scss'
    return { contents, syntax }
  },
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }
    files.push(fullPath)
  }
  return files
}

async function rewriteImportsToCss() {
  const all = await walk(SRC_DIR)
  const targets = all.filter((p) => p.endsWith('.js') || p.endsWith('.jsx'))
  for (const filePath of targets) {
    const before = await fs.readFile(filePath, 'utf8')
    const after = before.replaceAll('.scss', '.css')
    if (after !== before) {
      await fs.writeFile(filePath, after, 'utf8')
    }
  }
}

async function convertAllScss() {
  const all = await walk(SRC_DIR)
  const scssFiles = all.filter((p) => p.endsWith('.scss'))

  for (const filePath of scssFiles) {
    const isModule = filePath.endsWith('.module.scss')
    const outPath = isModule
      ? filePath.replace(/\.module\.scss$/i, '.module.css')
      : filePath.replace(/\.scss$/i, '.css')

    const result = await sass.compileAsync(filePath, {
      style: 'expanded',
      sourceMap: false,
      importers: [stylesAliasImporter],
    })

    await fs.writeFile(outPath, result.css, 'utf8')
    await fs.unlink(filePath)
  }
}

await rewriteImportsToCss()
await convertAllScss()

console.log('✅ Converted .scss → .css and updated JS/JSX imports')
