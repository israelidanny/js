import { ISignerProvider } from '@metaplex/types'
import { PublicKey, Transaction } from '@solana/web3.js'

export * from './components'
export * from './constants'
export * from './hooks'
export * from './contexts'
export * from './utils'

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
