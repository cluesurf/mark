import path from 'path'
import { fileURLToPath } from 'url'
import { updateFontMetadata } from '../../../code/update-font-metadata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')
const fontPath = path.join(baseDir, 'MarkGupta-Regular.otf')

async function main() {
  console.log('Updating MarkGupta font metadata...\n')

  await updateFontMetadata(fontPath, fontPath, {
    familyName: 'MarkGupta',
    styleName: 'Regular',
    copyright: 'Copyright 2025 ClueSurf. All rights reserved.',
    designer: 'ClueSurf',
    designerURL: 'https://clue.surf',
    manufacturer: 'ClueSurf',
    manufacturerURL: 'https://clue.surf',
    license:
      'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
    licenseURL: 'https://openfontlicense.org',
    version: 'Version 0.1.0',
    description: 'Gupta Empire script font from classical India.',
    trademark: 'MarkGupta is a trademark of ClueSurf.',
  })

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
