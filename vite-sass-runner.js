#!/usr/bin/env node
/**
 * Wraps Vite CLI so we can set SASS_SILENCE_DEPRECATIONS in a cross-platform way.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.env.SASS_SILENCE_DEPRECATIONS = 'legacy-js-api'

const viteBin = resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')
const [, , ...argv] = process.argv

const child = spawn(process.execPath, [viteBin, ...argv], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
