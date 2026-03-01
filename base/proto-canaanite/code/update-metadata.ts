import path from 'path'
import { fileURLToPath } from 'url'
import { updateFontMetadata } from '../../../code/update-font-metadata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')
const fontPath = path.join(baseDir, 'ProtoCanaaniteMark.otf')

async function main() {
  console.log('Updating ProtoCanaaniteMark font metadata...\n')

  await updateFontMetadata(fontPath, fontPath, {
    familyName: 'ProtoCanaaniteMark',
    copyright: 'Copyright 2025 ClueSurf. All rights reserved.',
    designer: 'ClueSurf',
    designerURL: 'https://clue.surf',
    manufacturer: 'ClueSurf',
    manufacturerURL: 'https://clue.surf',
    license:
      'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
    licenseURL: 'https://openfontlicense.org',
    version: 'Version 0.1.0',
    description:
      'Proto-Canaanite script font from the Bronze Age Levant.',
    trademark: 'ProtoCanaaniteMark is a trademark of ClueSurf.',
  })

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
