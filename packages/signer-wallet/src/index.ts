import { ISignerProvider } from '@metaplex/types'
import { PublicKey, Transaction } from '@solana/web3.js'

export * as components from './components'
export * from './components'
export * as constants from './constants'
export * as hooks from './hooks'
export * from './hooks'
export * as contexts from './contexts'
export * from './contexts'
export * as utils from './utils'
export * from './utils'
export * as walletAdapters from './wallet-adapters'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SignerWalletProviderOptions {}

export class SignerWalletProvider implements ISignerProvider {
  publicKey?: PublicKey
  isConnected = true

  constructor() {}

  static async create({}: SignerWalletProviderOptions) {
    return new SignerWalletProvider()
  }

  async connect() {}
  async disconnect() {}

  async signTransaction(transaction: Transaction) {
    return transaction
  }
  async signAllTransactions(transactions: Transaction[]) {
    return transactions
  }
}
