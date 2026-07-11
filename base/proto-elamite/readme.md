<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>proto-elamite</h3>
<p align='center'>
  A Proto-Elamite Script Font
</p>

<br/>
<br/>
<br/>

## Introduction

**ProtoElamiteMark** preserves the signs of
[Proto-Elamite](https://en.wikipedia.org/wiki/Proto-Elamite), one of the
oldest writing systems in the world. It was used across the Iranian
plateau, centered on **Susa**, from roughly **3100 to 2900 BCE**,
contemporary with the proto-cuneiform tablets of Mesopotamia.

The script survives mainly on clay accounting tablets and combines
numeric signs with hundreds of distinct pictographic and abstract signs.
Despite more than a century of study it remains **largely undeciphered**.
The numeral systems are partly understood, but the underlying language
and most non-numeric signs are still unread, making Proto-Elamite one of
the great undeciphered scripts of antiquity.

## Source

The glyph shapes are derived from the **CDLI** proto-Elamite sign list:

- [cdli-gh/proto-elamite_data](https://github.com/cdli-gh/proto-elamite_data),
  © Cuneiform Digital Library Initiative (CDLI), licensed under
  [Creative Commons Attribution 4.0 International (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/).

The vector sign drawings from that corpus were converted, cleaned (a
handful carried scholarly break-hatching that was removed), and fit to a
consistent em. Each glyph keeps the corpus **M-number** as its key (for
example `M001`, `M006-B`, `M001+M379-C` for composite signs). See
[`./base/mapping.json`](./base/mapping.json) for the full
glyph-to-codepoint mapping.

## Font

| font family        | # glyphs | description         |
| :----------------- | :------- | :------------------ |
| `ProtoElamiteMark` | 1329     | Proto-Elamite signs |

Proto-Elamite has no codepoints of its own in Unicode, so the **1329
glyphs** are hosted on the precomposed **Hangul** syllables that carry a
[KS X 1001](https://en.wikipedia.org/wiki/KS_X_1001) code, taken in order
(starting at **U+AC00** `가`). The full host list is in
[`./base/hangul-ks-x-1001.csv`](./base/hangul-ks-x-1001.csv), and
[`./base/mapping.json`](./base/mapping.json) records each sign's
host codepoint.

Fonts are in the
[`./base`](https://github.com/cluesurf/mark/tree/make/base/proto-elamite/base)
folder.

## Glyphs

<p align='center'>
  <img src='https://github.com/cluesurf/mark/blob/make/base/proto-elamite/view/list.png?raw=true'>
</p>

## License

Font software: [OFL](./license.md). Glyph shapes derived from
[cdli-gh/proto-elamite_data](https://github.com/cdli-gh/proto-elamite_data)
under CC-BY-4.0 (see [`./license.md`](./license.md) for attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
