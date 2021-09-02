import { saveAdmin, WhitelistedCreator } from '@metaplex/layout'
import { setStoreId } from '@metaplex/utils'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'

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

  async initStore(isPublic: boolean, whitelistedCreators: WhitelistedCreator[] = []) {
    await saveAdmin(this.connection, this.adapter, isPublic, whitelistedCreators)
  }
}
