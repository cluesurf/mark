import fs from 'fs'
import path from 'path'
import opentype from 'opentype.js'
import { ASCENDER, UNITS_PER_EM } from './make-font'

/**
 * Write each sign of a font that was drawn in a font editor, with no
 * SVG source, out as `base/mark/<sign name>.svg`, so every Mark font
 * is built the same way: from its SVGs, on `code-points.json`.
 *
 * Gupta, Proto-Canaanite and Proto-Sinaitic were drawn this way, on
 * borrowed Unicode points (Brahmi, Phoenician, Egyptian hieroglyphs).
 * This reads those points once, names each sign, and keeps the outline
 * exactly: the SVG is the glyph in font units, y flipped, in a
 * `0 0 <advance> <em>` view box whose baseline sits where
 * `makeSvgFont` puts it, so the rebuilt glyph has the same outline and
 * advance, scaled to 1000 units per em.
 *
 * It only ever runs on the original font, so it refuses to write into
 * a `base/mark` that already exists.
 */

export type ExtractMarkOptions = {
  fontPath: string
  markDir: string
  /** Sign name and old code point, in sign order. */
  signs: Array<{ name: string; codePoint: number }>
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function extractMark(options: ExtractMarkOptions) {
  const { fontPath, markDir, signs } = options

  if (fs.existsSync(markDir)) {
    throw new Error(`${markDir} exists, extraction runs once`)
  }

  const bytes = fs.readFileSync(fontPath)
  const font = opentype.parse(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ),
  )
  const em = font.unitsPerEm

  // The SVG baseline, in source units, that maps to the house ascender.
  const baseline = (ASCENDER / UNITS_PER_EM) * em

  fs.mkdirSync(markDir, { recursive: true })

  for (const sign of signs) {
    const glyph = font.charToGlyph(String.fromCodePoint(sign.codePoint))

    if (!glyph || glyph.index === 0 || !glyph.path.commands.length) {
      throw new Error(
        `${fontPath}: no glyph at U+${sign.codePoint.toString(16).toUpperCase()} for ${sign.name}`,
      )
    }

    const y = (value: number) => round(baseline - value)
    const parts: Array<string> = []

    for (const command of glyph.path.commands) {
      switch (command.type) {
        case 'M':
          parts.push(`M${round(command.x)} ${y(command.y)}`)
          break
        case 'L':
          parts.push(`L${round(command.x)} ${y(command.y)}`)
          break
        case 'Q':
          parts.push(
            `Q${round(command.x1)} ${y(command.y1)} ${round(command.x)} ${y(command.y)}`,
          )
          break
        case 'C':
          parts.push(
            `C${round(command.x1)} ${y(command.y1)} ${round(command.x2)} ${y(command.y2)} ${round(command.x)} ${y(command.y)}`,
          )
          break
        case 'Z':
          parts.push('Z')
          break
      }
    }

    const width = glyph.advanceWidth ?? em
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${em}">` +
      `<path d="${parts.join('')}"/></svg>\n`

    fs.writeFileSync(path.join(markDir, `${sign.name}.svg`), svg)
  }

  fs.writeFileSync(
    path.join(markDir, 'order.json'),
    `${JSON.stringify(
      signs.map(sign => sign.name),
      null,
      2,
    )}\n`,
  )

  console.log(`  ${signs.length} signs -> ${markDir}`)
}
