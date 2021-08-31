import { ENV as ChainId } from '@solana/spl-token-registry'
import { clusterApiUrl } from '@solana/web3.js'

export type CHAIN_ENV =
  | 'mainnet-beta'
  | 'mainnet-beta (Solana)'
  | 'mainnet-beta (Serum)'
  | 'testnet'
  | 'devnet'
  | 'localnet'
  | 'lending'

export const ENDPOINTS = [
  {
    name: 'mainnet-beta' as CHAIN_ENV,
    endpoint: 'https://api.metaplex.solana.com/',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'mainnet-beta (Solana)' as CHAIN_ENV,
    endpoint: 'https://api.mainnet-beta.solana.com',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'mainnet-beta (Serum)' as CHAIN_ENV,
    endpoint: 'https://solana-api.projectserum.com/',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'testnet' as CHAIN_ENV,
    endpoint: clusterApiUrl('testnet'),
    ChainId: ChainId.Testnet,
  },
  {
    name: 'devnet' as CHAIN_ENV,
    endpoint: clusterApiUrl('devnet'),
    ChainId: ChainId.Devnet,
  },
]

export const DEFAULT_ENDPOINT = ENDPOINTS[0].endpoint
