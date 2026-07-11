import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  svgPathToOpentype,
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

// Proto-Elamite has no codepoints of its own in Unicode. The glyphs are
// hosted on the precomposed Hangul syllables that carry a KS X 1001 code,
// read in order from `base/hangul-ks-x-1001.csv`.
const CODEPOINT_CSV = 'hangul-ks-x-1001.csv'

type ViewBox = { x: number; y: number; w: number; h: number }
type Matrix = [number, number, number, number, number, number]

// The glyph SVGs come from the CDLI proto-elamite sign list, converted
// via pdftocairo. Each <path> carries its own affine transform (usually
// matrix(0.1,0,0,-0.1,0,108)) and the viewBox has a non-zero x origin
// (from the fit-width trim), so both must be applied per path.

function extractViewBox(svg: string): ViewBox | null {
  const m = svg.match(
    /viewBox="\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)\s*"/,
  )
  if (!m) {
    return null
  }
  return { x: +m[1]!, y: +m[2]!, w: +m[3]!, h: +m[4]! }
}

function extractPaths(
  svg: string,
): Array<{ d: string; matrix: Matrix | null }> {
  const out: Array<{ d: string; matrix: Matrix | null }> = []
  const re = /<path\b([^>]*)>/g
  let m: RegExpExecArray | null

  while ((m = re.exec(svg)) !== null) {
    const attrs = m[1]!
    // Skip clip-path definitions if any ever appear.
    if (/clip-rule/.test(attrs)) {
      continue
    }
    const dMatch = attrs.match(/\sd="([^"]+)"/)
    if (!dMatch) {
      continue
    }
    let matrix: Matrix | null = null
    const tMatch = attrs.match(/transform="matrix\(([^)]+)\)"/)
    if (tMatch) {
      const nums = tMatch[1]!.split(',').map(s => parseFloat(s.trim()))
      if (nums.length === 6 && nums.every(n => !Number.isNaN(n))) {
        matrix = nums as Matrix
      }
    }
    out.push({ d: dMatch[1]!, matrix })
  }

  return out
}

async function main() {
  console.log('Generating ProtoElamiteMark font...\n')

  const svgDir = path.join(baseDir, 'mark')
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries.filter(f => f.endsWith('.svg')).sort()

  console.log(`Found ${svgFiles.length} SVGs`)

  // Host codepoints: the `unicode` column of the KS X 1001 hangul CSV,
  // in order. Glyph i maps to the i-th KS X 1001 hangul syllable.
  const csvText = await fs.readFile(
    path.join(baseDir, CODEPOINT_CSV),
    'utf-8',
  )
  const codePoints = csvText
    .trim()
    .split('\n')
    .slice(1)
    .map(line => parseInt(line.split(',')[1]!.replace(/^U\+/, ''), 16))

  console.log(`Loaded ${codePoints.length} KS X 1001 host codepoints`)
  if (svgFiles.length > codePoints.length) {
    throw new Error(
      `Not enough host codepoints: ${svgFiles.length} glyphs > ${codePoints.length} codepoints`,
    )
  }

  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: Array<{ key: string; codepoint: string }> = []
  let processed = 0
  let skipped = 0

  for (let i = 0; i < svgFiles.length; i++) {
    const file = svgFiles[i]!
    const key = path.basename(file, '.svg')
    const codePoint = codePoints[i]!

    try {
      const svg = await fs.readFile(path.join(svgDir, file), 'utf-8')
      const vb = extractViewBox(svg)
      if (!vb) {
        console.warn(`  skip ${file}: no viewBox`)
        skipped++
        continue
      }

      const paths = extractPaths(svg)
      if (paths.length === 0) {
        console.warn(`  skip ${file}: no <path> found`)
        skipped++
        continue
      }

      // Scale so the SVG height maps to the full em, preserving aspect.
      const scale = UNITS_PER_EM / vb.h
      const combined = new opentype.Path()

      for (const p of paths) {
        const mat = p.matrix
        const transform = (
          x: number,
          y: number,
        ): [number, number] => {
          // First apply the path's own affine matrix (SVG user space),
          // then map into font space (origin-shifted, y flipped up).
          const ux = mat ? mat[0] * x + mat[2] * y + mat[4] : x
          const uy = mat ? mat[1] * x + mat[3] * y + mat[5] : y
          return [(ux - vb.x) * scale, ASCENDER - (uy - vb.y) * scale]
        }

        const sub = svgPathToOpentype(p.d, transform)
        for (const cmd of sub.commands) {
          combined.commands.push(cmd)
        }
      }

      const advanceWidth = Math.round(vb.w * scale)
      glyphs.push(createGlyph(codePoint, combined, advanceWidth))

      const hexCode = codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')
      mapping.push({ key, codepoint: `U+${hexCode}` })
      processed++
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  console.log(`  ${processed} glyphs, ${skipped} skipped`)

  const font = createFont(glyphs, {
    fontFamily: 'ProtoElamiteMark',
    description:
      'Proto-Elamite sign list hosted on the KS X 1001 hangul syllables. Glyphs derived from the CDLI proto-elamite_data corpus (CC-BY-4.0).',
  })

  await writeFont(font, path.join(baseDir, 'ProtoElamiteMark.otf'))

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
