<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>mark</h3>
<p align='center'>
  Ancient Script Fonts by ClueSurf
</p>

<br/>
<br/>
<br/>

## Introduction

**Mark** is a collection of high quality free fonts for ancient and
historical writing systems. Each font preserves the visual character of
its source script while making it accessible as a standard OpenType
font.

## Code points

Every sign of every Mark font sits on its own code point in Unicode's
plane 15 private use area (U+F0000 to U+FFFFD). No sign is on a real
Unicode character, so a sign copied out of a Mark font never pastes as
another script's letter (the fonts once borrowed Egyptian hieroglyphs,
Hangul and Linear B), and two Mark fonts never share a point. A private
use point means something only in its font, so text written in one
should keep each sign's name beside it.

The points are fixed in [`code-points.json`](./code-points.json), keyed
`<font>/<sign name>` (the sign name is its drawing's file name in
`base/<font>/base/mark/`). The file is append-only: a new drawing takes
the next free point, and a point is never moved or reused. Each font's
`base/mapping.json` lists its signs and points in sign order, and its
`test/grid.html` shows every sign with its name and point on hover.

| font | signs | code points |
| :--- | :---- | :---------- |
| aztec-hieroglyph | 34 | U+F0000 to U+F0021 |
| bronze-script | 1326 | U+F0022 to U+F054F |
| cascajal | 62 | U+F0550 to U+F058D |
| isthmian-script | 185 | U+F058E to U+F0646 |
| mayan-hieroglyph | 1092 | U+F0647 to U+F0A92 |
| oracle-bone | 734 | U+F0A93 to U+F0D70 |
| phaistos-disk | 48 | U+F0D71 to U+F0DA1 |
| proto-elamite | 1329 | U+F0DA2 to U+F12D2 |
| rongorongo | 601 | U+F12D3 to U+F152C |
| byblos-script | 114 | U+F152D to U+F159E |
| gupta | 48 | U+F159F to U+F15CE |
| indus-script | 417 | U+F15CF to U+F176F |
| proto-canaanite | 21 | U+F1770 to U+F1784 |
| proto-sinaitic | 27 | U+F1785 to U+F179F |

## Build

```bash
pnpm assign --write    # a point for each new drawing, never moving one
pnpm make:fonts        # every font, or: pnpm make:fonts rongorongo
pnpm make:grids        # each font's test/grid.html
pnpm make:readmes      # each font's readme Font section
pnpm check:fonts       # every glyph on its point, all in plane 15
```

## Fonts

| font                                        | script                      | era              | region        | status |
| :------------------------------------------ | :-------------------------- | :--------------- | :------------ | :----- |
| [oracle-bone](./base/oracle-bone)           | Oracle bone script (甲骨文) | ~1200-1000 BCE   | China         | ✅     |
| [bronze-script](./base/bronze-script)       | Bronze inscriptions (金文)  | ~1000-700 BCE    | China         | ✅     |
| [proto-sinaitic](./base/proto-sinaitic)     | Proto-Sinaitic              | ~1800 BCE        | Levant        | ✅     |
| [proto-canaanite](./base/proto-canaanite)   | Proto-Canaanite             | ~1600-1200 BCE   | Levant        | ✅     |
| [phaistos-disk](./base/phaistos-disk)       | Phaistos Disc signs         | ~1700 BCE        | Crete         | ✅     |
| [mayan-hieroglyph](./base/mayan-hieroglyph) | Mayan hieroglyphs           | ~300 BCE-1500 CE | Mesoamerica   | ✅     |
| [gupta](./base/gupta)                       | Gupta script                | ~320-550 CE      | India         | ✅     |
| [aztec-hieroglyph](./base/aztec-hieroglyph) | Aztec hieroglyphs           | ~1300-1521 CE    | Mesoamerica   | ✅     |
| [rongorongo](./base/rongorongo)             | Rongorongo                  | ~1200-1860 CE    | Easter Island | ✅     |
| [cascajal](./base/cascajal)                 | Cascajal Block signs        | ~900 BCE         | Mesoamerica   | ✅     |
| [isthmian-script](./base/isthmian-script)   | Isthmian script             | ~500 BCE-500 CE  | Mesoamerica   | ✅     |
| [proto-elamite](./base/proto-elamite)       | Proto-Elamite               | ~3100-2900 BCE   | Iran          | ✅     |
| [indus-script](./base/indus-script)         | Indus / Harappan            | ~2600-1900 BCE   | Indus Valley  | ✅     |
| [byblos-script](./base/byblos-script)       | Byblos syllabary            | ~2000-1500 BCE   | Levant        | ✅     |
| naxi-dongba                                 | Naxi Dongba                 | ~7th C CE-now    | China         | TODO   |
| cretan-hieroglyph                           | Cretan hieroglyphs          | ~2100-1700 BCE   | Crete         | TODO   |
| linear-elamite                              | Linear Elamite              | ~2300-2000 BCE   | Iran          | TODO   |
| zapotec                                     | Zapotec script              | ~500 BCE-800 CE  | Mesoamerica   | TODO   |
| mixtec                                      | Mixtec script               | ~1000-1500 CE    | Mesoamerica   | TODO   |
| teotihuacan                                 | Teotihuacan glyphs          | ~100-550 CE      | Mesoamerica   | TODO   |
| hieratic                                    | Hieratic                    | ~3200 BCE-300 CE | Egypt         | TODO   |
| demotic                                     | Demotic                     | ~650 BCE-450 CE  | Egypt         | TODO   |
| nsibidi                                     | Nsibidi                     | ~500 CE-now      | West Africa   | TODO   |
| woleai                                      | Woleai / Caroline Is.       | ~1900 CE         | Micronesia    | TODO   |
| vinca-symbol                                | Vinča / Danube symbols      | ~5300-4000 BCE   | SE Europe     | TODO   |
| jiahu-symbol                                | Jiahu symbols               | ~6600 BCE        | China         | TODO   |
| dispilio                                    | Dispilio tablet             | ~5200 BCE        | Greece        | TODO   |
| northeastern-iberian                        | NE Iberian                  | ~500-100 BCE     | Iberia        | TODO   |
| tartessian                                  | Tartessian (SW)             | ~700-500 BCE     | Iberia        | TODO   |

## Structure

Each font lives in `./base/<name>/` with a consistent layout:

```
base/<name>/
  base/           font files (.otf/.ttf) and SVG source glyphs
  code/           build scripts (make-font.ts, etc.)
  license.md      OFL license
  readme.md       font-specific documentation
```

## License

[OFL](./base/oracle-bone/license.md)

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe.
