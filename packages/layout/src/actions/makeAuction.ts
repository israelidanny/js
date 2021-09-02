import { Keypair, TransactionInstruction } from '@solana/web3.js'
import { findProgramAddress, programIds, StringPublicKey, toPublicKey } from '@metaplex/utils'
import { CreateAuctionArgs, IPartialCreateAuctionArgs, AUCTION_PREFIX, createAuction } from './base'

// This command makes an auction
export async function makeAuction(
  wallet: any,
  vault: StringPublicKey,
  auctionSettings: IPartialCreateAuctionArgs,
): Promise<{
  auction: StringPublicKey
  instructions: TransactionInstruction[]
  signers: Keypair[]
}> {
  const PROGRAM_IDS = programIds()

  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []
  const auctionKey = (
    await findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        toPublicKey(PROGRAM_IDS.auction).toBuffer(),
        toPublicKey(vault).toBuffer(),
      ],
      toPublicKey(PROGRAM_IDS.auction),
    )
  )[0]

  const fullSettings = new CreateAuctionArgs({
    ...auctionSettings,
    authority: wallet.publicKey.toBase58(),
    resource: vault,
  })

  createAuction(fullSettings, wallet.publicKey.toBase58(), instructions)

  return { instructions, signers, auction: auctionKey }
}
