<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>byblos-script</h3>
<p align='center'>
  A Byblos Syllabary Font
</p>

<br/>
<br/>
<br/>

## Introduction

**ByblosScriptMark** preserves the signs of the
[Byblos syllabary](https://en.wikipedia.org/wiki/Byblos_syllabary), the
script also called **pseudo-hieroglyphic** for the way its shapes echo
Egyptian hieroglyphs without behaving like them. It was written in the
Phoenician port city of Byblos, modern Jbeil in Lebanon, between roughly
**2000 and 1500 BCE**.

The script survives on a very small set of objects. Bronze tablets,
bronze spatulas, and a handful of stone fragments, most of them
recovered from the Byblos excavations. That thin corpus is the whole
reason the script is still **undeciphered**. There is no bilingual key,
and the surviving texts are too short to give the repetitions a
decipherment needs.

Byblos sits at the exact spot where writing turned a corner. Egyptian
hieroglyphs were the visual model, the Levant was the ground where the
alphabet would be invented a few centuries later, and this script is the
middle term. Its shapes are Egyptian, its inventory is not.

## Background

Each glyph is a **cleaned and redrawn** version of a sign from the
Byblos corpus, keyed by the group letter and number used to catalogue
it, from `A.1` through `I.12`. Byblos signs vary widely in proportion,
with some tall and narrow, others wide and squat. The font preserves
these natural proportions, scaling each glyph uniformly by height and
adjusting its advance width to match.

It's not meant as an academic reconstruction, but as a **visual
bridge**, a way to appreciate the aesthetic and spirit of Byblos writing
without getting lost in the technical layers of its decipherment
debates.

## Source

The corpus and sign catalogue follow Maurice Dunand's excavation
publication, still the standard reference:

- Maurice Dunand, _Byblia Grammata: Documents et recherches sur le
  développement de l'écriture en Phénicie_ (Beirut, 1945).

Dunand excavated Byblos through the late 1920s and 1930s and gathered
the pseudo-hieroglyphic documents into a single catalogue. The sign
count is the key fact about the script. Around **a hundred distinct
signs** is far too many for an alphabet and far too few for a
logographic system like Egyptian, which is why the script is generally
read as a **syllabary**.

## Signs

The 114 signs are grouped by shape family, following the lettered
catalogue:

| group | # signs | keys         |
| :---- | :------ | :----------- |
| `A`   | 21      | `A.1`-`A.21` |
| `B`   | 13      | `B.1`-`B.13` |
| `C`   | 2       | `C.1`-`C.2`  |
| `D`   | 9       | `D.1`-`D.9`  |
| `E`   | 26      | `E.1`-`E.26` |
| `F`   | 6       | `F.1`-`F.6`  |
| `G`   | 17      | `G.1`-`G.17` |
| `H`   | 8       | `H.1`-`H.8`  |
| `I`   | 12      | `I.1`-`I.12` |

## Font

| font family        | # glyphs | description      |
| :----------------- | :------- | :--------------- |
| `ByblosScriptMark` | 114      | Byblos syllabary |

The **114 glyphs** are mapped sequentially to the
[Egyptian Hieroglyphs](<https://en.wikipedia.org/wiki/Egyptian_Hieroglyphs_(Unicode_block)>)
Unicode block, starting at **U+13000** and running through **U+13071**.
The Byblos syllabary has no codepoints of its own in Unicode, so this
range was chosen as a host, fitting given that Egyptian hieroglyphs were
the visual model for the script. Glyphs are ordered by group letter then
by number, so `A.9` precedes `A.10`. See
[`./base/mapping.json`](./base/mapping.json) for the full
glyph-to-codepoint mapping.

Fonts are in the
[`./base`](https://github.com/cluesurf/mark/tree/make/base/byblos-script/base)
folder.

## Glyphs

<p align='center'>
  <img src='https://github.com/cluesurf/mark/blob/make/base/byblos-script/view/list.png?raw=true'>
</p>

## Build

```bash
pnpm tsx base/byblos-script/code/make-font.ts
```

This reads the SVGs in [`./base/mark`](./base/mark) and writes
`./base/ByblosScriptMark.otf` alongside `./base/mapping.json`.

## Test

Open [`./test/grid.html`](./test/grid.html) in a browser to see every
glyph rendered from the built font, each cell titled with its codepoint.

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
