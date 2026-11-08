import path from 'path'
import { fileURLToPath } from 'url'
import { makeFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkMayanHieroglyph from `base/mark/*.svg` (square 3000 unit
 * drawings named by catalogue number), each sign on its plane 15
 * private use code point in `code-points.json`.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const mapping = await makeFont({
    font: 'mayan-hieroglyph',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkMayanHieroglyph-Regular.otf'),
    fontFamily: 'MarkMayanHieroglyph',
    description:
      'Mayan hieroglyphic signs, each on its own plane 15 private use code point.',
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
