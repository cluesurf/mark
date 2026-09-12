import fs from 'fs/promises'
import path from 'path'
import opentype from 'opentype.js'
import { SVGPathData } from 'svg-pathdata'

export const UNITS_PER_EM = 1000
export const ASCENDER = 800
export const DESCENDER = -200

/**
 * Extract all <path d="..."> attributes from SVG content.
 */

export function extractPathData(svgContent: string): Array<string> {
  const paths: Array<string> = []
  const regex = /<path[^>]*?\sd="([^"]+)"/g
  let match

  while ((match = regex.exec(svgContent)) !== null) {
    paths.push(match[1]!)
  }

  return paths
}

/**
 * Convert an SVG path `d` string into an opentype.js Path,
 * using a custom coordinate transform function.
 */

export function svgPathToOpentype(
  d: string,
  transform: (x: number, y: number) => [number, number],
): opentype.Path {
  const parsed = new SVGPathData(d).toAbs().normalizeST().normalizeHVZ()
  const otPath = new opentype.Path()

  for (const cmd of parsed.commands) {
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

  return otPath
}

/**
 * Create a transform for uniform square SVGs (e.g. 3000x3000).
 */

export function squareTransform(svgSize: number) {
  const scale = UNITS_PER_EM / svgSize
  return (x: number, y: number): [number, number] => [
    x * scale,
    ASCENDER - y * scale,
  ]
}

/**
 * Combine multiple SVG path strings into a single opentype.js Path.
 */

export function combinePaths(
  pathDataList: Array<string>,
  transform: (x: number, y: number) => [number, number],
): opentype.Path {
  const combined = new opentype.Path()

  for (const d of pathDataList) {
    const subPath = svgPathToOpentype(d, transform)

    for (const cmd of subPath.commands) {
      combined.commands.push(cmd)
    }
  }

  return combined
}

/**
 * Create an opentype.js Glyph from a path and codepoint.
 */

export function createGlyph(
  codePoint: number,
  glyphPath: opentype.Path,
  advanceWidth = UNITS_PER_EM,
): opentype.Glyph {
  const hexCode = codePoint
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')

  return new opentype.Glyph({
    name: `uni${hexCode}`,
    unicode: codePoint,
    advanceWidth,
    path: glyphPath,
  })
}

/**
 * Create the .notdef glyph (required as first glyph in every font).
 */

export function createNotdefGlyph(): opentype.Glyph {
  return new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: UNITS_PER_EM,
    path: new opentype.Path(),
  })
}

export type FontMetadataOptions = {
  fontFamily: string
  description: string
  styleName?: string
}

/**
 * Create an opentype.js Font from a list of glyphs with standard
 * ClueSurf metadata.
 */

export function createFont(
  glyphs: Array<opentype.Glyph>,
  options: FontMetadataOptions,
): opentype.Font {
  const { fontFamily, description, styleName = 'Regular' } = options

  return new opentype.Font({
    familyName: fontFamily,
    styleName,
    // opentype.js would otherwise join these without a hyphen, so
    // name 4 and name 6 are set here to the house spelling.
    fullName: `${fontFamily} ${styleName}`,
    postScriptName: `${fontFamily}-${styleName}`,
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
    description,
    trademark: `${fontFamily} is a trademark of ClueSurf.`,
    glyphs,
  })
}

/**
 * Write a font to disk.
 */

export async function writeFont(
  font: opentype.Font,
  outputPath: string,
) {
  const outputDir = path.dirname(outputPath)
  await fs.mkdir(outputDir, { recursive: true })

  const buffer = font.toArrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(buffer))

  console.log(`  -> ${outputPath}`)
}

/**
 * High-level: build a font from a directory of SVGs where each
 * filename is a single character (codepoint derived from filename)
 * and all SVGs share the same square viewBox.
 */

export type MakeFontOptions = {
  svgDir: string
  outputPath: string
  fontFamily: string
  description: string
  styleName?: string
  svgSize?: number
}

export async function makeFont(options: MakeFontOptions) {
  const {
    svgDir,
    outputPath,
    fontFamily,
    description,
    styleName = 'Regular',
    svgSize = 3000,
  } = options

  const entries = await fs.readdir(svgDir)
  const svgFiles = entries.filter(f => f.endsWith('.svg')).sort()

  console.log(
    `Building ${fontFamily}-${styleName} from ${svgFiles.length} SVGs in ${svgDir}`,
  )

  const transform = squareTransform(svgSize)
  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
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

      const glyphPath = combinePaths(pathDataList, transform)
      glyphs.push(createGlyph(codePoint, glyphPath))
      processed++
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
    }
  }

  console.log(`  ${processed} glyphs, ${skipped} skipped`)

  const font = createFont(glyphs, { fontFamily, description, styleName })
  await writeFont(font, outputPath)
}
