import path from 'path'
import { fileURLToPath } from 'url'
import { makeViewBoxFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkProtoCanaanite from `base/mark/*.svg` (letters named as the
 * Phoenician letters they became, in alphabet order), each sign on its
 * plane 15 private use code point in `code-points.json`. The SVGs came
 * out of the hand-drawn font once (`extract-mark.ts`), at its own
 * proportions.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const mapping = await makeViewBoxFont({
    font: 'proto-canaanite',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkProtoCanaanite-Regular.otf'),
    fontFamily: 'MarkProtoCanaanite',
    weightClass: 400,
    roundToUnits: true,
    description:
      'Proto-Canaanite letters, each on its own plane 15 private use code point.',
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
