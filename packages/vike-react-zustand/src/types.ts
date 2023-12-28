export type { CreateStore, ExtractState, StoreApi, WithReact }

import type { PageContext } from 'vike/types'
import type { StoreApi as ZustandStoreApi } from 'zustand'

type ExtractState<S> = S extends {
  getState: () => infer T
}
  ? T
  : never
type ReadonlyStoreApi<T> = Pick<ZustandStoreApi<T>, 'getState' | 'subscribe'>
type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>
}

type StoreApi = WithReact<ZustandStoreApi<unknown>> & { __hydrated__?: boolean }
type CreateStore = (pageContext: PageContext) => StoreApi
