import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  extractPathData,
  combinePaths,
  createGlyph,
  createNotdefGlyph,
  createFont,
  writeFont,
  UNITS_PER_EM,
  ASCENDER,
} from '../../../code/make-font'
import opentype from 'opentype.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

// Linear B Ideograms block: U+10080 to U+100FA
const LINEAR_B_BASE = 0x10080

// All Cascajal SVGs share the same height but vary in width.
// Scale uniformly so the SVG height fills the em (ascender to
// descender), and use the SVG width to set advanceWidth.
const SVG_HEIGHT = 3000

function extractViewBox(
  svgContent: string,
): { width: number; height: number } | null {
  const match = svgContent.match(
    /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/,
  )
  if (!match) {
    return null
  }
  return { width: parseFloat(match[1]!), height: parseFloat(match[2]!) }
}

async function main() {
  console.log('Generating CascajalMark font...\n')

  const svgDir = path.join(baseDir, 'mark')
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries
    .filter(f => f.endsWith('.svg'))
    .sort(
      (a, b) =>
        parseInt(path.basename(a, '.svg'), 10) -
        parseInt(path.basename(b, '.svg'), 10),
    )

  console.log(`Found ${svgFiles.length} SVGs`)

  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: Array<{ key: string; codepoint: string }> = []
  let processed = 0
  let skipped = 0

  for (let i = 0; i < svgFiles.length; i++) {
    const file = svgFiles[i]!
    const key = path.basename(file, '.svg')
    const codePoint = LINEAR_B_BASE + i

    try {
      const svgContent = await fs.readFile(
        path.join(svgDir, file),
        'utf-8',
      )
      const pathDataList = extractPathData(svgContent)

      if (pathDataList.length === 0) {
        console.warn(`  skip ${file}: no <path> found`)
        skipped++
        continue
      }

      const viewBox = extractViewBox(svgContent)
      const height = viewBox?.height ?? SVG_HEIGHT
      const width = viewBox?.width ?? SVG_HEIGHT

      // Scale so SVG height maps to the full em, preserving aspect.
      const scale = UNITS_PER_EM / height
      const transform = (x: number, y: number): [number, number] => [
        x * scale,
        ASCENDER - y * scale,
      ]

      const glyphPath = combinePaths(pathDataList, transform)
      const advanceWidth = Math.round(width * scale)

      const hexCode = codePoint
        .toString(16)
        .toUpperCase()
        .padStart(5, '0')

      glyphs.push(createGlyph(codePoint, glyphPath, advanceWidth))
      mapping.push({ key, codepoint: `U+${hexCode}` })
      processed++
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  console.log(`  ${processed} glyphs, ${skipped} skipped`)

  const font = createFont(glyphs, {
    fontFamily: 'CascajalMark',
    description:
      'Cascajal Block (Olmec) script font mapped to the Linear B Ideograms block.',
  })

  await writeFont(font, path.join(baseDir, 'CascajalMark.otf'))

  const mappingPath = path.join(baseDir, 'mapping.json')
  await fs.writeFile(
    mappingPath,
    JSON.stringify(mapping, null, 2) + '\n',
  )
  console.log(`  -> ${mappingPath}`)

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
