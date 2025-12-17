/*
Simple conversion script using esbuild to strip TypeScript types from .tsx files
and write .jsx outputs with the same relative path. It will also remove the
original .tsx files after successful conversion.

Usage: install esbuild then run:
  node scripts/convert-tsx-to-jsx.js
*/

const fs = require('fs')
const path = require('path')

async function run() {
  const root = path.resolve(__dirname, '..')
  const componentsDir = path.join(root, 'components')

  const esbuild = require('esbuild')

  function walk(dir) {
    let results = []
    const list = fs.readdirSync(dir)
    for (const file of list) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath))
      } else {
        results.push(filePath)
      }
    }
    return results
  }

  const allFiles = walk(componentsDir).filter((f) => f.endsWith('.tsx'))
  if (allFiles.length === 0) {
    console.log('No .tsx files found under components/')
    return
  }

  for (const tsxPath of allFiles) {
    const rel = path.relative(root, tsxPath)
    const jsxPath = tsxPath.replace(/\.tsx$/i, '.jsx')

    try {
      const source = fs.readFileSync(tsxPath, 'utf8')
      const result = await esbuild.transform(source, {
        loader: 'tsx',
        jsx: 'automatic',
        format: 'esm',
        sourcemap: false,
      })

      // esbuild outputs JS; we will write it as .jsx so tooling treats as JSX
      fs.writeFileSync(jsxPath, result.code, 'utf8')
      fs.unlinkSync(tsxPath)
      console.log(`Converted: ${rel} -> ${path.relative(root, jsxPath)}`)
    } catch (err) {
      console.error(`Failed to convert ${rel}:`, err.message)
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
