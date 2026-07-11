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
  DESCENDER,
} from '../../../code/make-font'
import opentype from 'opentype.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

// Proto-Elamite has no codepoints of its own in Unicode. The glyphs are
// hosted on the precomposed Hangul syllables that carry a KS X 1001 code,
// read in order from `base/hangul-ks-x-1001.csv`.
const CODEPOINT_CSV = 'hangul-ks-x-1001.csv'

type Matrix = [number, number, number, number, number, number]

// The glyph SVGs come from the CDLI proto-elamite sign list, converted
// via pdftocairo. Each <path> carries its own affine transform (usually
// matrix(0.1,0,0,-0.1,0,108)); it is applied so all glyphs land in one
// common coordinate space before a single global scale is computed.

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

  // Glyphs are centered on the em's vertical middle and share ONE global
  // scale (the tallest sign fills the target ink height). This keeps
  // relative sizes, trims the common top/bottom whitespace, and keeps
  // the outlier signs (whose source boxes are short) from ballooning.
  const CENTER_Y = (ASCENDER + DESCENDER) / 2
  const TARGET_INK_HEIGHT = UNITS_PER_EM * 0.94
  const SIDE_BEARING = 40

  type Item = {
    key: string
    codePoint: number
    vbPath: opentype.Path
    minX: number
    minY: number
    inkW: number
    inkH: number
  }

  // Pass 1: parse each glyph into a common (viewBox) space and measure
  // its ink box, tracking the tallest ink height across all glyphs.
  const items: Array<Item> = []
  let skipped = 0
  let globalMaxInkH = 0

  for (let i = 0; i < svgFiles.length; i++) {
    const file = svgFiles[i]!
    const key = path.basename(file, '.svg')
    const codePoint = codePoints[i]!

    try {
      const svg = await fs.readFile(path.join(svgDir, file), 'utf-8')
      const paths = extractPaths(svg)
      if (paths.length === 0) {
        console.warn(`  skip ${file}: no <path> found`)
        skipped++
        continue
      }

      // Apply each path's own affine matrix so all glyphs share one
      // coordinate space (y-down). No scaling yet.
      const vbPath = new opentype.Path()
      for (const p of paths) {
        const mat = p.matrix
        const toVb = (x: number, y: number): [number, number] => [
          mat ? mat[0] * x + mat[2] * y + mat[4] : x,
          mat ? mat[1] * x + mat[3] * y + mat[5] : y,
        ]
        const sub = svgPathToOpentype(p.d, toVb)
        for (const cmd of sub.commands) {
          vbPath.commands.push(cmd)
        }
      }

      const bb = vbPath.getBoundingBox()
      const inkW = bb.x2 - bb.x1
      const inkH = bb.y2 - bb.y1
      if (!(inkW > 0) || !(inkH > 0)) {
        console.warn(`  skip ${file}: empty ink box`)
        skipped++
        continue
      }

      items.push({
        key,
        codePoint,
        vbPath,
        minX: bb.x1,
        minY: bb.y1,
        inkW,
        inkH,
      })
      globalMaxInkH = Math.max(globalMaxInkH, inkH)
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  const globalScale = TARGET_INK_HEIGHT / globalMaxInkH
  console.log(
    `Global scale ${globalScale.toFixed(4)} (tallest ink ${globalMaxInkH.toFixed(1)})`,
  )

  // Pass 2: place each glyph with the shared scale, ink-centered on the
  // em, advance width tight to the (scaled) ink plus a small bearing.
  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: Array<{ key: string; codepoint: string }> = []
  let processed = 0

  for (const it of items) {
    const glyphH = it.inkH * globalScale
    const top = CENTER_Y + glyphH / 2

    const map = (x: number, y: number): [number, number] => [
      (x - it.minX) * globalScale + SIDE_BEARING,
      top - (y - it.minY) * globalScale,
    ]

    const finalPath = new opentype.Path()
    for (const cmd of it.vbPath.commands) {
      const nc: opentype.PathCommand = { ...cmd }
      const c = cmd as { x1?: number; y1?: number; x2?: number; y2?: number; x?: number; y?: number }
      const n = nc as { x1?: number; y1?: number; x2?: number; y2?: number; x?: number; y?: number }
      if ('x1' in cmd) [n.x1, n.y1] = map(c.x1!, c.y1!)
      if ('x2' in cmd) [n.x2, n.y2] = map(c.x2!, c.y2!)
      if ('x' in cmd) [n.x, n.y] = map(c.x!, c.y!)
      finalPath.commands.push(nc)
    }

    const advanceWidth = Math.round(
      it.inkW * globalScale + 2 * SIDE_BEARING,
    )
    glyphs.push(createGlyph(it.codePoint, finalPath, advanceWidth))

    const hexCode = it.codePoint
      .toString(16)
      .toUpperCase()
      .padStart(4, '0')
    mapping.push({ key: it.key, codepoint: `U+${hexCode}` })
    processed++
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
