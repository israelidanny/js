import { PublicKey, Transaction } from '@solana/web3.js'

export interface ISignerProvider {
  publicKey?: PublicKey
  isConnected?: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
}
