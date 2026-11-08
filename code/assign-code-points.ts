import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  MANIFEST_PATH,
  PLANE_15_END,
  PLANE_15_START,
  formatCodePoint,
  readManifest,
} from './code-point'

/**
 * Give every sign in `base/<font>/base/mark/*.svg` a plane 15 private
 * use code point, in `code-points.json`.
 *
 * APPEND-ONLY. A sign already in the file keeps its point. New signs
 * take the next free points after the highest one, a font at a time, in
 * sign order: the order `base/mark/order.json` lists (an array of sign
 * names) when the font has one, otherwise the file names sorted with
 * numbers compared as numbers (`A.2` before `A.10`, `9` before `10`).
 * Points never move and are never reused, even for a sign whose file
 * is gone.
 *
 * A report unless `--write`:
 *
 *   pnpm assign
 *   pnpm assign --write
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))

const BASE = path.join(HERE, '..', 'base')

const NATURAL = new Intl.Collator('en', { numeric: true })

/** The sign names of one font, in sign order. */
function listSigns(font: string): Array<string> {
  const marks = path.join(BASE, font, 'base', 'mark')

  if (!fs.existsSync(marks)) {
    return []
  }

  const names = fs
    .readdirSync(marks)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.slice(0, -4))

  const orderPath = path.join(marks, 'order.json')

  if (!fs.existsSync(orderPath)) {
    return names.sort(NATURAL.compare)
  }

  const order = JSON.parse(
    fs.readFileSync(orderPath, 'utf8'),
  ) as Array<string>
  const present = new Set(names)
  const listed = new Set(order)
  const unlisted = names.filter(name => !listed.has(name))
  const absent = order.filter(name => !present.has(name))

  if (unlisted.length || absent.length) {
    throw new Error(
      `${font}: order.json and the SVGs disagree (unlisted ${unlisted.join(', ')}; no file ${absent.join(', ')})`,
    )
  }

  return order
}

function main() {
  const write = process.argv.includes('--write')
  const assigned = readManifest()
  const taken = new Set(Object.values(assigned))
  let next = taken.size ? Math.max(...taken) + 1 : PLANE_15_START

  const fonts = fs
    .readdirSync(BASE)
    .filter(font => fs.statSync(path.join(BASE, font)).isDirectory())
    .sort()

  let onDisk = 0
  const added: Array<string> = []

  for (const font of fonts) {
    const signs = listSigns(font)
    onDisk += signs.length
    let firstOfFont: number | undefined

    for (const name of signs) {
      const key = `${font}/${name}`

      if (assigned[key] !== undefined) {
        continue
      }

      while (taken.has(next)) {
        next++
      }

      if (next > PLANE_15_END) {
        throw new Error('plane 15 is full')
      }

      assigned[key] = next
      taken.add(next)
      added.push(key)
      firstOfFont ??= next
      next++
    }

    if (firstOfFont !== undefined) {
      console.log(
        `  ${font}: new from ${formatCodePoint(firstOfFont)} to ${formatCodePoint(next - 1)}`,
      )
    }
  }

  const gone = Object.keys(assigned).filter(key => {
    const slash = key.indexOf('/')
    const file = path.join(
      BASE,
      key.slice(0, slash),
      'base',
      'mark',
      `${key.slice(slash + 1)}.svg`,
    )
    return !fs.existsSync(file)
  })

  console.log(`signs on disk         : ${onDisk}`)
  console.log(`newly assigned        : ${added.length}`)
  console.log(
    `assigned, file gone   : ${gone.length}` +
      (gone.length ? ' (kept, a point never moves)' : ''),
  )

  if (!write) {
    console.log('\nnothing written, pass --write')
    return
  }

  // Sorted by code point, so the file reads in sign order, a font at a
  // time, and a new sign only ever appends lines.
  const sorted = Object.fromEntries(
    Object.entries(assigned).sort((a, b) => a[1] - b[1]),
  )

  fs.writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(sorted, null, 2)}\n`,
    'utf8',
  )

  console.log(
    `\nwrote ${Object.keys(sorted).length} assignments to ${MANIFEST_PATH}`,
  )
}

main()
