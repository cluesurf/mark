import fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function compareGlyphsWithSVGs(folderName: 'bone' | 'cast') {
  const basePath = path.join(__dirname, '..', 'base', folderName)
  const csvPath = path.join(basePath, 'mark.csv')
  const svgDirPath = path.join(basePath, 'mark')
  const todoPath = path.join(basePath, 'mark.todo.csv')

  // Step 1: Read mark.csv characters
  console.log(`Processing ${folderName}...`)
  const csvContent = await fs.readFile(csvPath, 'utf-8')
  const csvCharacters = new Set<string>()

  csvContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed) {
      csvCharacters.add(trimmed)
    }
  })

  console.log(
    `Found ${csvCharacters.size} characters in ${folderName}/mark.csv`,
  )

  // Step 2: Read all mark/*.svg files
  const svgCharacters = new Set<string>()

  try {
    const svgFiles = await fs.readdir(svgDirPath)
    svgFiles.forEach(file => {
      if (file.endsWith('.svg')) {
        const character = path.basename(file, '.svg')
        svgCharacters.add(character)
      }
    })
  } catch (error) {
    console.log(`SVG directory ${svgDirPath} does not exist`)
  }

  console.log(
    `Found ${svgCharacters.size} SVG files in ${folderName}/mark/`,
  )

  // Step 3: Find missing SVGs
  const missingCharacters: string[] = []

  csvCharacters.forEach(character => {
    if (!svgCharacters.has(character)) {
      missingCharacters.push(character)
    }
  })

  console.log(
    `Missing ${missingCharacters.length} SVG files for ${folderName}`,
  )

  // Step 4: Write missing characters to mark.todo.csv
  if (missingCharacters.length > 0) {
    await fs.writeFile(todoPath, missingCharacters.join('\n'), 'utf-8')
    console.log(`Written missing characters to ${todoPath}`)
  } else {
    console.log(`No missing SVG files for ${folderName}`)
  }

  return {
    folder: folderName,
    totalInCSV: csvCharacters.size,
    totalSVGs: svgCharacters.size,
    missingCount: missingCharacters.length,
    missingCharacters,
  }
}

async function main() {
  try {
    const boneResults = await compareGlyphsWithSVGs('bone')
    const castResults = await compareGlyphsWithSVGs('cast')

    console.log('\n=== Summary ===')
    console.log(
      `Bone: ${boneResults.missingCount} missing SVGs out of ${boneResults.totalInCSV} characters`,
    )
    console.log(
      `Cast: ${castResults.missingCount} missing SVGs out of ${castResults.totalInCSV} characters`,
    )
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
main()
