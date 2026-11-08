import path from 'path'
import { fileURLToPath } from 'url'
import { makeViewBoxFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkGupta from `base/mark/*.svg` (letters named as the Brahmi
 * letters they correspond to, in Brahmi order), each sign on its plane
 * 15 private use code point in `code-points.json`. The SVGs came out of
 * the hand-drawn font once (`extract-mark.ts`), at its own proportions.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const mapping = await makeViewBoxFont({
    font: 'gupta',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkGupta-Regular.otf'),
    fontFamily: 'MarkGupta',
    weightClass: 400,
    roundToUnits: true,
    description:
      'Gupta script letters, each on its own plane 15 private use code point.',
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
