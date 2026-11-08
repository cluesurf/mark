import path from 'path'
import { fileURLToPath } from 'url'
import { makeViewBoxFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkProtoSinaitic Regular and Semibold from `base/mark/*.svg`
 * and `base/mark-semibold/*.svg` (the 27 signs, named by the Gardiner
 * number of the Egyptian hieroglyph each is thought to come from, in
 * Phoenician letter order). Both weights put each sign on the same
 * plane 15 private use code point in `code-points.json`. The SVGs came
 * out of the hand-drawn fonts once (`extract-mark.ts`), at their own
 * proportions.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

const DESCRIPTION =
  'Proto-Sinaitic signs, each on its own plane 15 private use code point.'

async function main() {
  const mapping = await makeViewBoxFont({
    font: 'proto-sinaitic',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkProtoSinaitic-Regular.ttf'),
    fontFamily: 'MarkProtoSinaitic',
    weightClass: 400,
    description: DESCRIPTION,
    roundToUnits: true,
  })

  await makeViewBoxFont({
    font: 'proto-sinaitic',
    svgDir: path.join(baseDir, 'mark-semibold'),
    outputPath: path.join(baseDir, 'MarkProtoSinaitic-Semibold.ttf'),
    fontFamily: 'MarkProtoSinaitic',
    styleName: 'Semibold',
    weightClass: 600,
    description: DESCRIPTION,
    roundToUnits: true,
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
