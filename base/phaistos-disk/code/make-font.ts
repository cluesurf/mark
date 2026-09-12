import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  ASCENDER,
  DESCENDER,
  extractPathData,
  svgPathToOpentype,
  createGlyph,
  createNotdefGlyph,
  createFont,
  writeFont,
  UNITS_PER_EM,
} from '../../../code/make-font'
import opentype from 'opentype.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

// Phaistos Disc Unicode block starts at U+101D0.
const UNICODE_BASE = 0x101d0

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

type SvgInfo = {
  file: string
  codePoint: number
  width: number
  height: number
  groupTx: number
  groupTy: number
  pathDataList: Array<string>
}

async function main() {
  const svgDir = path.join(baseDir, 'mark')
  const entries = await fs.readdir(svgDir)
  const svgFiles = entries
    .filter(f => f.match(/^\d+\.svg$/))
    .sort()

  console.log(
    `Building MarkPhaistosDisc from ${svgFiles.length} SVGs\n`,
  )

  // First pass: read all SVGs and find the max height.
  const svgInfos: Array<SvgInfo> = []
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
        path.join(svgDir, file),
        'utf-8',
      )

      const { width, height } = parseSvgDimensions(svgContent)

      if (!width || !height) {
        console.warn(`  skip ${file}: missing dimensions`)
        continue
      }

      const { tx: groupTx, ty: groupTy } =
        parseGroupTranslate(svgContent)
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
        codePoint,
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

  // Second pass: build glyphs using the global scale.
  const glyphs: Array<opentype.Glyph> = [createNotdefGlyph()]
  let processed = 0

  for (const info of svgInfos) {
    // Bottom-align: offset shorter glyphs so their bottom matches
    // the tallest glyph's bottom edge.
    const heightDiff = maxSvgHeight - info.height
    const bottomOffset = heightDiff * globalScale

    const transform = (x: number, y: number): [number, number] => {
      const sx = (x + info.groupTx) * globalScale
      const sy =
        ASCENDER - (y + info.groupTy) * globalScale - bottomOffset
      return [sx, sy]
    }

    const combinedPath = new opentype.Path()

    for (const d of info.pathDataList) {
      const subPath = svgPathToOpentype(d, transform)

      for (const cmd of subPath.commands) {
        combinedPath.commands.push(cmd)
      }
    }

    const advanceWidth = Math.round(info.width * globalScale)
    glyphs.push(createGlyph(info.codePoint, combinedPath, advanceWidth))
    processed++

    const hexCode = info.codePoint
      .toString(16)
      .toUpperCase()
      .padStart(5, '0')

    console.log(
      `  ${info.file} -> U+${hexCode} (${info.width.toFixed(0)}x${info.height.toFixed(0)}, advance=${advanceWidth})`,
    )
  }

  console.log(
    `\n  ${processed} glyphs, ${svgFiles.length - processed} skipped`,
  )

  const font = createFont(glyphs, {
    fontFamily: 'MarkPhaistosDisc',
    description:
      'Phaistos Disc signs mapped to the Unicode Phaistos Disc block (U+101D0-U+101FF).',
  })

  await writeFont(font, path.join(baseDir, 'MarkPhaistosDisc-Regular.otf'))

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
