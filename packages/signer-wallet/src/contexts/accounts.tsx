import {
  AccountParser,
  chunks,
  deserializeAccount,
  deserializeMint,
  EventEmitter,
  MintParser,
  ParsedAccountBase,
  programIds,
  TokenAccount,
  TokenAccountParser,
  WRAPPED_SOL_MINT,
} from '@metaplex/utils'
import { AccountLayout, MintInfo, u64 } from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'
import { useConnection } from '../contexts/connection'
import { useWallet } from '../contexts/wallet'

const AccountsContext = React.createContext<any>(null)

const pendingCalls = new Map<string, Promise<ParsedAccountBase>>()
const genericCache = new Map<string, ParsedAccountBase>()
const pendingMintCalls = new Map<string, Promise<MintInfo>>()
const mintCache = new Map<string, MintInfo>()

export const cache = {
  emitter: new EventEmitter(),
  query: async (connection: Connection, pubKey: string | PublicKey, parser?: AccountParser) => {
    let id: PublicKey
    if (typeof pubKey === 'string') {
      id = new PublicKey(pubKey)
    } else {
      id = pubKey
    }

    const address = id.toBase58()

    const account = genericCache.get(address)
    if (account) {
      return account
    }

    let query = pendingCalls.get(address)
    if (query) {
      return query
    }

    // TODO: refactor to use multiple accounts query with flush like behavior
    query = connection.getAccountInfo(id).then((data) => {
      if (!data) {
        throw new Error('Account not found')
      }

      return cache.add(id, data, parser)
    }) as Promise<TokenAccount>
    pendingCalls.set(address, query as any)

    return query
  },
  add: (
    id: PublicKey | string,
    obj: AccountInfo<Buffer>,
    parser?: AccountParser,
    isActive?: boolean | undefined | ((parsed: any) => boolean),
  ) => {
    const address = typeof id === 'string' ? id : id?.toBase58()
    const deserialize = parser ? parser : keyToAccountParser.get(address)
    if (!deserialize) {
      throw new Error('Deserializer needs to be registered or passed as a parameter')
    }

    cache.registerParser(id, deserialize)
    pendingCalls.delete(address)
    const account = deserialize(address, obj)
    if (!account) {
      return
    }

    if (isActive === undefined) isActive = true
    else if (isActive instanceof Function) isActive = isActive(account)

    const isNew = !genericCache.has(address)

    genericCache.set(address, account)
    cache.emitter.raiseCacheUpdated(address, isNew, deserialize, isActive)
    return account
  },
  get: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== 'string') {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    return genericCache.get(key)
  },
  delete: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== 'string') {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    if (genericCache.get(key)) {
      genericCache.delete(key)
      cache.emitter.raiseCacheDeleted(key)
      return true
    }
    return false
  },

  byParser: (parser: AccountParser) => {
    const result: string[] = []
    for (const id of keyToAccountParser.keys()) {
      if (keyToAccountParser.get(id) === parser) {
        result.push(id)
      }
    }

    return result
  },
  registerParser: (pubkey: PublicKey | string, parser: AccountParser) => {
    if (pubkey) {
      const address = typeof pubkey === 'string' ? pubkey : pubkey?.toBase58()
      keyToAccountParser.set(address, parser)
    }

    return pubkey
  },
  queryMint: async (connection: Connection, pubKey: string | PublicKey) => {
    let id: PublicKey
    if (typeof pubKey === 'string') {
      id = new PublicKey(pubKey)
    } else {
      id = pubKey
    }

    const address = id.toBase58()
    const mint = mintCache.get(address)
    if (mint) {
      return mint
    }

    let query = pendingMintCalls.get(address)
    if (query) {
      return query
    }

    query = getMintInfo(connection, id).then((data) => {
      pendingMintCalls.delete(address)

      mintCache.set(address, data)
      return data
    }) as Promise<MintInfo>
    pendingMintCalls.set(address, query as any)

    return query
  },
  getMint: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== 'string') {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    return mintCache.get(key)
  },
  addMint: (pubKey: PublicKey, obj: AccountInfo<Buffer>) => {
    const mint = deserializeMint(obj.data)
    const id = pubKey.toBase58()
    mintCache.set(id, mint)
    return mint
  },
}

export const keyToAccountParser = new Map<string, AccountParser>()

const getMintInfo = async (connection: Connection, pubKey: PublicKey) => {
  const info = await connection.getAccountInfo(pubKey)
  if (info === null) {
    throw new Error('Failed to find mint account')
  }

  const data = Buffer.from(info.data)

  return deserializeMint(data)
}

export const useAccountsContext = () => {
  const context = useContext(AccountsContext)

  return context
}

function wrapNativeAccount(
  pubkey: string,
  account?: AccountInfo<Buffer>,
): TokenAccount | undefined {
  if (!account) {
    return undefined
  }

  const key = new PublicKey(pubkey)

  return {
    pubkey: pubkey,
    account,
    info: {
      address: key,
      mint: WRAPPED_SOL_MINT,
      owner: key,
      amount: new u64(account.lamports),
      delegate: null,
      delegatedAmount: new u64(0),
      isInitialized: true,
      isFrozen: false,
      isNative: true,
      rentExemptReserve: null,
      closeAuthority: null,
    },
  }
}

export const getCachedAccount = (predicate: (account: TokenAccount) => boolean) => {
  for (const account of genericCache.values()) {
    if (predicate(account)) {
      return account as TokenAccount
    }
  }
}

const UseNativeAccount = () => {
  const connection = useConnection()
  const { wallet } = useWallet()

  const [nativeAccount, setNativeAccount] = useState<AccountInfo<Buffer>>()

  const updateCache = useCallback(
    (account) => {
      if (wallet && wallet.publicKey) {
        const wrapped = wrapNativeAccount(wallet.publicKey?.toBase58(), account)
        if (wrapped !== undefined && wallet) {
          const id = wallet.publicKey?.toBase58()
          cache.registerParser(id, TokenAccountParser)
          genericCache.set(id, wrapped as TokenAccount)
          cache.emitter.raiseCacheUpdated(id, false, TokenAccountParser, true)
        }
      }
    },
    [wallet],
  )

  useEffect(() => {
    let subId = 0
    const updateAccount = (account: AccountInfo<Buffer> | null) => {
      if (account) {
        updateCache(account)
        setNativeAccount(account)
      }
    }

    ;(async () => {
      if (!connection || !wallet?.publicKey) {
        return
      }

      const account = await connection.getAccountInfo(wallet.publicKey)
      updateAccount(account)

      subId = connection.onAccountChange(wallet.publicKey, updateAccount)
    })()

    return () => {
      if (subId) {
        connection.removeAccountChangeListener(subId)
      }
    }
  }, [setNativeAccount, wallet, wallet?.publicKey, connection, updateCache])

  return { nativeAccount }
}

const PRECACHED_OWNERS = new Set<string>()
const precacheUserTokenAccounts = async (connection: Connection, owner?: PublicKey) => {
  if (!owner) {
    return
  }

  // used for filtering account updates over websocket
  PRECACHED_OWNERS.add(owner.toBase58())

  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: programIds().token,
  })

  accounts.value.forEach((info) => {
    cache.add(info.pubkey.toBase58(), info.account, TokenAccountParser)
  })
}

export const AccountsProvider = ({ children }: PropsWithChildren<{}>) => {
  const connection = useConnection()
  const { wallet, connected } = useWallet()
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([])
  const [userAccounts, setUserAccounts] = useState<TokenAccount[]>([])
  const { nativeAccount } = UseNativeAccount()
  const walletKey = wallet?.publicKey?.toBase58()

  const selectUserAccounts = useCallback(() => {
    return cache
      .byParser(TokenAccountParser)
      .map((id) => cache.get(id))
      .filter((a) => a && a.info.owner.toBase58() === walletKey)
      .map((a) => a as TokenAccount)
  }, [walletKey])

  useEffect(() => {
    const accounts = selectUserAccounts().filter((a) => a !== undefined) as TokenAccount[]
    setUserAccounts(accounts)
  }, [nativeAccount, wallet, tokenAccounts, selectUserAccounts])

  useEffect(() => {
    const subs: number[] = []
    cache.emitter.onCache((args) => {
      if (args.isNew && args.isActive) {
        const id = args.id
        const deserialize = args.parser
        connection.onAccountChange(new PublicKey(id), (info) => {
          cache.add(id, info, deserialize)
        })
      }
    })

    return () => {
      subs.forEach((id) => connection.removeAccountChangeListener(id))
    }
  }, [connection])

  const publicKey = wallet?.publicKey
  useEffect(() => {
    if (!connection || !publicKey) {
      setTokenAccounts([])
    } else {
      precacheUserTokenAccounts(connection, publicKey).then(() => {
        setTokenAccounts(selectUserAccounts())
      })

      // This can return different types of accounts: token-account, mint, multisig
      // TODO: web3.js expose ability to filter.
      // this should use only filter syntax to only get accounts that are owned by user
      const tokenSubID = connection.onProgramAccountChange(
        programIds().token,
        (info) => {
          // TODO: fix type in web3.js
          const id = info.accountId as unknown as string
          // TODO: do we need a better way to identify layout (maybe a enum identifing type?)
          if (info.accountInfo.data.length === AccountLayout.span) {
            const data = deserializeAccount(info.accountInfo.data)

            if (PRECACHED_OWNERS.has(data.owner.toBase58())) {
              cache.add(id, info.accountInfo, TokenAccountParser)
              setTokenAccounts(selectUserAccounts())
            }
          }
        },
        'singleGossip',
      )

      return () => {
        connection.removeProgramAccountChangeListener(tokenSubID)
      }
    }
  }, [connection, connected, publicKey, selectUserAccounts])

  return (
    <AccountsContext.Provider
      value={{
        userAccounts,
        nativeAccount,
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export const useNativeAccount = () => {
  const context = useContext(AccountsContext)
  return {
    account: context.nativeAccount as AccountInfo<Buffer>,
  }
}

export const useMint = (key?: string | PublicKey) => {
  const connection = useConnection()
  const [mint, setMint] = useState<MintInfo>()

  const id = typeof key === 'string' ? key : key?.toBase58()

  useEffect(() => {
    if (!id) {
      return
    }

    cache
      .query(connection, id, MintParser)
      .then((acc) => setMint(acc.info as any))
      .catch((err) => console.log(err))

    const dispose = cache.emitter.onCache((e) => {
      const event = e
      if (event.id === id) {
        cache.query(connection, id, MintParser).then((mint) => setMint(mint.info as any))
      }
    })
    return () => {
      dispose()
    }
  }, [connection, id])

  return mint
}

export const useAccount = (pubKey?: PublicKey) => {
  const connection = useConnection()
  const [account, setAccount] = useState<TokenAccount>()

  const key = pubKey?.toBase58()
  useEffect(() => {
    const query = async () => {
      try {
        if (!key) {
          return
        }

        const acc = await cache
          .query(connection, key, TokenAccountParser)
          .catch((err) => console.log(err))
        if (acc) {
          setAccount(acc)
        }
      } catch (err) {
        console.error(err)
      }
    }

    query()

    const dispose = cache.emitter.onCache((e) => {
      const event = e
      if (event.id === key) {
        query()
      }
    })
    return () => {
      dispose()
    }
  }, [connection, key])

  return account
}

export const getMultipleAccounts = async (connection: any, keys: string[], commitment: string) => {
  const result = await Promise.all(
    chunks(keys, 99).map((chunk) => getMultipleAccountsCore(connection, chunk, commitment)),
  )

  const array = result
    .map(
      (a) =>
        a.array.map((acc) => {
          if (!acc) {
            return undefined
          }

          const { data, ...rest } = acc
          const obj = {
            ...rest,
            data: Buffer.from(data[0], 'base64'),
          } as AccountInfo<Buffer>
          return obj
        }) as AccountInfo<Buffer>[],
    )
    .flat()
  return { keys, array }
}

const getMultipleAccountsCore = async (connection: any, keys: string[], commitment: string) => {
  const args = connection._buildArgs([keys], commitment, 'base64')

  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
  if (unsafeRes.error) {
    throw new Error('failed to get info about account ' + unsafeRes.error.message)
  }

  if (unsafeRes.result.value) {
    const array = unsafeRes.result.value as AccountInfo<string[]>[]
    return { keys, array }
  }

  // TODO: fix
  throw new Error()
}
