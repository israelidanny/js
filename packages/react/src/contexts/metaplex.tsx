import React, {
  createContext,
  PropsWithChildren,
  useState,
  useContext,
  useRef,
  useMemo,
} from 'react'
import { Metaplex } from '@metaplex/api'
import { DEFAULT_ENDPOINT, ENDPOINTS } from '@metaplex/utils'
import { Connection } from '@solana/web3.js'
import { useLocalStorageState } from '../utils'

export const metaplexApi = new Metaplex(new Connection(DEFAULT_ENDPOINT, 'recent'))

export interface IMetaplexContext {
  api: Metaplex
  setEndpoint: (value: Metaplex) => void
}
export const MetaplexContext = createContext<IMetaplexContext>({
  api: metaplexApi,
  setEndpoint: () => {},
})

export const MetaplexProvider = <P extends {}>({ children }: PropsWithChildren<P>) => {
  // const [api, setApi] = useState<Metaplex>()
  const [endpoint, setEndpoint] = useLocalStorageState('connectionEndpoint', ENDPOINTS[0].endpoint)
  const ref = useRef(metaplexApi)
  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint])

  return (
    <MetaplexContext.Provider
      value={{
        api: ref.current,
        setEndpoint,
      }}
    >
      {children}
    </MetaplexContext.Provider>
  )
}

export const useMetaplex = () => useContext<IMetaplexContext>(MetaplexContext)
