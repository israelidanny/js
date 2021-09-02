import { Metaplex } from '@metaplex/api'
import { SeedWalletAdapter } from '@metaplex/wallets'
import { ENDPOINTS } from '@metaplex/utils'
import { Connection, Keypair } from '@solana/web3.js'

// const signer = Keypair.generate()
// console.log(signer.publicKey.toString())
// console.log(signer.secretKey)
const signer = Keypair.fromSecretKey(
  Uint8Array.from([
    220, 76, 239, 118, 40, 174, 36, 74, 194, 190, 116, 242, 42, 254, 149, 254, 34, 21, 217, 94, 141,
    222, 164, 41, 250, 78, 206, 8, 105, 54, 121, 255, 60, 76, 47, 62, 46, 240, 139, 123, 27, 227,
    228, 47, 92, 89, 84, 140, 203, 141, 39, 185, 50, 253, 28, 175, 216, 11, 114, 61, 85, 28, 10,
    185,
  ]),
)

const connection = new Connection(
  ENDPOINTS.find(({ name }) => name === 'devnet').endpoint,
  'recent',
)
const metaplex = Metaplex.init({ connection })
metaplex.setWalletAdapter(new SeedWalletAdapter({ signer }))

const run = async () => {
  // 0. Set store id
  await metaplex.setStoreForOwner(signer.publicKey.toString())

  // 1. Init store
  await metaplex.initStore(true)

  const accounts = await metaplex.getMetaplexAccounts()
  console.log(accounts)

  // ...

  // 2. Create auction
}

run()
