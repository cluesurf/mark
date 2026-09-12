import path from 'path'
import { fileURLToPath } from 'url'
import { updateFontMetadata } from '../../../code/update-font-metadata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseDir = path.join(__dirname, '..', 'base')

async function main() {
  console.log('Updating MarkProtoSinaitic font metadata...\n')

  await updateFontMetadata(
    path.join(baseDir, 'MarkProtoSinaitic-Regular.ttf'),
    path.join(baseDir, 'MarkProtoSinaitic-Regular.ttf'),
    {
      familyName: 'MarkProtoSinaitic',
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
      description:
        'Proto-Sinaitic script font, one of the earliest alphabets.',
      trademark: 'MarkProtoSinaitic is a trademark of ClueSurf.',
    },
  )

  await updateFontMetadata(
    path.join(baseDir, 'MarkProtoSinaitic-Semibold.ttf'),
    path.join(baseDir, 'MarkProtoSinaitic-Semibold.ttf'),
    {
      familyName: 'MarkProtoSinaitic',
      styleName: 'Semibold',
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
        'Proto-Sinaitic script font, one of the earliest alphabets.',
      trademark: 'MarkProtoSinaitic is a trademark of ClueSurf.',
    },
  )

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
