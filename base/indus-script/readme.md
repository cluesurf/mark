<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>indus-script</h3>
<p align='center'>
  An Indus (Harappan) Script Font
</p>

<br/>
<br/>
<br/>

## Introduction

**MarkIndusScript** preserves the signs of the
[Indus script](https://en.wikipedia.org/wiki/Indus_script), also known
as the **Harappan** script, used across the cities of the Indus Valley
Civilization between roughly **2600 and 1900 BCE**. The signs survive
mostly on small stamp seals, sealings, and copper tablets, usually in
short inscriptions of only a handful of characters.

The script remains **undeciphered**. No bilingual key has ever been
found, the underlying language is unknown, and the corpus is made up of
very short texts. Whether it encodes a full language, a proto-writing
system, or something else is still debated, making it one of the great
undeciphered scripts of the ancient world.

## Background

Each glyph is a **cleaned and redrawn** version of a sign from
Mahadevan's concordance, chosen to convey the essential shape of the
sign rather than reproduce every carved variation. Indus signs vary
widely in proportion, with some tall and narrow, others wide and squat.
The font preserves these natural proportions, scaling each glyph
uniformly by height and adjusting its advance width to match.

It's not meant as an academic reconstruction, but as a **visual
bridge**, a way to appreciate the ancient aesthetic and spirit of the
Indus Valley without getting lost in the technical layers of its
decipherment debates.

## Source

The sign inventory and concordance follow Iravatham Mahadevan's standard
reference work:

- Iravatham Mahadevan, _The Indus Script: Text, Concordance and Tables_
  (Archaeological Survey of India, Memoirs no. 77, 1977).
  [PDF](https://ia800704.us.archive.org/19/items/TheIndusScript.TextConcordanceAndTablesIravathanMahadevan/The%20Indus%20Script.%20Text%2C%20Concordance%20and%20Tables%20-Iravathan%20Mahadevan.pdf)

Mahadevan's catalog documents 417 distinct signs across the known
inscriptions and is the basis for the sign numbering used here.

## Font

| font family | signs | code points |
| :---------- | :---- | :---------- |
| `MarkIndusScript` | 417 | U+F15CF to U+F176F |

Every sign sits on its own code point in Unicode's plane 15 private use
area. No sign is on a real Unicode character, so a sign copied out of
this font never pastes as another script's letter, and no other font
draws one by mistake. A private use point means something only in this
font: text written in it should keep each sign's name beside it.

The points are fixed in [`code-points.json`](../../code-points.json) at
the package root, keyed `indus-script/<sign name>`, and never move. Each
sign's name and point are in [`./base/mapping.json`](./base/mapping.json),
in sign order. Signs are named by number in Mahadevan's 1977 concordance (`1` to `417`). The script is undeciphered: the names are not readings.

To type or copy a sign, find its name in `mapping.json` and write its
point in text set in `MarkIndusScript`: `1` is U+F15CF, written
`&#xF15CF;` in HTML or `'\u{F15CF}'` in JavaScript. Or open [`./test/grid.html`](./test/grid.html)
in a browser, which shows every sign with its name and point on hover,
and copy from there.

Fonts are in the
[`./base`](https://github.com/cluesurf/mark/tree/make/base/indus-script/base)
folder (`MarkIndusScript-Regular.otf`), built from the
drawings in [`./base/mark`](./base/mark) by
[`./code/make-font.ts`](./code/make-font.ts). From the package root:

```bash
pnpm assign --write          # a point for each new drawing, never moving one
pnpm make:fonts indus-script
pnpm make:grids
pnpm make:readmes
pnpm check:fonts             # every glyph on its manifest point, all in plane 15
```

## Glyphs

<p align='center'>
  <img src='https://github.com/cluesurf/mark/blob/make/base/indus-script/view/list.png?raw=true'>
</p>

## License

[OFL](./license.md)

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
