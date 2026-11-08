import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Write `base/<font>/test/grid.html` for every Mark font: each sign the
 * font draws, from its `mapping.json`, set in the built font, with its
 * name and code point on hover. Open the file in a browser to see the
 * whole font. Run after `pnpm make:fonts`.
 *
 *   pnpm make:grids
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BASE = path.join(HERE, '..', 'base')

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

for (const font of fs.readdirSync(BASE).sort()) {
  const dir = path.join(BASE, font, 'base')
  const mappingPath = path.join(dir, 'mapping.json')

  if (!fs.existsSync(mappingPath)) {
    continue
  }

  const file = fs
    .readdirSync(dir)
    .filter(one => /-Regular\.(otf|ttf)$/.test(one))[0]

  if (!file) {
    continue
  }

  const family = file.replace(/-Regular\.(otf|ttf)$/, '')
  const format = file.endsWith('.ttf') ? 'truetype' : 'opentype'
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Array<{
    key: string
    codepoint: string
  }>
  const first = mapping[0]?.codepoint ?? ''
  const last = mapping[mapping.length - 1]?.codepoint ?? ''

  const cells = mapping
    .map(({ key, codepoint }) => {
      const character = String.fromCodePoint(
        parseInt(codepoint.slice(2), 16),
      )

      return `<span title="${escape(key)} ${codepoint}">${character}</span>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${family} Grid</title>
    <!-- Written by code/make-grids.ts from base/mapping.json. Do not edit. -->
    <style>
      @font-face {
        font-family: '${family}';
        src: url('../base/${file}') format('${format}');
        font-weight: normal;
        font-style: normal;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: #fff;
      }

      .section-label {
        font-family: sans-serif;
        font-size: 14px;
        color: #71717a;
        padding: 16px 8px 8px 8px;
        text-align: center;
      }

      .grid {
        display: flex;
        flex-wrap: wrap;
        line-height: 1;
        width: 840px;
        margin: 0 auto;
      }

      .grid span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 36px;
        color: #18181b;
        font-family: '${family}', sans-serif;
      }
    </style>
  </head>
  <body>
    <div class="section-label">
      ${family}: ${mapping.length} signs, plane 15 private use, ${first} to ${last}
    </div>
    <div class="grid">${cells}</div>
  </body>
</html>
`

  fs.writeFileSync(path.join(BASE, font, 'test', 'grid.html'), html)
  console.log(`  ${font}: ${mapping.length} signs -> test/grid.html`)
}
