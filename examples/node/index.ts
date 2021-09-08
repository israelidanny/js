import { Metaplex } from '@metaplex/api'
import { SeedWalletAdapter } from '@metaplex/wallets'
import { ENDPOINTS, QUOTE_MINT, ZERO } from '@metaplex/utils'
import { Connection, Keypair } from '@solana/web3.js'
import {
  IPartialCreateAuctionArgs,
  MetadataKey,
  PriceFloor,
  PriceFloorType,
  SafetyDepositDraft,
  WhitelistedCreator,
  WinnerLimit,
  WinnerLimitType,
} from '@metaplex/layout'
import fs from 'fs'
import BN from 'bn.js'

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
console.log(signer.publicKey.toString())

const connection = new Connection(
  ENDPOINTS.find(({ name }) => name === 'devnet').endpoint,
  'recent',
)
const metaplex = Metaplex.init({ connection })
metaplex.setWallet(new SeedWalletAdapter({ signer }))

const run = async () => {
  // 0. Set store id
  await metaplex.setStoreForOwner(signer.publicKey.toString())
  const whitelistedCreators = [
    new WhitelistedCreator({
      address: signer.publicKey.toBase58(),
      activated: true,
    }),
  ]

  // 1. Init store
  await metaplex.saveAdmin(true, whitelistedCreators)

  // 2. Mint nft
  // const metadata = {
  //   name: 'nft',
  //   symbol: 'NFT',
  //   description: 'some nft',
  //   external_url: '',
  //   properties: {},
  //   creators: null,
  //   sellerFeeBasisPoints: 0.1,
  // }
  // const nft = await metaplex.mintNFT('devnet', [Buffer.from(fs.readFileSync('nft.png'))], metadata)
  // console.log(nft)

  const metadataAccounts = await metaplex.getMetadataAccounts(MetadataKey.MetadataV1)
  console.log(metadataAccounts)

  // 3. Create auction
  // const auctionSettings: IPartialCreateAuctionArgs = {
  //   winners: new WinnerLimit({
  //     type: WinnerLimitType.Unlimited,
  //     usize: ZERO,
  //   }),
  //   endAuctionAt: new BN(64000), // endAuctionAt is actually auction duration, poorly named, in seconds
  //   auctionGap: new BN(0),
  //   priceFloor: new PriceFloor({
  //     type: PriceFloorType.None,
  //     minPrice: new BN(0),
  //   }),
  //   tokenMint: QUOTE_MINT.toBase58(),
  //   gapTickSizePercentage: null,
  //   tickSize: null,
  // }
  // const items: SafetyDepositDraft[] = []
  // const { vault, auction, auctionManager } = await metaplex.createAuctionManager(
  //   {},
  //   auctionSettings,
  //   [],
  //   items[0],
  //   QUOTE_MINT.toBase58(),
  // )

  // const accounts = await metaplex.getMetaplexAccounts()
  // console.log(accounts)
}

run()
