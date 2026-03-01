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

**Mark** is a collection of fonts for ancient and historical writing
systems, built from SVG glyph drawings and mapped to Unicode codepoints
where possible. Each font preserves the visual character of its source
script while making it accessible as a standard OpenType font.

## Fonts

| font | family | script | era | region |
| :--- | :----- | :----- | :-- | :----- |
| [oracle-bone](./base/oracle-bone) | `OracleBoneMark` | Oracle bone script (甲骨文) | ~1200-1000 BCE | China |
| [bronze-script](./base/bronze-script) | `BronzeScriptMark` | Bronze inscriptions (金文) | ~1000-700 BCE | China |
| [proto-sinaitic](./base/proto-sinaitic) | `ProtoSinaiticMark` | Proto-Sinaitic | ~1800 BCE | Sinai Peninsula |
| [proto-canaanite](./base/proto-canaanite) | `ProtoCanaaniteMark` | Proto-Canaanite | ~1600-1200 BCE | Levant |
| [phaistos-disk](./base/phaistos-disk) | `PhaistosDiscMark` | Phaistos Disc signs | ~1700 BCE | Crete |
| [mayan-hieroglyphs](./base/mayan-hieroglyphs) | `MayanHieroglyphsMark` | Mayan hieroglyphs | ~300 BCE-1500 CE | Mesoamerica |
| [gupta](./base/gupta) | `GuptaMark` | Gupta script | ~320-550 CE | India |

## Structure

Each font lives in `./base/<name>/` with a consistent layout:

```
base/<name>/
  base/           font files (.otf/.ttf) and SVG source glyphs
  code/           build scripts (make-font.ts, diff-mark.ts, etc.)
  license.md      OFL license
  readme.md       font-specific documentation
```

Shared build utilities live in `./code/`:

- `make-font.ts` - SVG-to-OpenType conversion helpers
- `diff-mark.ts` - compare CSV glyph lists against SVG directories
- `update-font-metadata.ts` - update metadata on existing font files

## License

[OFL](./base/oracle-bone/license.md)

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
