export { vikeReactZustand }

import type { Plugin } from 'vite'
import { initializers_remove } from './renderer/context.js'
import { assert } from './utils.js'
import { init, parse } from 'es-module-lexer'

function vikeReactZustand(): Plugin {
  const idToStoreKeys: { [id: string]: Set<string> } = {}
  return {
    name: 'vikeReactZustand',
    enforce: 'post',
    async transform(code, id) {
      if (id.includes('node_modules')) {
        return
      }
      const res = parse(code)
      const match = res[0].find((line) => line.n === 'vike-react-zustand')
      if (!match) {
        return
      }
      const importLine = code.slice(match.ss, match.se)
      const imports = importLine
        .substring(importLine.indexOf('{') + 1, importLine.indexOf('}'))
        .split(',')
        .map((s) => s.trim())
        .filter((s) => {
          const split = s.split(' as ')
          return (
            split.length === 1 ||
            // create as create
            split[0] === split[1]
          )
        })
      if (!imports.includes('create')) {
        return
      }

      // Playground: https://regex101.com/r/oDNRzp/1
      const matches = code.matchAll(/(?<=[\s:=,;])create\s*?\(/g)
      let idx = 0
      for (const match of matches) {
        if (!match.index || !match.input) {
          continue
        }
        const key = simpleHash(`${id}:${idx}`)
        idToStoreKeys[id] ??= new Set([key])
        idToStoreKeys[id]!.add(key)
        code =
          match.input.substring(0, match.index) +
          `${match[0]}'${key}',` +
          match.input.substring(match.index + match[0].length)
        idx++
      }

      return code
    },
    async buildStart() {
      await init
    },
    handleHotUpdate(ctx) {
      const modules = ctx.modules.filter((m) => m.id && m.id in idToStoreKeys)
      if (!modules.length) return

      for (const module of modules.filter((m) => m.id)) {
        assert(module.id)
        const storeKeysInFile = idToStoreKeys[module.id]
        assert(storeKeysInFile)
        for (const key of storeKeysInFile) {
          initializers_remove(key)
        }
        delete idToStoreKeys[module.id]
      }

      ctx.server.ws.send({ type: 'full-reload' })
      return []
    }
  }
}

function simpleHash(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(36)
}
