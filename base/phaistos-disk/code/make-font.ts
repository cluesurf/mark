/**
 * Build an OpenType font from the Phaistos Disc SVG glyphs.
 *
 * Reads each Phaistos_glyph_NN.svg from ../images/, extracts the
 * path data, scales each glyph to fit a uniform em square, and
 * maps glyph 01 to U+101D0, glyph 02 to U+101D1, etc. (the
 * standard Phaistos Disc Unicode block).
 *
 * Outputs PhaistosDisc.otf in ../host/.
 *
 * Usage:
 *   pnpm exec tsx import/images/phaistos-disc/code/make-font.ts
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import opentype from 'opentype.js'
import { SVGPathData } from 'svg-pathdata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SVG_DIR = path.join(__dirname, '..', 'base', 'mark')
const OUTPUT_DIR = path.join(__dirname, '..', 'host')
const OUTPUT_FILE = 'DiskMark.otf'

// Phaistos Disc Unicode block starts at U+101D0.
const UNICODE_BASE = 0x101d0

// Standard OpenType font metrics.
const UNITS_PER_EM = 1000
const ASCENDER = 800
const DESCENDER = -200

/**
 * Parse SVG width/height from the root <svg> element.
 * Handles both attribute formats (inline and multiline).
 */

function parseSvgDimensions(svgContent: string): {
  width: number
  height: number
} {
  const widthMatch = svgContent.match(/width="([^"]+)"/)
  const heightMatch = svgContent.match(/height="([^"]+)"/)

  return {
    width: widthMatch ? parseFloat(widthMatch[1]!) : 0,
    height: heightMatch ? parseFloat(heightMatch[1]!) : 0,
  }
}

/**
 * Parse the <g transform="translate(x, y)"> that Inkscape uses
 * to position the glyph. These SVGs flip the Y axis by translating
 * by the full height.
 */

function parseGroupTranslate(svgContent: string): {
  tx: number
  ty: number
} {
  const match = svgContent.match(
    /transform="translate\(([^,)]+),?\s*([^)]+)\)"/,
  )

  if (match) {
    return {
      tx: parseFloat(match[1]!),
      ty: parseFloat(match[2]!),
    }
  }

  return { tx: 0, ty: 0 }
}

/**
 * Extract all <path d="..."> attributes from SVG content.
 */

function extractPathData(svgContent: string): string[] {
  const paths: string[] = []
  const regex = /<path[^>]*?\sd="([^"]+)"/g
  let match

  while ((match = regex.exec(svgContent)) !== null) {
    paths.push(match[1]!)
  }

  return paths
}

/**
 * Convert an SVG path string to an opentype.js Path,
 * applying translation and scaling to fit the em square.
 *
 * All glyphs are scaled using the same global scale factor
 * (derived from the tallest SVG) so proportions are consistent.
 * Shorter glyphs are bottom-aligned by adding a Y offset.
 */

function svgPathToOpentypePath(
  d: string,
  svgWidth: number,
  svgHeight: number,
  groupTx: number,
  groupTy: number,
  globalScale: number,
  maxSvgHeight: number,
): { path: opentype.Path; advanceWidth: number } {
  const parsed = new SVGPathData(d).toAbs().normalizeST().normalizeHVZ()

  const scaledWidth = svgWidth * globalScale
  const advanceWidth = Math.round(scaledWidth)

  // Bottom-align: offset shorter glyphs so their bottom matches
  // the tallest glyph's bottom edge.
  const heightDiff = maxSvgHeight - svgHeight
  const bottomOffset = heightDiff * globalScale

  const otPath = new opentype.Path()

  for (const cmd of parsed.commands) {
    // Apply group translate first, then scale and flip Y.
    // The bottomOffset shifts shorter glyphs down (toward baseline).
    const transform = (x: number, y: number): [number, number] => {
      const sx = (x + groupTx) * globalScale
      const sy = ASCENDER - (y + groupTy) * globalScale - bottomOffset
      return [sx, sy]
    }

    switch (cmd.type) {
      case SVGPathData.MOVE_TO: {
        const [x, y] = transform(cmd.x, cmd.y)
        otPath.moveTo(x, y)
        break
      }

      case SVGPathData.LINE_TO: {
        const [x, y] = transform(cmd.x, cmd.y)
        otPath.lineTo(x, y)
        break
      }

      case SVGPathData.CURVE_TO: {
        const [x1, y1] = transform(cmd.x1, cmd.y1)
        const [x2, y2] = transform(cmd.x2, cmd.y2)
        const [x, y] = transform(cmd.x, cmd.y)
        otPath.curveTo(x1, y1, x2, y2, x, y)
        break
      }

      case SVGPathData.QUAD_TO: {
        const [x1, y1] = transform(cmd.x1, cmd.y1)
        const [x, y] = transform(cmd.x, cmd.y)
        otPath.quadraticCurveTo(x1, y1, x, y)
        break
      }

      case SVGPathData.CLOSE_PATH:
        otPath.close()
        break
    }
  }

  return { path: otPath, advanceWidth }
}

async function main() {
  const entries = await fs.readdir(SVG_DIR)
  const svgFiles = entries
    .filter(f => f.match(/^\d+\.svg$/))
    .sort()

  console.log(`Building DiskMark font from ${svgFiles.length} SVGs`)

  // First pass: read all SVGs and find the max height.
  type SvgInfo = {
    file: string
    glyphNum: number
    codePoint: number
    svgContent: string
    width: number
    height: number
    groupTx: number
    groupTy: number
    pathDataList: string[]
  }

  const svgInfos: SvgInfo[] = []
  let maxSvgHeight = 0

  for (const file of svgFiles) {
    const numMatch = file.match(/(\d+)\.svg$/)

    if (!numMatch) {
      console.warn(`  skip ${file}: no number in filename`)
      continue
    }

    const glyphNum = parseInt(numMatch[1]!, 10)
    const codePoint = UNICODE_BASE + glyphNum - 1

    try {
      const svgContent = await fs.readFile(
        path.join(SVG_DIR, file),
        'utf-8',
      )

      const { width, height } = parseSvgDimensions(svgContent)

      if (!width || !height) {
        console.warn(`  skip ${file}: missing dimensions`)
        continue
      }

      const { tx: groupTx, ty: groupTy } = parseGroupTranslate(svgContent)
      const pathDataList = extractPathData(svgContent)

      if (pathDataList.length === 0) {
        console.warn(`  skip ${file}: no <path> found`)
        continue
      }

      if (height > maxSvgHeight) {
        maxSvgHeight = height
      }

      svgInfos.push({
        file,
        glyphNum,
        codePoint,
        svgContent,
        width,
        height,
        groupTx,
        groupTy,
        pathDataList,
      })
    } catch (err) {
      console.warn(`  error reading ${file}:`, err)
    }
  }

  console.log(`  Max SVG height: ${maxSvgHeight.toFixed(2)}`)

  // Global scale: tallest SVG fills the full ascender-descender range.
  const fontHeight = ASCENDER - DESCENDER
  const globalScale = fontHeight / maxSvgHeight

  console.log(`  Global scale: ${globalScale.toFixed(4)}`)

  // .notdef glyph (required as first glyph).
  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: UNITS_PER_EM,
    path: new opentype.Path(),
  })

  const glyphs: opentype.Glyph[] = [notdefGlyph]
  let processed = 0

  // Second pass: build glyphs using the global scale.
  for (const info of svgInfos) {
    const combinedPath = new opentype.Path()
    let advanceWidth = UNITS_PER_EM

    for (const d of info.pathDataList) {
      const result = svgPathToOpentypePath(
        d,
        info.width,
        info.height,
        info.groupTx,
        info.groupTy,
        globalScale,
        maxSvgHeight,
      )

      for (const pathCmd of result.path.commands) {
        combinedPath.commands.push(pathCmd)
      }

      advanceWidth = result.advanceWidth
    }

    const hexCode = info.codePoint
      .toString(16)
      .toUpperCase()
      .padStart(5, '0')

    const glyph = new opentype.Glyph({
      name: `uni${hexCode}`,
      unicode: info.codePoint,
      advanceWidth,
      path: combinedPath,
    })

    glyphs.push(glyph)
    processed++

    console.log(
      `  ${info.file} -> U+${hexCode} (${info.width.toFixed(0)}x${info.height.toFixed(0)}, advance=${advanceWidth})`,
    )
  }

  console.log(
    `\n  ${processed} glyphs, ${svgFiles.length - processed} skipped`,
  )

  const font = new opentype.Font({
    familyName: 'DiskMark',
    styleName: 'Regular',
    unitsPerEm: UNITS_PER_EM,
    ascender: ASCENDER,
    descender: DESCENDER,
    copyright: 'SVGs from Wikimedia Commons. Font by ClueSurf.',
    designer: 'ClueSurf',
    designerURL: 'https://clue.surf',
    manufacturer: 'ClueSurf',
    manufacturerURL: 'https://clue.surf',
    license:
      'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
    licenseURL: 'https://openfontlicense.org',
    version: 'Version 0.1.0',
    description:
      'Phaistos Disc signs mapped to the Unicode Phaistos Disc block (U+101D0-U+101FF).',
    glyphs,
  })

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE)
  const buffer = font.toArrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(buffer))

  console.log(`\n  -> ${outputPath}`)
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
