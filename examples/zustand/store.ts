export { useStore }

import { createUseStore } from 'vike-react-zustand'
import { PageContext } from 'vike/types'
import { create } from 'zustand'

interface Store {
  counter: number
  setCounter: (value: number) => void
}

const useStore = createUseStore((pageContext: PageContext) =>
  create<Store>()((set, get) => ({
    counter: 0,
    setCounter(value) {
      set({ counter: value })
    }
  }))
)
