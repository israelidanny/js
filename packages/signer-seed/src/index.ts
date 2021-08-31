import { ISignerProvider } from '@metaplex/types'
import { PublicKey, Signer, Transaction } from '@solana/web3.js'

interface SignerSeedProviderOptions {
  signer: Signer
}

export class SignerSeedProvider implements ISignerProvider {
  publicKey?: PublicKey
  isConnected = true

  constructor(private _signer: Signer) {}

  static async create({ signer }: SignerSeedProviderOptions) {
    return new SignerSeedProvider(signer)
  }

  async connect() {}
  async disconnect() {}

  async signTransaction(transaction: Transaction) {
    transaction.sign(this._signer)
    return transaction
  }
  async signAllTransactions(transactions: Transaction[]) {
    transactions.map((tx) => {
      tx.sign(this._signer)
    })

    return transactions
  }
}
