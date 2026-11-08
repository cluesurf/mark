import fs from 'fs/promises'
import path from 'path'
import opentype from 'opentype.js'
import { SVGPathData } from 'svg-pathdata'
import {
  codePointOf,
  formatCodePoint,
  readFontCodePoints,
} from './code-point'

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

  // The glyph list's convention: `uniXXXX` in the BMP, `uXXXXX` above.
  return new opentype.Glyph({
    name: codePoint > 0xffff ? `u${hexCode}` : `uni${hexCode}`,
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
  /**
   * OS/2 usWeightClass. opentype.js writes 500 when none is given, so a
   * font whose served variant is 400 or 600 must name it: the font seed
   * matches a variant by weight, and the replace route refuses a file
   * whose OS/2 weight is not its variant's.
   */
  weightClass?: number
}

/**
 * Create an opentype.js Font from a list of glyphs with standard
 * ClueSurf metadata.
 */

export function createFont(
  glyphs: Array<opentype.Glyph>,
  options: FontMetadataOptions,
): opentype.Font {
  const {
    fontFamily,
    description,
    styleName = 'Regular',
    weightClass,
  } = options

  return new opentype.Font({
    familyName: fontFamily,
    styleName,
    // Undefined leaves opentype.js's own 500, which the fonts built
    // before this option still carry.
    weightClass,
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
 * Write `mapping.json` beside a font: each sign name and the code point
 * the font draws it at, in code point order. A derived listing for
 * readers that want one font's signs alone; `code-points.json` at the
 * package root is the source.
 */

export async function writeMapping(
  baseDir: string,
  mapping: Array<{ key: string; codepoint: string }>,
) {
  const mappingPath = path.join(baseDir, 'mapping.json')
  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2) + '\n')
  console.log(`  -> ${mappingPath}`)
}

/**
 * High-level: build a font from a directory of SVGs, all sharing the
 * same square viewBox. Each file is one sign, placed at the code point
 * `code-points.json` gives `<font>/<file name>`.
 */

export type MakeFontOptions = {
  /** The folder under `base/`, the first half of a manifest key. */
  font: string
  svgDir: string
  outputPath: string
  fontFamily: string
  description: string
  styleName?: string
  svgSize?: number
}

export type SignMapping = Array<{ key: string; codepoint: string }>

export async function makeFont(
  options: MakeFontOptions,
): Promise<SignMapping> {
  const {
    font: folder,
    svgDir,
    outputPath,
    fontFamily,
    description,
    styleName = 'Regular',
    svgSize = 3000,
  } = options

  const points = readFontCodePoints(folder)
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries
    .filter(f => f.endsWith('.svg'))
    .sort(
      (a, b) =>
        codePointOf(points, folder, path.basename(a, '.svg')) -
        codePointOf(points, folder, path.basename(b, '.svg')),
    )

  console.log(
    `Building ${fontFamily}-${styleName} from ${svgFiles.length} SVGs in ${svgDir}`,
  )

  const transform = squareTransform(svgSize)
  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: SignMapping = []
  let skipped = 0

  for (const file of svgFiles) {
    const key = path.basename(file, '.svg')
    const codePoint = codePointOf(points, folder, key)
    const svgContent = await fs.readFile(path.join(svgDir, file), 'utf-8')
    const pathDataList = extractPathData(svgContent)

    if (pathDataList.length === 0) {
      console.warn(`  skip ${file}: no <path> found`)
      skipped++
      continue
    }

    let glyphPath: opentype.Path

    try {
      glyphPath = combinePaths(pathDataList, transform)
    } catch (err) {
      console.warn(`  error ${file}:`, err)
      skipped++
      continue
    }

    glyphs.push(createGlyph(codePoint, glyphPath))
    mapping.push({ key, codepoint: formatCodePoint(codePoint) })
  }

  console.log(`  ${mapping.length} glyphs, ${skipped} skipped`)

  const font = createFont(glyphs, { fontFamily, description, styleName })
  await writeFont(font, outputPath)

  return mapping
}

/**
 * Build a font from SVGs of one height and varying widths (Rongorongo,
 * Indus, Byblos, the Mesoamerican sets, and the `0 0 <advance> <em>`
 * form `extract-mark.ts` writes): the view box height fills the em, the
 * width sets the advance, and each glyph keeps its own proportions.
 * Signs are placed on `code-points.json` and written in its order.
 */

export type MakeViewBoxFontOptions = {
  font: string
  svgDir: string
  outputPath: string
  fontFamily: string
  description: string
  styleName?: string
  /** OS/2 usWeightClass: see `FontMetadataOptions.weightClass`. */
  weightClass?: number
  /** The view box side assumed for an SVG that has none. */
  svgSize?: number
  /**
   * Round every point to whole font units before writing. opentype.js
   * writes CFF points as rounded steps from the previous point, so
   * fractional points drift along a contour (up to 4 units of 1000 on a
   * font drawn at 2048 units per em). Whole points do not drift.
   */
  roundToUnits?: boolean
}

export async function makeViewBoxFont(
  options: MakeViewBoxFontOptions,
): Promise<SignMapping> {
  const {
    font: folder,
    svgDir,
    outputPath,
    fontFamily,
    description,
    styleName = 'Regular',
    weightClass,
    svgSize = 3000,
    roundToUnits = false,
  } = options

  const round = roundToUnits
    ? (value: number) => Math.round(value)
    : (value: number) => value
  const points = readFontCodePoints(folder)
  const names = (await fs.readdir(svgDir))
    .filter(f => f.endsWith('.svg'))
    .map(f => path.basename(f, '.svg'))
    .sort(
      (a, b) =>
        codePointOf(points, folder, a) - codePointOf(points, folder, b),
    )

  console.log(
    `Building ${fontFamily}-${styleName} from ${names.length} SVGs in ${svgDir}`,
  )

  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  const mapping: SignMapping = []
  let skipped = 0

  for (const name of names) {
    const codePoint = codePointOf(points, folder, name)
    const svg = await fs.readFile(path.join(svgDir, `${name}.svg`), 'utf-8')
    const pathDataList = extractPathData(svg)

    if (pathDataList.length === 0) {
      console.warn(`  skip ${name}.svg: no <path> found`)
      skipped++
      continue
    }

    const box = svg.match(
      /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/,
    )
    const width = box ? parseFloat(box[1]!) : svgSize
    const height = box ? parseFloat(box[2]!) : svgSize
    const scale = UNITS_PER_EM / height
    const transform = (x: number, y: number): [number, number] => [
      round(x * scale),
      round(ASCENDER - y * scale),
    ]

    let glyphPath: opentype.Path

    try {
      glyphPath = combinePaths(pathDataList, transform)
    } catch (err) {
      console.warn(`  error ${name}.svg:`, err)
      skipped++
      continue
    }

    glyphs.push(createGlyph(codePoint, glyphPath, Math.round(width * scale)))
    mapping.push({ key: name, codepoint: formatCodePoint(codePoint) })
  }

  console.log(`  ${mapping.length} glyphs, ${skipped} skipped`)

  // No space or Latin glyph: a Mark font draws its signs and nothing on
  // a real character, so text around a sign falls back to the page font.
  const font = createFont(glyphs, {
    fontFamily,
    description,
    styleName,
    weightClass,
  })
  await writeFont(font, outputPath)

  return mapping
}
