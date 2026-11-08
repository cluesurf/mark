import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { formatCodePoint, readFontCodePoints } from './code-point'

/**
 * Write the `## Font` section of every `base/<font>/readme.md` from the
 * built font: its family, how many signs it draws, its code point
 * range, what the sign names are, how to type or copy a sign, and how
 * to build it. The section is replaced whole on every run (with any
 * old `## Build` and `## Test` section, which it now holds), and
 * inserted before `## Glyphs` in a readme that has none. Run after
 * `pnpm make:fonts`.
 *
 *   pnpm make:readmes
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BASE = path.join(HERE, '..', 'base')

/** What a font's sign names are, one sentence each. */
const NAMES: Record<string, string> = {
  'aztec-hieroglyph':
    'Signs are named by the syllable each writes (`a`, `ka`, `tla`).',
  'bronze-script':
    'Signs are named by the modern Chinese character each is read as (`人`). The sign is drawn on its own private use point, never on that character.',
  'byblos-script':
    'Signs are named by group letter and number (`A.1` to `I.12`), in that order. The script is undeciphered: the names are catalogue numbers, not readings.',
  cascajal:
    'Signs are named by catalogue number. The script is undeciphered: the names are not readings.',
  gupta:
    'Letters are named as the Brahmi letters they correspond to (`a`, `ka`, `vocalic-r`), in Brahmi order.',
  'indus-script':
    "Signs are named by number in Mahadevan's 1977 concordance (`1` to `417`). The script is undeciphered: the names are not readings.",
  'isthmian-script':
    'Signs are named by catalogue number. The script is undeciphered: the names are not readings.',
  'mayan-hieroglyph':
    'Signs are named by catalogue number and transliteration (`32-AJAW`).',
  'oracle-bone':
    'Signs are named by the modern Chinese character each is read as (`人`). The sign is drawn on its own private use point, never on that character.',
  'phaistos-disk':
    "Signs are named by Evans's number (`01` to `49`). The script is undeciphered: the names are not readings.",
  'proto-canaanite':
    'Letters are named as the Phoenician letters they became (`alf`, `bet`), in alphabet order. There is no `ain`.',
  'proto-elamite':
    'Signs are named by their CDLI sign name (`M001+M379-C`). The script is undeciphered: the names are not readings.',
  'proto-sinaitic':
    'Signs are named by the Gardiner number of the Egyptian hieroglyph each is thought to come from (`F001`, the ox head), in Phoenician letter order. The font has a Regular and a Semibold, with the same signs on the same points.',
  rongorongo:
    'Signs are named by Barthel number (`001`). The script is undeciphered: the names are not readings.',
}

/** Remove a `## <title>` section, heading to the next `## `. */
function cut(text: string, title: string): { text: string; at: number } {
  const start = text.indexOf(`\n## ${title}\n`)

  if (start === -1) {
    return { text, at: -1 }
  }

  const next = text.indexOf('\n## ', start + 1)
  const end = next === -1 ? text.length : next

  return { text: text.slice(0, start) + text.slice(end), at: start }
}

for (const font of fs.readdirSync(BASE).sort()) {
  const readmePath = path.join(BASE, font, 'readme.md')
  const mappingPath = path.join(BASE, font, 'base', 'mapping.json')

  if (!fs.existsSync(readmePath) || !fs.existsSync(mappingPath)) {
    continue
  }

  const files = fs
    .readdirSync(path.join(BASE, font, 'base'))
    .filter(one => /\.(otf|ttf)$/.test(one))
    .sort()
  const family = files[0]!.replace(/-[A-Za-z]+\.(otf|ttf)$/, '')
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Array<{
    key: string
    codepoint: string
  }>
  const assigned = readFontCodePoints(font)
  const undrawn = [...assigned.keys()].filter(
    key => !mapping.some(row => row.key === key),
  )
  const first = mapping[0]!
  const last = mapping[mapping.length - 1]!
  const firstPoint = parseInt(first.codepoint.slice(2), 16)
  const hex = first.codepoint.slice(2)

  const section = `
## Font

| font family | signs | code points |
| :---------- | :---- | :---------- |
| \`${family}\` | ${mapping.length} | ${first.codepoint} to ${last.codepoint} |

Every sign sits on its own code point in Unicode's plane 15 private use
area. No sign is on a real Unicode character, so a sign copied out of
this font never pastes as another script's letter, and no other font
draws one by mistake. A private use point means something only in this
font: text written in it should keep each sign's name beside it.

The points are fixed in [\`code-points.json\`](../../code-points.json) at
the package root, keyed \`${font}/<sign name>\`, and never move. Each
sign's name and point are in [\`./base/mapping.json\`](./base/mapping.json),
in sign order. ${NAMES[font] ?? ''}${
    undrawn.length
      ? ` ${undrawn.length} assigned ${undrawn.length === 1 ? 'sign has' : 'signs have'} no drawing yet (${undrawn.map(key => `\`${key}\``).join(', ')}), so the font has no glyph for ${undrawn.length === 1 ? 'it' : 'them'}.`
      : ''
  }

To type or copy a sign, find its name in \`mapping.json\` and write its
point in text set in \`${family}\`: \`${first.key}\` is ${formatCodePoint(firstPoint)}, written
\`&#x${hex};\` in HTML or \`'\\u{${hex}}'\` in JavaScript. Or open [\`./test/grid.html\`](./test/grid.html)
in a browser, which shows every sign with its name and point on hover,
and copy from there.

Fonts are in the
[\`./base\`](https://github.com/cluesurf/mark/tree/make/base/${font}/base)
folder (${files.map(one => `\`${one}\``).join(', ')}), built from the
drawings in [\`./base/mark\`](./base/mark) by
[\`./code/make-font.ts\`](./code/make-font.ts). From the package root:

\`\`\`bash
pnpm assign --write          # a point for each new drawing, never moving one
pnpm make:fonts ${font}
pnpm make:grids
pnpm make:readmes
pnpm check:fonts             # every glyph on its manifest point, all in plane 15
\`\`\`
`

  let text = fs.readFileSync(readmePath, 'utf8')
  const font1 = cut(text, 'Font')
  text = font1.text
  text = cut(text, 'Build').text
  text = cut(text, 'Test').text

  const at =
    font1.at !== -1 ? font1.at : text.indexOf('\n## Glyphs\n')

  if (at === -1) {
    throw new Error(`${font}: no ## Font or ## Glyphs section to place it at`)
  }

  text = text.slice(0, at) + section + text.slice(at)
  fs.writeFileSync(readmePath, text)
  console.log(`  ${font}: ${mapping.length} signs, ${first.codepoint} to ${last.codepoint}`)
}
