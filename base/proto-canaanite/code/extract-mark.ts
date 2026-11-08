import path from 'path'
import { fileURLToPath } from 'url'
import { extractMark } from '../../../code/extract-mark'

/**
 * One-off, already run (2026-11-06): write MarkProtoCanaanite's signs
 * out as `base/mark/*.svg`. The font was drawn on the Phoenician block,
 * so each sign is read at its Phoenician code point and named by that
 * letter's Unicode name. The font has no ain (U+1090F). Refuses to run
 * again once `base/mark` exists; the font is now built from the SVGs
 * by `make-font.ts`.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

const SIGNS: Array<[string, number]> = [
  ['alf', 0x10900],
  ['bet', 0x10901],
  ['gaml', 0x10902],
  ['delt', 0x10903],
  ['he', 0x10904],
  ['wau', 0x10905],
  ['zai', 0x10906],
  ['het', 0x10907],
  ['tet', 0x10908],
  ['yod', 0x10909],
  ['kaf', 0x1090a],
  ['lamd', 0x1090b],
  ['mem', 0x1090c],
  ['nun', 0x1090d],
  ['semk', 0x1090e],
  ['pe', 0x10910],
  ['sade', 0x10911],
  ['qof', 0x10912],
  ['rosh', 0x10913],
  ['shin', 0x10914],
  ['tau', 0x10915],
]

extractMark({
  fontPath: path.join(baseDir, 'MarkProtoCanaanite-Regular.otf'),
  markDir: path.join(baseDir, 'mark'),
  signs: SIGNS.map(([name, codePoint]) => ({ name, codePoint })),
})
