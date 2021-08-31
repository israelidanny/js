import BN from 'bn.js'

export class u64 extends BN {
  static fromBuffer(buffer: Buffer): u64
  toBuffer(): Buffer
}
