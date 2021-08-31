import { ISignerProvider } from '@metaplex/types'
import { Connection } from '@solana/web3.js'

export interface MetaplexOptions {
  connection: Connection
  signerProvider: ISignerProvider
}

export class Metaplex {
  constructor(private _connection, private _signerProvider: ISignerProvider) {}

  static async init({ connection, signerProvider }: MetaplexOptions) {
    return new Metaplex(connection, signerProvider)
  }

  // ...
}
