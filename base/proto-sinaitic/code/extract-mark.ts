import path from 'path'
import { fileURLToPath } from 'url'
import { extractMark } from '../../../code/extract-mark'

/**
 * One-off, already run (2026-11-06): write MarkProtoSinaitic's 27 signs
 * out as SVGs, Regular to `base/mark`, Semibold to `base/mark-semibold`.
 * The fonts were drawn on the Egyptian hieroglyph each sign is thought
 * to come from, so each sign is read at that code point and named by
 * its Gardiner number, in the order of the table in `readme.md`
 * (Phoenician letter order). Nothing else in the fonts was a sign: the
 * Latin glyphs were left over from the drawing template. Refuses to run
 * again once the folders exist; the fonts are now built from the SVGs
 * by `make-font.ts`.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

const SIGNS: Array<[string, number]> = [
  ['F001', 0x130fe],
  ['O001', 0x13250],
  ['O004', 0x13254],
  ['T014', 0x13319],
  ['K005', 0x1319f],
  ['A028', 0x13020],
  ['T003', 0x13309],
  ['Z016A', 0x13405],
  ['O006', 0x13257],
  ['V028', 0x1339b],
  ['F035', 0x13124],
  ['D036', 0x1309d],
  ['D046', 0x130a7],
  ['V001', 0x13362],
  ['N035', 0x13216],
  ['I010', 0x13193],
  ['D004', 0x13079],
  ['D021', 0x1308b],
  ['A002', 0x13001],
  ['D025', 0x1308f],
  ['O038', 0x1328b],
  ['M022', 0x131d1],
  ['E036', 0x130fb],
  ['D001', 0x13076],
  ['N006', 0x131f4],
  ['T010', 0x13314],
  ['Z009', 0x133f4],
]

const signs = SIGNS.map(([name, codePoint]) => ({ name, codePoint }))

extractMark({
  fontPath: path.join(baseDir, 'MarkProtoSinaitic-Regular.ttf'),
  markDir: path.join(baseDir, 'mark'),
  signs,
})

extractMark({
  fontPath: path.join(baseDir, 'MarkProtoSinaitic-Semibold.ttf'),
  markDir: path.join(baseDir, 'mark-semibold'),
  signs,
})
