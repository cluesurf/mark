import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Build every Mark font: run each `base/<font>/code/make-font.ts` in
 * turn, or only the fonts named.
 *
 *   pnpm make:fonts
 *   pnpm make:fonts rongorongo gupta
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BASE = path.join(HERE, '..', 'base')
const TSX = path.join(HERE, '..', 'node_modules', '.bin', 'tsx')

const named = process.argv.slice(2)
const fonts = fs
  .readdirSync(BASE)
  .filter(font =>
    fs.existsSync(path.join(BASE, font, 'code', 'make-font.ts')),
  )
  .filter(font => !named.length || named.includes(font))
  .sort()

for (const font of fonts) {
  console.log(`\n== ${font}`)

  const run = spawnSync(
    TSX,
    [path.join(BASE, font, 'code', 'make-font.ts')],
    { stdio: 'inherit' },
  )

  if (run.status !== 0) {
    console.error(`${font} failed`)
    process.exit(1)
  }
}
