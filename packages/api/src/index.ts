import { saveAdmin, WhitelistedCreator } from '@metaplex/layout'
import { getStoreID, METAPLEX_ID, setStoreId } from '@metaplex/utils'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'
import { getProgramAccounts } from './helpers'

export interface MetaplexOptions {
  connection: Connection
  storeId?: string
  // wallets?: Map<string, Wallet>
}

export class Metaplex {
  adapter: WalletAdapter

  constructor(public connection) {}

  static init({ connection, storeId }: MetaplexOptions) {
    setStoreId(storeId)
    return new Metaplex(connection)
  }

  // addWallet(wallet: Wallet) {
  //   this.wallets.set(wallet.name, wallet)
  // }

  setWalletAdapter(adapter: WalletAdapter) {
    this.adapter = adapter
  }

  async setStoreForOwner(ownerAddress: string) {
    const storeId = await getStoreID(ownerAddress)
    setStoreId(storeId)
  }

  async initStore(isPublic: boolean, whitelistedCreators: WhitelistedCreator[] = []) {
    await saveAdmin(this.connection, this.adapter, isPublic, whitelistedCreators)
  }

  async getMetaplexAccounts() {
    return getProgramAccounts(this.connection, METAPLEX_ID)
  }
}
