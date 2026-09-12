import fs from 'fs/promises'
import opentype from 'opentype.js'

export type FontMetadata = {
  familyName?: string
  styleName?: string
  copyright?: string
  designer?: string
  designerURL?: string
  manufacturer?: string
  manufacturerURL?: string
  license?: string
  licenseURL?: string
  version?: string
  description?: string
  trademark?: string
}

export async function updateFontMetadata(
  inputPath: string,
  outputPath: string,
  metadata: FontMetadata,
) {
  const buffer = await fs.readFile(inputPath)
  const font = opentype.parse(buffer.buffer)

  const styleName = metadata.styleName ?? 'Regular'

  if (metadata.familyName) {
    font.names.fontFamily = { en: metadata.familyName }
    font.names.preferredFamily = { en: metadata.familyName }
    font.names.fontSubfamily = { en: styleName }
    font.names.preferredSubfamily = { en: styleName }
    font.names.fullName = { en: `${metadata.familyName} ${styleName}` }
    font.names.postScriptName = {
      en: `${metadata.familyName}-${styleName}`,
    }
  }

  if (metadata.copyright) {
    font.names.copyright = { en: metadata.copyright }
  }

  if (metadata.designer) {
    font.names.designer = { en: metadata.designer }
  }

  if (metadata.designerURL) {
    font.names.designerURL = { en: metadata.designerURL }
  }

  if (metadata.manufacturer) {
    font.names.manufacturer = { en: metadata.manufacturer }
  }

  if (metadata.manufacturerURL) {
    font.names.manufacturerURL = { en: metadata.manufacturerURL }
  }

  if (metadata.license) {
    font.names.license = { en: metadata.license }
  }

  if (metadata.licenseURL) {
    font.names.licenseURL = { en: metadata.licenseURL }
  }

  if (metadata.version) {
    font.names.version = { en: metadata.version }
  }

  if (metadata.description) {
    font.names.description = { en: metadata.description }
  }

  if (metadata.trademark) {
    font.names.trademark = { en: metadata.trademark }
  }

  const out = font.toArrayBuffer()
  await fs.writeFile(outputPath, Buffer.from(out))

  console.log(`Updated metadata for ${outputPath}`)
}
