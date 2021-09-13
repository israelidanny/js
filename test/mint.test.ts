import { Connection } from '../src';
import { Keypair, PublicKey } from '@solana/web3.js';
import { PayForFiles } from '../src/transactions';
import { Coingecko, Currency } from '../src/providers';
import { getFileHash } from '../src/utils/mint';
import { ArweaveStorage } from '../src/storage';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Transaction, CreateMint, CreateAssociatedTokenAccount } from '../src/transactions';

describe('Mint NFT', () => {
  let connection: Connection;
  let creator: Keypair;
  let artwork: Uint8Array;

  beforeAll(() => {
    connection = new Connection('devnet');
    creator = Keypair.generate();
    // a 16x16 metaplex logo blob :)
    artwork = Uint8Array.from([
      0x75, 0xab, 0x5a, 0x8a, 0x66, 0xa0, 0x7b, 0xf8, 0xe9, 0x7a, 0x06, 0xda, 0xb1, 0xee, 0xb8,
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x02, 0x01, 0x01, 0x01, 0x01,
      0x01, 0x02, 0x01, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x04, 0x03, 0x02, 0x02, 0x02,
      0x02, 0x05, 0x04, 0x04, 0x03, 0x04, 0x06, 0x05, 0x06, 0x06, 0x06, 0x05, 0x06, 0x06, 0x06,
      0x07, 0x09, 0x08, 0x06, 0x07, 0x09, 0x07, 0x06, 0x06, 0x08, 0x0b, 0x08, 0x09, 0x0a, 0x0a,
      0x0a, 0x0a, 0x0a, 0x06, 0x08, 0x0b, 0x0c, 0x0b, 0x0a, 0x0c, 0x09, 0x0a, 0x0a, 0x0a, 0xff,
      0xc2, 0x00, 0x0b, 0x08, 0x00, 0x10, 0x00, 0x10, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00,
      0x16, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x05, 0x03, 0x09, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x00,
      0x00, 0xc6, 0xea, 0x1a, 0x4f, 0xff, 0xc4, 0x00, 0x22, 0x10, 0x00, 0x01, 0x04, 0x02, 0x02,
      0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x01, 0x04, 0x05,
      0x06, 0x03, 0x07, 0x08, 0x11, 0x00, 0x22, 0x12, 0x13, 0x21, 0x42, 0xff, 0xda, 0x00, 0x08,
      0x01, 0x01, 0x00, 0x01, 0x3f, 0x00, 0xd1, 0x1c, 0x47, 0xd9, 0xbc, 0x92, 0x7e, 0xdb, 0x05,
      0x5e, 0x66, 0xbd, 0x02, 0xd6, 0x46, 0x67, 0x1c, 0x3c, 0x54, 0xbd, 0xbe, 0x61, 0x18, 0x34,
      0x7f, 0x26, 0x6a, 0x1f, 0x06, 0x38, 0x32, 0x10, 0x97, 0xd9, 0x9f, 0xac, 0x80, 0x4a, 0x08,
      0x9f, 0x88, 0x48, 0xab, 0xd7, 0x69, 0xde, 0xf9, 0xe0, 0x4e, 0xe0, 0xd0, 0x3a, 0xbe, 0x4b,
      0x6d, 0x59, 0xee, 0x14, 0x99, 0x68, 0xe8, 0x5b, 0xa2, 0x55, 0x27, 0xdb, 0x56, 0x6c, 0xe0,
      0xf5, 0xcc, 0x5c, 0xaa, 0x83, 0x83, 0x4c, 0x19, 0xc0, 0x47, 0xd7, 0xd5, 0xae, 0x6f, 0xd4,
      0x55, 0xf2, 0xbf, 0xca, 0xad, 0xb9, 0x45, 0xa3, 0x54, 0xb5, 0xdc, 0x03, 0xe6, 0x23, 0x19,
      0x47, 0xd8, 0x4b, 0x74, 0x80, 0x0c, 0xac, 0x44, 0xcc, 0x25, 0x54, 0x1b, 0x87, 0xcc, 0xcb,
      0xbf, 0x7c, 0x7d, 0x35, 0xc5, 0xe9, 0xe5, 0xe3, 0x95, 0x1b, 0x72, 0xfd, 0x45, 0xb7, 0xeb,
      0xab, 0x0b, 0xe6, 0x25, 0x19, 0x76, 0xd8, 0x63, 0x75, 0x9d, 0x0c, 0x2c, 0x44, 0x0c, 0xe5,
      0x50, 0x1d, 0x02, 0x10, 0x17, 0xf1, 0x8f, 0xa7, 0x79, 0xbd, 0x3c, 0xff, 0xd9,
    ]);
  });

  test('mint', async () => {
    // we can get the rates from any other provider that implements the ConversionRateProvider abstract class
    // const rates = await Coingecko.getRate([Currency.AR, Currency.SOL], Currency.USD);
    const rates = [
      { base: 'ar', quote: 'usd', rate: 55.46 },
      { base: 'sol', quote: 'usd', rate: 159.8 },
    ];
    const lamports = await ArweaveStorage.getAssetCostToStore(
      [artwork],
      rates[0].rate,
      rates[1].rate,
    );
    const fileHashes = [await getFileHash(artwork)];
    const payForFilesTx = new PayForFiles(
      {
        feePayer: creator.publicKey,
      },
      {
        lamports,
        fileHashes,
      },
    );

    const newMintAccount = Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

    // This owner is a temporary signer and owner of metadata we use to circumvent requesting signing
    // twice post Arweave. We store in an account (payer) and use it post-Arweave to update MD with new link
    // then give control back to the user.
    const createMintTx = new CreateMint(
      {
        feePayer: creator.publicKey,
      },
      {
        newAccountPubkey: newMintAccount.publicKey,
        lamports: mintRent,
      },
    );

    const recipientKey = await PublicKey.findProgramAddress(
      [
        creator.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        newMintAccount.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const createAssociatedTokenAccountTx = new CreateAssociatedTokenAccount(
      {
        feePayer: creator.publicKey,
      },
      {
        associatedTokenAddress: recipientKey[0],
        splTokenMintAddress: newMintAccount.publicKey,
      },
    );

    const CombinedTransaction = Transaction.fromCombined([
      payForFilesTx,
      createMintTx,
      createAssociatedTokenAccountTx,
    ]);
  });
});