import { readdir, rename } from 'fs/promises'
import { join } from 'path'

async function fixFileNames() {
  const directory = './base/mark'

  try {
    const files = await readdir(directory)
    const svgFiles = files.filter(file => file.endsWith('.svg'))

    for (const file of svgFiles) {
      if (file.includes('я')) {
        const newName = file.replace(/я/g, '@')
        const oldPath = join(directory, file)
        const newPath = join(directory, newName)

        await rename(oldPath, newPath)
        console.log(`Renamed: ${file} -> ${newName}`)
      }
    }

    console.log('File renaming complete!')
  } catch (error) {
    console.error('Error:', error)
  }
}

fixFileNames()
