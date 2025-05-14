import { PublicKey } from "@solana/web3.js";
import { PumpBondingCurveInfo } from "./types";
export function parseBondingCurve(buffer: Buffer): PumpBondingCurveInfo {
  let offset = 8; // skip discriminator or padding

  function readU64(): bigint {
    const value = buffer.readBigUInt64LE(offset);
    offset += 8;
    return value;
  }

  function readBool(): boolean {
    const value = buffer.readUInt8(offset);
    offset += 1;
    return value !== 0;
  }

  function readPublicKey(): Buffer {
    const value = buffer.slice(offset, offset + 32);
    offset += 32;
    return value;
  }

  const curve: PumpBondingCurveInfo = {
    virtual_token_reserves: readU64(),
    virtual_sol_reserves: readU64(),
    real_token_reserves: readU64(),
    real_sol_reserves: readU64(),
    token_total_supply: readU64(),
    complete: readBool(),
    creator: undefined,
  };

  // Only read `creator` if 32 bytes remain
  if (offset + 50 <= buffer.length) {
    curve.creator = new PublicKey(readPublicKey());
  }

  return curve;
}
