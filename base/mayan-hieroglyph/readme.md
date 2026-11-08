<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>mayan-hieroglyph</h3>
<p align='center'>
  A Mayan Hieroglyphic Font
</p>

<br/>
<br/>
<br/>

## Introduction

**MarkMayanHieroglyph** traces the celestial rhythm that guided the scribes,
priests, and astronomers of the ancient Maya. It remembers a world
measured not in years but in cycles, the turning of the moon, the return
of Venus, the dance of shadow and illumination across the heavens. Each
glyph is a fragment of that cosmic calendar, a vessel of meaning shaped
by ritual, vision, and time itself.

## Background

**Mayan** hieroglyphic script stands among the most intricate writing
systems of the ancient world. Carved into jade, painted on codices, and
incised into temple walls, it flourished between roughly **300 BCE and
1500 CE**, spanning over a thousand years. Each glyph intertwined sound,
image, and number, a fusion of language and the hidden realms that
mirrored the structure of the universe itself.

For the Maya, **writing, astronomy, and divinity were inseparable**.
Priests and scribes, often one and the same, charted the heavens to
guide ritual life, record dynasties, and synchronize human order with
the hidden systems deep inside the universe. Time was sacred and cyclic,
governed by the interplay of sun, moon, and Venus.

## Background on the Font

**MarkMayanHieroglyph** is a collection of over **1,000 Maya hieroglyphs**, redrawn
from the great work of a few people curating everything for the
[famsi.org dictionary project](http://www.famsi.org/mayawriting/dictionary.htm)
(FAMSI, Foundation for the Advancement of Mesoamerican Studies, Inc.).
Their drawings came from monumental inscriptions, codices, and scholarly
reconstructions. MarkMayanHieroglyph makes these unified and accessible.

Each glyph has been cleaned, balanced, and redrawn to preserve its
structure and ultimately to unify the stuff and make it easy to access.

## Font

| font family | signs | code points |
| :---------- | :---- | :---------- |
| `MarkMayanHieroglyph` | 1092 | U+F0647 to U+F0A92 |

Every sign sits on its own code point in Unicode's plane 15 private use
area. No sign is on a real Unicode character, so a sign copied out of
this font never pastes as another script's letter, and no other font
draws one by mistake. A private use point means something only in this
font: text written in it should keep each sign's name beside it.

The points are fixed in [`code-points.json`](../../code-points.json) at
the package root, keyed `mayan-hieroglyph/<sign name>`, and never move. Each
sign's name and point are in [`./base/mapping.json`](./base/mapping.json),
in sign order. Signs are named by catalogue number and transliteration (`32-AJAW`). 8 assigned signs have no drawing yet (`0-ma`, `17-JO`, `19-WAXAK`, `35-B{}ULUK`, `41-OX`, `49-CHAN$KAN`, `51-JUN`, `8-CHA$KA`), so the font has no glyph for them.

To type or copy a sign, find its name in `mapping.json` and write its
point in text set in `MarkMayanHieroglyph`: `0--il` is U+F0647, written
`&#xF0647;` in HTML or `'\u{F0647}'` in JavaScript. Or open [`./test/grid.html`](./test/grid.html)
in a browser, which shows every sign with its name and point on hover,
and copy from there.

Fonts are in the
[`./base`](https://github.com/cluesurf/mark/tree/make/base/mayan-hieroglyph/base)
folder (`MarkMayanHieroglyph-Regular.otf`), built from the
drawings in [`./base/mark`](./base/mark) by
[`./code/make-font.ts`](./code/make-font.ts). From the package root:

```bash
pnpm assign --write          # a point for each new drawing, never moving one
pnpm make:fonts mayan-hieroglyph
pnpm make:grids
pnpm make:readmes
pnpm check:fonts             # every glyph on its manifest point, all in plane 15
```

## Glyphs

<p align='center'>
  <img src='https://github.com/cluesurf/mark/blob/make/base/mayan-hieroglyph/view/list.png?raw=true'>
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
