import { Keypair, TransactionInstruction } from '@solana/web3.js'
import { updatePrimarySaleHappenedViaToken } from './base'
import { SafetyDepositDraft } from './createAuctionManager'
const SALE_TRANSACTION_SIZE = 10

export async function markItemsThatArentMineAsSold(
  wallet: any,
  safetyDepositDrafts: SafetyDepositDraft[],
): Promise<{ instructions: TransactionInstruction[][]; signers: Keypair[][] }> {
  const signers: Array<Keypair[]> = []
  const instructions: Array<TransactionInstruction[]> = []

  let markSigners: Keypair[] = []
  let markInstructions: TransactionInstruction[] = []

  // TODO replace all this with payer account so user doesnt need to click approve several times.

  for (let i = 0; i < safetyDepositDrafts.length; i++) {
    const item = safetyDepositDrafts[i].metadata

    if (
      !item.info.data.creators?.find((c) => c.address === wallet.publicKey.toBase58()) &&
      !item.info.primarySaleHappened
    ) {
      console.log(
        'For token',
        item.info.data.name,
        'marking it sold because i didnt make it but i want to keep proceeds',
      )
      await updatePrimarySaleHappenedViaToken(
        item.pubkey,
        wallet.publicKey.toBase58(),
        safetyDepositDrafts[i].holding,
        markInstructions,
      )

      if (markInstructions.length === SALE_TRANSACTION_SIZE) {
        signers.push(markSigners)
        instructions.push(markInstructions)
        markSigners = []
        markInstructions = []
      }
    }
  }

  if (markInstructions.length < SALE_TRANSACTION_SIZE && markInstructions.length > 0) {
    signers.push(markSigners)
    instructions.push(markInstructions)
  }

  return { instructions, signers }
}
