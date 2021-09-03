import { AccountInfo, Connection } from '@solana/web3.js'
import { METAPLEX_ID, StringPublicKey } from '@metaplex/utils'
import { AccountAndPubkey } from '@metaplex/types'
import { MetaplexKey } from '@metaplex/layout'

export const getProgramAccounts = async (
  connection: Connection,
  programId: StringPublicKey,
  configOrCommitment?: any,
): Promise<Array<AccountAndPubkey>> => {
  const extra: any = {}
  let commitment
  let encoding

  if (configOrCommitment) {
    if (typeof configOrCommitment === 'string') {
      commitment = configOrCommitment
    } else {
      commitment = configOrCommitment.commitment
      encoding = configOrCommitment.encoding

      if (configOrCommitment.dataSlice) {
        extra.dataSlice = configOrCommitment.dataSlice
      }

      if (configOrCommitment.filters) {
        extra.filters = configOrCommitment.filters
      }
    }
  }

  const args = connection._buildArgs([programId], commitment, 'base64', extra)
  const unsafeRes = await (connection as any)._rpcRequest('getProgramAccounts', args)

  const data = (
    unsafeRes.result as Array<{
      account: AccountInfo<[string, string]>
      pubkey: string
    }>
  ).map((item) => {
    return {
      account: {
        // TODO: possible delay parsing could be added here
        data: Buffer.from(item.account.data[0], 'base64'),
        executable: item.account.executable,
        lamports: item.account.lamports,
        // TODO: maybe we can do it in lazy way? or just use string
        owner: item.account.owner,
      } as AccountInfo<Buffer>,
      pubkey: item.pubkey,
    }
  })

  return data
}

export const isMetaplexAccount = (account: AccountInfo<Buffer>) =>
  (account.owner as unknown as any) === METAPLEX_ID

export const isAuctionManagerV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.AuctionManagerV1

export const isAuctionManagerV2Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.AuctionManagerV2

export const isBidRedemptionTicketV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.BidRedemptionTicketV1

export const isBidRedemptionTicketV2Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.BidRedemptionTicketV2

export const isPayoutTicketV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.PayoutTicketV1

export const isPrizeTrackingTicketV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.PrizeTrackingTicketV1

export const isStoreV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.StoreV1

export const isSafetyDepositConfigV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.SafetyDepositConfigV1

export const isWhitelistedCreatorV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetaplexKey.WhitelistedCreatorV1
