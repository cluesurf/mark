import { promises as fs } from 'fs'
import path from 'path'

async function normalizeSvgFileNames(directory: string): Promise<void> {
  try {
    const files = await fs.readdir(directory)

    for (const file of files) {
      // Only process SVG files
      if (!file.endsWith('.svg')) continue

      // Remove number prefix patterns like "261. ", "261.", "261 ", etc.
      // This regex handles various messy formats
      const normalizedName = file.replace(/^\d+\.?\s*/g, '')

      // Skip if the name didn't change
      if (normalizedName === file) continue

      const oldPath = path.join(directory, file)
      const newPath = path.join(directory, normalizedName)

      // Check if target file already exists
      try {
        await fs.access(newPath)
        // console.warn(
        //   `Skipping ${file}: Target file ${normalizedName} already exists`,
        // )
        continue
      } catch {
        // File doesn't exist, safe to rename
      }

      // Rename the file
      await fs.rename(oldPath, newPath)
      console.log(`Renamed: ${file} -> ${normalizedName}`)
    }

    console.log('File normalization complete!')
  } catch (error) {
    console.error('Error normalizing file names:', error)
    process.exit(1)
  }
}

// Check if directory argument is provided
if (process.argv.length < 3) {
  console.error(
    'Usage: ts-node normalize-svg-file-names.ts <directory>',
  )
  process.exit(1)
}

const directory = process.argv[2]
normalizeSvgFileNames(directory)
