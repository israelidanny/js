import {
  mintNFT,
  saveAdmin,
  createVault,
  createAuctionManager,
  MetadataKey,
  decodeMetadata,
  ParsedAccount,
  Metadata,
  decodeEdition,
  Edition,
  decodeMasterEdition,
  MasterEditionV2,
} from '@metaplex/layout'
import {
  AUCTION_ID,
  getStoreID,
  isValidHttpUrl,
  METADATA_PROGRAM_ID,
  METAPLEX_ID,
  setStoreId,
  VAULT_ID,
} from '@metaplex/utils'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export interface MetaplexOptions {
  connection: Connection
  wallet?: WalletAdapter
  storeId?: string
}

const actions = {
  saveAdmin,
  mintNFT,
  createVault,
  createAuctionManager,
} as const

type ActionsType = typeof actions
type ActionMethodNames = keyof ActionsType
type OmitConnectionAndWallet<F> = F extends (
  connection: Connection,
  wallet: WalletAdapter,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never
type HasActionMethods = {
  [k in ActionMethodNames]: OmitConnectionAndWallet<ActionsType[k]>
}

export class Metaplex {
  constructor(public connection: Connection, private _wallet?: WalletAdapter) {
    // Action methods
    // TODO: fix property to methods
    for (const method of Object.keys(actions)) {
      this[method] = (...args) => actions[method].call(this, this.connection, this.wallet, ...args)
    }
  }

  static init({ connection, wallet, storeId }: MetaplexOptions): Metaplex & HasActionMethods {
    setStoreId(storeId)
    return new Metaplex(connection, wallet) as Metaplex & HasActionMethods
  }

  get wallet() {
    return this._wallet
  }

  setWallet(wallet: WalletAdapter) {
    this._wallet = wallet
  }

  async setStoreForOwner(ownerAddress: string) {
    const storeId = await getStoreID(ownerAddress)
    setStoreId(storeId)
  }

  async getMetaplexAccounts() {
    return this.connection.getProgramAccounts(new PublicKey(METAPLEX_ID))
  }

  async getVaultAccounts() {
    return this.connection.getProgramAccounts(new PublicKey(VAULT_ID))
  }

  async getMetadataAccounts(key: MetadataKey) {
    const accounts = await this.connection.getProgramAccounts(new PublicKey(METADATA_PROGRAM_ID), {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from([key])),
          },
        },
      ],
    })

    return accounts.flatMap(({ pubkey, account }) => {
      switch (key) {
        case MetadataKey.MetadataV1: {
          const metadata = decodeMetadata(account.data)

          if (isValidHttpUrl(metadata.data.uri) && metadata.data.uri.indexOf('arweave') >= 0) {
            return {
              pubkey: pubkey.toString(),
              account,
              info: metadata,
            } as ParsedAccount<Metadata>
          }
        }
        case MetadataKey.EditionV1: {
          return {
            pubkey: pubkey.toString(),
            account,
            info: decodeEdition(account.data),
          } as ParsedAccount<Edition>
        }
        case MetadataKey.MasterEditionV2: {
          return {
            pubkey: pubkey.toString(),
            account,
            info: decodeMasterEdition(account.data),
          } as ParsedAccount<MasterEditionV2>
        }
        default:
          return []
      }
    })
  }

  async getAuctionAccounts() {
    return this.connection.getProgramAccounts(new PublicKey(AUCTION_ID))
  }
}
