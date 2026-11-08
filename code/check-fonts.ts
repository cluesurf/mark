import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import opentype from 'opentype.js'
import {
  PLANE_15_END,
  PLANE_15_START,
  formatCodePoint,
  readFontCodePoints,
  readManifest,
} from './code-point'

/**
 * Prove every Mark font file matches `code-points.json`: read each
 * font's cmap back from the bytes and check that
 *
 *   - every mapped code point but U+0000 (.notdef) is in plane 15
 *   - every mapped code point is one the manifest gives this font
 *   - `mapping.json` lists exactly what the cmap holds
 *   - no two fonts share a code point, and the manifest has no
 *     duplicate
 *
 * A manifest sign with no glyph is reported (a drawing with no path,
 * skipped by the build), not failed.
 *
 *   pnpm check:fonts
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BASE = path.join(HERE, '..', 'base')

function cmapOf(file: string): Map<number, number> {
  const bytes = fs.readFileSync(file)
  const font = opentype.parse(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ),
  )
  const map = font.tables.cmap.glyphIndexMap as Record<string, number>

  return new Map(
    Object.entries(map).map(([point, glyph]): [number, number] => [
      Number(point),
      glyph,
    ]),
  )
}

const failures: Array<string> = []
const manifest = readManifest()
const values = Object.values(manifest)

if (new Set(values).size !== values.length) {
  failures.push('code-points.json gives one code point twice')
}

const owner = new Map<number, string>()

for (const font of fs.readdirSync(BASE).sort()) {
  const dir = path.join(BASE, font, 'base')

  if (!fs.existsSync(dir)) {
    continue
  }

  const points = readFontCodePoints(font)
  const allowed = new Set(points.values())
  const files = fs
    .readdirSync(dir)
    .filter(file => /\.(otf|ttf)$/.test(file))
    .sort()

  if (!files.length) {
    failures.push(`${font}: no font file`)
  }

  let range = ''

  for (const file of files) {
    const cmap = cmapOf(path.join(dir, file))
    const mapped = [...cmap.keys()].filter(point => point !== 0)
    const outside = mapped.filter(
      point => point < PLANE_15_START || point > PLANE_15_END,
    )
    const foreign = mapped.filter(point => !allowed.has(point))
    const empty = [...allowed].filter(point => !cmap.has(point))

    for (const point of mapped) {
      const held = owner.get(point)

      if (held && held !== font) {
        failures.push(`${font}: ${formatCodePoint(point)} is also in ${held}`)
      }

      owner.set(point, font)
    }

    if (outside.length) {
      failures.push(
        `${font}/${file}: ${outside.length} glyphs outside plane 15, first ${formatCodePoint(outside[0]!)}`,
      )
    }

    if (foreign.length) {
      failures.push(
        `${font}/${file}: ${foreign.length} code points not in the manifest, first ${formatCodePoint(foreign[0]!)}`,
      )
    }

    const low = Math.min(...mapped)
    const high = Math.max(...mapped)
    range = `${formatCodePoint(low)} to ${formatCodePoint(high)}`

    console.log(
      `${font.padEnd(18)} ${file.padEnd(36)} ${String(mapped.length).padStart(5)} glyphs  ${range}  outside plane 15: ${outside.length}` +
        (empty.length ? `  (${empty.length} manifest signs with no drawing)` : ''),
    )

    const mappingPath = path.join(dir, 'mapping.json')

    if (fs.existsSync(mappingPath) && file.includes('-Regular')) {
      const listed = (
        JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Array<{
          key: string
          codepoint: string
        }>
      ).map(row => parseInt(row.codepoint.slice(2), 16))
      const same =
        listed.length === mapped.length &&
        listed.every(point => cmap.has(point))

      if (!same) {
        failures.push(`${font}: mapping.json does not match ${file}`)
      }
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} failures:`)

  for (const failure of failures) {
    console.error(`  ${failure}`)
  }

  process.exit(1)
}

console.log('\nevery glyph on its manifest code point, all in plane 15')
