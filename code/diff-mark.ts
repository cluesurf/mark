import fs from 'fs/promises'
import path from 'path'

export type DiffMarkOptions = {
  csvPath: string
  svgDir: string
  todoPath: string
  label: string
}

export type DiffMarkResult = {
  label: string
  totalInCSV: number
  totalSVGs: number
  missingCount: number
  missingCharacters: Array<string>
}

export async function diffMark(
  options: DiffMarkOptions,
): Promise<DiffMarkResult> {
  const { csvPath, svgDir, todoPath, label } = options

  console.log(`Processing ${label}...`)
  const csvContent = await fs.readFile(csvPath, 'utf-8')
  const csvCharacters = new Set<string>()

  csvContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed) {
      csvCharacters.add(trimmed)
    }
  })

  console.log(`Found ${csvCharacters.size} characters in ${csvPath}`)

  const svgCharacters = new Set<string>()

  try {
    const svgFiles = await fs.readdir(svgDir)
    svgFiles.forEach(file => {
      if (file.endsWith('.svg')) {
        const character = path.basename(file, '.svg')
        svgCharacters.add(character)
      }
    })
  } catch {
    console.log(`SVG directory ${svgDir} does not exist`)
  }

  console.log(`Found ${svgCharacters.size} SVG files in ${svgDir}`)

  const missingCharacters: Array<string> = []

  csvCharacters.forEach(character => {
    if (!svgCharacters.has(character)) {
      missingCharacters.push(character)
    }
  })

  console.log(`Missing ${missingCharacters.length} SVG files for ${label}`)

  if (missingCharacters.length > 0) {
    await fs.writeFile(todoPath, missingCharacters.join('\n'), 'utf-8')
    console.log(`Written missing characters to ${todoPath}`)
  } else {
    console.log(`No missing SVG files for ${label}`)
  }

  return {
    label,
    totalInCSV: csvCharacters.size,
    totalSVGs: svgCharacters.size,
    missingCount: missingCharacters.length,
    missingCharacters,
  }
}
