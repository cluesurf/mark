import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  extractPathData,
  squareTransform,
  combinePaths,
  createGlyph,
  createNotdefGlyph,
  createFont,
  writeFont,
} from '../../../code/make-font'
import opentype from 'opentype.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

// Korean Hangul Syllables block: U+AC00 to U+D7AF
const HANGUL_BASE = 0xac00

async function main() {
  console.log('Generating MayanHieroglyphMark font...\n')

  const svgDir = path.join(baseDir, 'mark')
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries.filter(f => f.endsWith('.svg')).sort()

  console.log(`Found ${svgFiles.length} SVGs`)

  const transform = squareTransform(3000)
  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: Array<{ key: string; codepoint: string }> = []
  let processed = 0
  let skipped = 0

  for (let i = 0; i < svgFiles.length; i++) {
    const file = svgFiles[i]!
    const key = path.basename(file, '.svg')
    const codePoint = HANGUL_BASE + i

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

      const glyphPath = combinePaths(pathDataList, transform)
      const hexCode = codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')

      glyphs.push(createGlyph(codePoint, glyphPath))
      mapping.push({ key, codepoint: `U+${hexCode}` })
      processed++
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  console.log(`  ${processed} glyphs, ${skipped} skipped`)

  const font = createFont(glyphs, {
    fontFamily: 'MayanHieroglyphMark',
    description:
      'Mayan hieroglyphic script font mapped to the Korean Hangul Syllables block.',
  })

  await writeFont(font, path.join(baseDir, 'MayanHieroglyphMark.otf'))

  // Write out the mapping so we know which glyph is at which codepoint.
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
