import path from 'path'
import { fileURLToPath } from 'url'
import { makeFont } from '../../../code/make-font'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  console.log('Generating OracleBoneMark font...\n')

  await makeFont({
    svgDir: path.join(baseDir, 'mark'),
    outputPath: path.join(baseDir, 'OracleBoneMark.otf'),
    fontFamily: 'OracleBoneMark',
    description: 'Ancient Chinese oracle bone (甲骨文) script font.',
  })

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
