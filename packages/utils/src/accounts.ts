import { AccountLayout, MintInfo, MintLayout, u64 } from '@solana/spl-token'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { StringPublicKey } from './ids'
import { TokenAccount } from './models'

export interface ParsedAccountBase {
  pubkey: StringPublicKey
  account: AccountInfo<Buffer>
  info: any // TODO: change to unknown
}

export type AccountParser = (
  pubkey: StringPublicKey,
  data: AccountInfo<Buffer>,
) => ParsedAccountBase | undefined

export interface ParsedAccount<T> extends ParsedAccountBase {
  info: T
}

export const MintParser = (pubKey: string, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data)

  const data = deserializeMint(buffer)

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as ParsedAccountBase

  return details
}

export const TokenAccountParser = (pubKey: string, info: AccountInfo<Buffer>) => {
  // Sometimes a wrapped sol account gets closed, goes to 0 length,
  // triggers an update over wss which triggers this guy to get called
  // since your UI already logged that pubkey as a token account. Check for length.
  if (info.data.length > 0) {
    const buffer = Buffer.from(info.data)
    const data = deserializeAccount(buffer)

    const details = {
      pubkey: pubKey,
      account: {
        ...info,
      },
      info: data,
    } as TokenAccount

    return details
  }
}

export const GenericAccountParser = (pubKey: string, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data)

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: buffer,
  } as ParsedAccountBase

  return details
}

// TODO: expose in spl package
export const deserializeAccount = (data: Buffer) => {
  const accountInfo = AccountLayout.decode(data)
  accountInfo.mint = new PublicKey(accountInfo.mint)
  accountInfo.owner = new PublicKey(accountInfo.owner)
  accountInfo.amount = u64.fromBuffer(accountInfo.amount)

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null
    accountInfo.delegatedAmount = new u64(0)
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate)
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount)
  }

  accountInfo.isInitialized = accountInfo.state !== 0
  accountInfo.isFrozen = accountInfo.state === 2

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative)
    accountInfo.isNative = true
  } else {
    accountInfo.rentExemptReserve = null
    accountInfo.isNative = false
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority)
  }

  return accountInfo
}

// TODO: expose in spl package
export const deserializeMint = (data: Buffer) => {
  if (data.length !== MintLayout.span) {
    throw new Error('Not a valid Mint')
  }

  const mintInfo = MintLayout.decode(data)

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply)
  mintInfo.isInitialized = mintInfo.isInitialized !== 0

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
  }

  return mintInfo as MintInfo
}
