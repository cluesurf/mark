import path from 'path'
import { fileURLToPath } from 'url'
import { diffMark } from '../../../code/diff-mark'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  const result = await diffMark({
    csvPath: path.join(baseDir, 'mark.csv'),
    svgDir: path.join(baseDir, 'mark'),
    todoPath: path.join(baseDir, 'mark.todo.csv'),
    label: 'oracle-bone',
  })

  console.log('\n=== Summary ===')
  console.log(
    `Oracle bone: ${result.missingCount} missing SVGs out of ${result.totalInCSV} characters`,
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
