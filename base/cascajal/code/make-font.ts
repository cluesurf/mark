import path from 'path'
import { fileURLToPath } from 'url'
import { makeViewBoxFont, writeMapping } from '../../../code/make-font'

/**
 * Build MarkCascajal from `base/mark/*.svg` (the Cascajal Block signs,
 * by number), each sign on its plane 15 private use code point in
 * `code-points.json`. The SVGs share one height and vary in width, so
 * the height fills the em and the width sets the advance.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const mapping = await makeViewBoxFont({
    font: 'cascajal',
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'MarkCascajal-Regular.otf'),
    fontFamily: 'MarkCascajal',
    description:
      'Cascajal Block signs, each on its own plane 15 private use code point.',
  })

  await writeMapping(baseDir, mapping)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
