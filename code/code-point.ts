import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Where every Mark sign lives: one private use code point in plane 15
 * (U+F0000 to U+FFFFD) per sign, keyed `<font folder>/<sign name>`, the
 * sign name being its SVG file name in `base/<font>/base/mark/`.
 *
 * This file is the one source. Every font is built on it
 * (`codePointOf` below), and the ClueSurf symbol rows are seeded from
 * a copy of it. It is APPEND-ONLY: `assign-code-points.ts` gives a new
 * sign the next free point and never moves one already given, because
 * a moved point would make every text written with the old one show
 * another sign.
 *
 * No sign sits on a real Unicode character. Before 2026-11 the fonts
 * borrowed real blocks (Rongorongo on Egyptian hieroglyphs, Mayan on
 * Hangul, Isthmian on Linear B), so a copied sign pasted as the wrong
 * character everywhere else.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const MANIFEST_PATH = path.join(HERE, '..', 'code-points.json')

/** First code point of plane 15, the supplementary private use area. */
export const PLANE_15_START = 0xf0000

/** Last usable one. The final two of the plane are noncharacters. */
export const PLANE_15_END = 0xffffd

export type CodePointManifest = Record<string, number>

export function readManifest(): CodePointManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return {}
  }

  return JSON.parse(
    fs.readFileSync(MANIFEST_PATH, 'utf8'),
  ) as CodePointManifest
}

/** The signs of one font, sign name to code point, in code point order. */
export function readFontCodePoints(font: string): Map<string, number> {
  const prefix = `${font}/`
  const entries = Object.entries(readManifest())
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, point]): [string, number] => [
      key.slice(prefix.length),
      point,
    ])
    .sort((a, b) => a[1] - b[1])

  return new Map(entries)
}

/**
 * The code point of one sign. Throws when the sign has none, so a font
 * is never built with a sign the manifest does not place: run
 * `pnpm assign` first.
 */
export function codePointOf(
  points: Map<string, number>,
  font: string,
  name: string,
): number {
  const point = points.get(name)

  if (point === undefined) {
    throw new Error(
      `${font}/${name} has no code point in code-points.json, run pnpm assign --write`,
    )
  }

  return point
}

/** `U+F12D3` */
export function formatCodePoint(point: number): string {
  return `U+${point.toString(16).toUpperCase().padStart(4, '0')}`
}
