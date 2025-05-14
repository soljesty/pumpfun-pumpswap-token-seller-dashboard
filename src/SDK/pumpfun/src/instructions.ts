import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { BN } from "bn.js"

export function pumpfunBuyIx(
    programId: PublicKey,
    global: PublicKey,
    feeRecipient: PublicKey,
    mint: PublicKey,
    bondingCurve: PublicKey,
    associatedBondingCurve: PublicKey,
    associatedUser: PublicKey,
    user: PublicKey,
    tokenProgram: PublicKey,
    rent: PublicKey,
    eventAuthority: PublicKey,
    amount: number,
    maxSolCost: number
): TransactionInstruction {
    const discriminator = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]); // "buy"
    const data = Buffer.concat([
        discriminator,
        Buffer.from(Uint8Array.of(...new BN(amount).toArray('le', 8))),
        Buffer.from(Uint8Array.of(...new BN(maxSolCost).toArray('le', 8))),
    ]);

    const keys = [
        { pubkey: global, isSigner: false, isWritable: false },
        { pubkey: feeRecipient, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: bondingCurve, isSigner: false, isWritable: true },
        { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
        { pubkey: associatedUser, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: tokenProgram, isSigner: false, isWritable: false },
        { pubkey: rent, isSigner: false, isWritable: true },
        { pubkey: eventAuthority, isSigner: false, isWritable: false },
        { pubkey: programId, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
        keys,
        programId,
        data,
    });
}

export function pumpfunSellIx(
    programId: PublicKey,
    global: PublicKey,
    feeRecipient: PublicKey,
    mint: PublicKey,
    bondingCurve: PublicKey,
    associatedBondingCurve: PublicKey,
    associatedUser: PublicKey,
    user: PublicKey,
    systemProgram: PublicKey,
    rent: PublicKey,
    tokenProgram: PublicKey,
    eventAuthority: PublicKey,
    amount: number,
    minSolOutput: number
): TransactionInstruction {
    const discriminator = Buffer.from([51, 230, 133, 164, 1, 127, 131, 173]); // "sell"
    const data = Buffer.concat([
        discriminator,
        Buffer.from(Uint8Array.of(...new BN(amount).toArray('le', 8))),
        Buffer.from(Uint8Array.of(...new BN(minSolOutput).toArray('le', 8))),
    ]);

    const keys = [
        { pubkey: global, isSigner: false, isWritable: false },
        { pubkey: feeRecipient, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: bondingCurve, isSigner: false, isWritable: true },
        { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
        { pubkey: associatedUser, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: systemProgram, isSigner: false, isWritable: false },
        { pubkey: rent, isSigner: false, isWritable: true },
        { pubkey: tokenProgram, isSigner: false, isWritable: false },
        { pubkey: eventAuthority, isSigner: false, isWritable: false },
        { pubkey: programId, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
        keys,
        programId,
        data,
    });
}
