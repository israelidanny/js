import { mintNFT, saveAdmin, createVault } from '@metaplex/layout'
import {
  AUCTION_ID,
  getStoreID,
  METADATA_PROGRAM_ID,
  METAPLEX_ID,
  setStoreId,
  VAULT_ID,
} from '@metaplex/utils'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'
import { getProgramAccounts } from './helpers'

export interface MetaplexOptions {
  connection: Connection
  wallet?: WalletAdapter
  storeId?: string
}

const actions = {
  saveAdmin,
  mintNFT,
  createVault,
} as const

type ActionMethodNames = keyof typeof actions
type OmitConnectionAndWallet<F> = F extends (
  connection: Connection,
  wallet: WalletAdapter,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never
type HasActionMethods = {
  [k in ActionMethodNames]: OmitConnectionAndWallet<typeof actions[k]>
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
    return getProgramAccounts(this.connection, METAPLEX_ID)
  }

  async getVaultAccounts() {
    return getProgramAccounts(this.connection, VAULT_ID)
  }

  async getMetadataAccounts() {
    return getProgramAccounts(this.connection, METADATA_PROGRAM_ID)
  }

  async getAuctionAccounts() {
    return getProgramAccounts(this.connection, AUCTION_ID)
  }
}
