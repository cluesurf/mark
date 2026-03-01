import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import opentype from 'opentype.js'
import { SVGPathData } from 'svg-pathdata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// SVG viewBox is 3000x3000
const SVG_SIZE = 3000

// Standard OpenType font metrics
const UNITS_PER_EM = 1000
const SCALE = UNITS_PER_EM / SVG_SIZE
const ASCENDER = 800
const DESCENDER = -200

// Transform SVG x coordinate to font coordinate
function tx(x: number): number {
  return x * SCALE
}

// Transform SVG y coordinate to font coordinate (flip Y axis)
// SVG y=0 (top) maps to font y=ASCENDER
// SVG y=3000 (bottom) maps to font y=DESCENDER
function ty(y: number): number {
  return ASCENDER - y * SCALE
}

// Convert an SVG path `d` string into an opentype.js Path.
// Uses svg-pathdata to parse, normalize to absolute coords,
// expand smooth curves (S->C, T->Q), and convert H/V to L.
function svgPathToOpentypePath(d: string): opentype.Path {
  const parsed = new SVGPathData(d).toAbs().normalizeST().normalizeHVZ()
  const otPath = new opentype.Path()

  for (const cmd of parsed.commands) {
    switch (cmd.type) {
      case SVGPathData.MOVE_TO:
        otPath.moveTo(tx(cmd.x), ty(cmd.y))
        break

      case SVGPathData.LINE_TO:
        otPath.lineTo(tx(cmd.x), ty(cmd.y))
        break

      case SVGPathData.CURVE_TO:
        otPath.curveTo(
          tx(cmd.x1),
          ty(cmd.y1),
          tx(cmd.x2),
          ty(cmd.y2),
          tx(cmd.x),
          ty(cmd.y),
        )
        break

      case SVGPathData.QUAD_TO:
        otPath.quadraticCurveTo(
          tx(cmd.x1),
          ty(cmd.y1),
          tx(cmd.x),
          ty(cmd.y),
        )
        break

      case SVGPathData.CLOSE_PATH:
        otPath.close()
        break
    }
  }

  return otPath
}

// Extract all <path d="..."> attributes from SVG content
function extractPathData(svgContent: string): Array<string> {
  const paths: Array<string> = []
  const regex = /<path[^>]*?\sd="([^"]+)"/g
  let match

  while ((match = regex.exec(svgContent)) !== null) {
    paths.push(match[1]!)
  }

  return paths
}

async function buildFont(
  folderName: 'bone' | 'cast',
  fontFamily: string,
  outputFileName: string,
) {
  const svgDir = path.join(__dirname, '..', 'base', folderName, 'mark')
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries.filter(f => f.endsWith('.svg')).sort()

  console.log(
    `Building ${fontFamily} from ${svgFiles.length} SVGs in base/${folderName}/mark/`,
  )

  // .notdef glyph (required as first glyph)
  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: UNITS_PER_EM,
    path: new opentype.Path(),
  })

  const glyphs: Array<opentype.Glyph> = [notdefGlyph]
  let processed = 0
  let skipped = 0

  for (const file of svgFiles) {
    const char = path.basename(file, '.svg')
    const codePoint = char.codePointAt(0)

    if (!codePoint) {
      console.warn(`  skip ${file}: no codepoint`)
      skipped++
      continue
    }

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

      // Combine all paths from the SVG into one glyph path
      const combinedPath = new opentype.Path()

      for (const d of pathDataList) {
        const subPath = svgPathToOpentypePath(d)

        for (const pathCmd of subPath.commands) {
          combinedPath.commands.push(pathCmd)
        }
      }

      const hexCode = codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')

      const glyph = new opentype.Glyph({
        name: `uni${hexCode}`,
        unicode: codePoint,
        advanceWidth: UNITS_PER_EM,
        path: combinedPath,
      })

      glyphs.push(glyph)
      processed++
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  console.log(`  ${processed} glyphs, ${skipped} skipped`)

  const font = new opentype.Font({
    familyName: fontFamily,
    styleName: 'Regular',
    unitsPerEm: UNITS_PER_EM,
    ascender: ASCENDER,
    descender: DESCENDER,
    copyright: 'Copyright 2025 ClueSurf. All rights reserved.',
    designer: 'ClueSurf',
    designerURL: 'https://clue.surf',
    manufacturer: 'ClueSurf',
    manufacturerURL: 'https://clue.surf',
    license:
      'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
    licenseURL: 'https://openfontlicense.org',
    version: 'Version 0.1.0',
    description:
      folderName === 'cast'
        ? 'Ancient Chinese bronze inscription (金文) script font.'
        : 'Ancient Chinese oracle bone (甲骨文) script font.',
    trademark: `${fontFamily} is a trademark of ClueSurf.`,
    glyphs,
  })

  const outputDir = path.join(__dirname, '..', 'base', folderName)
  await fs.mkdir(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, outputFileName)
  const buffer = font.toArrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(buffer))

  console.log(`  -> ${outputPath}`)
}

async function main() {
  console.log('Generating OpenType fonts...\n')

  await buildFont('cast', 'WindMarkCast', 'WindMarkCast.otf')
  console.log()
  await buildFont('bone', 'WindMarkBone', 'WindMarkBone.otf')

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
