import path from 'path'
import { fileURLToPath } from 'url'
import { makeFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkOracleBone from `base/mark/*.svg`. Each file is named by
 * the modern character it is read as (甲, 骨), and is drawn on its plane
 * 15 private use code point in `code-points.json`, never on that
 * character, so a copied sign is not mistaken for the modern one.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const mapping = await makeFont({
    font: 'oracle-bone',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkOracleBone-Regular.otf'),
    fontFamily: 'MarkOracleBone',
    description:
      'Chinese oracle bone (甲骨文) signs, each on its own plane 15 private use code point.',
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
