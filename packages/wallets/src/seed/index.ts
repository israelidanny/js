import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { Keypair, PublicKey, Signer, Transaction } from '@solana/web3.js'

export interface SeedWalletAdapterConfig {
  signer: Signer
}

export class SeedWalletAdapter extends BaseSignerWalletAdapter {
  ready = true
  connecting = false
  connected = true
  autoApprove = true

  private _signer: Signer

  constructor({ signer }: SeedWalletAdapterConfig = { signer: Keypair.generate() }) {
    super()
    this._signer = signer
  }

  get publicKey(): PublicKey | null {
    return this._signer.publicKey
  }

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {}

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      transaction.partialSign(this._signer)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }

    return Promise.resolve(transaction)
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      transactions.map((tx) => {
        tx.partialSign(this._signer)
      })
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }

    return Promise.resolve(transactions)
  }
}
