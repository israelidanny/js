import { Keypair, TransactionInstruction } from '@solana/web3.js'
import { StringPublicKey } from '@metaplex/utils'
import { setAuctionAuthority, setVaultAuthority } from './base'

// This command sets the authorities on the vault and auction to be the newly created auction manager.
export async function setVaultAndAuctionAuthorities(
  wallet: any,
  vault: StringPublicKey,
  auction: StringPublicKey,
  auctionManager: StringPublicKey,
): Promise<{
  instructions: TransactionInstruction[]
  signers: Keypair[]
}> {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  await setAuctionAuthority(auction, wallet.publicKey.toBase58(), auctionManager, instructions)
  await setVaultAuthority(vault, wallet.publicKey.toBase58(), auctionManager, instructions)

  return { instructions, signers }
}
