import path from 'path'
import { fileURLToPath } from 'url'
import { extractMark } from '../../../code/extract-mark'

/**
 * One-off, already run (2026-11-06): write MarkGupta's signs out as
 * `base/mark/*.svg`. The font was drawn on the Brahmi block, so each
 * sign is read at its Brahmi code point (U+11004 to U+11033) and named
 * by that letter's Unicode name. Refuses to run again once
 * `base/mark` exists; the font is now built from the SVGs by
 * `make-font.ts`.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

const NAMES = [
  'upadhmaniya',
  'a',
  'aa',
  'i',
  'ii',
  'u',
  'uu',
  'vocalic-r',
  'vocalic-rr',
  'vocalic-l',
  'vocalic-ll',
  'e',
  'ai',
  'o',
  'au',
  'ka',
  'kha',
  'ga',
  'gha',
  'nga',
  'ca',
  'cha',
  'ja',
  'jha',
  'nya',
  'tta',
  'ttha',
  'dda',
  'ddha',
  'nna',
  'ta',
  'tha',
  'da',
  'dha',
  'na',
  'pa',
  'pha',
  'ba',
  'bha',
  'ma',
  'ya',
  'ra',
  'la',
  'va',
  'sha',
  'ssa',
  'sa',
  'ha',
]

/** Brahmi upadhmaniya, the first sign the font drew. */
const FIRST = 0x11004

extractMark({
  fontPath: path.join(baseDir, 'MarkGupta-Regular.otf'),
  markDir: path.join(baseDir, 'mark'),
  signs: NAMES.map((name, index) => ({
    name,
    codePoint: FIRST + index,
  })),
})
