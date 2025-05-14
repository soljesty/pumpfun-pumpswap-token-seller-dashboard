import { Connection, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { BONDING_CURVE_SEED, parseBondingCurve, PumpBondingCurveInfo, PUMPFUN_CREATOR_VAULT, PUMPFUN_DEVNET_EVENT_AUTH, PUMPFUN_FEE_RECIPIENT, PUMPFUN_GLOBAL, PUMPFUN_MAINNET_EVENT_AUTH, PUMPFUN_PROGRAM_ID, pumpfunBuyIx, pumpfunSellIx, PumpfunSwapAccountKeys } from "./src";
import { getAssociatedTokenAddressSync, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDexReadAdapter } from "./utils/iAdapter";
import { PoolReserves } from "./types";

export class PumpfunAdapter implements IDexReadAdapter {
    private connection: Connection;
    private cluster: "mainnet" | "devnet";
    private poolInfo: PumpBondingCurveInfo | null;
    private bondingCurveAddr: PublicKey;
    private mintAddr: PublicKey;


    private constructor(
        connection: Connection,
        cluster: "mainnet" | "devnet",
        poolInfo: PumpBondingCurveInfo | null,
        bondingCurveAddr: PublicKey,
        mintAddr: PublicKey
    ) {
        this.connection = connection;
        this.cluster = cluster;
        this.bondingCurveAddr = bondingCurveAddr;
        this.poolInfo = poolInfo;
        this.mintAddr = mintAddr;
    }

    static async create(connection: Connection, tokenMint: string, cluster: "mainnet" | "devnet" = "mainnet") {
        const token_mint = new PublicKey(tokenMint)
        const [bondingCurve] = PublicKey.findProgramAddressSync([Buffer.from(BONDING_CURVE_SEED), token_mint.toBuffer()], PUMPFUN_PROGRAM_ID)

        let poolInfo: PumpBondingCurveInfo | null = null;
        const data = await connection.getAccountInfo(bondingCurve);
        if (data) {
            poolInfo = parseBondingCurve(data.data);

            if (poolInfo.complete) {
                throw new Error("Completed Bonding Curve")
            }

            console.log(poolInfo);

        }

        return new PumpfunAdapter(connection, cluster, poolInfo, bondingCurve, token_mint);
    }

    getPoolKeys(): PumpBondingCurveInfo | null {
        return this.poolInfo;
    }

    async getPoolReserves(
    ): Promise<PoolReserves> {
        const data = await this.connection.getAccountInfo(this.bondingCurveAddr);

        console.log(data);

        if (!data?.data) {
            return {
                token0: NATIVE_MINT.toBase58(),
                token1: this.mintAddr.toBase58(),
                reserveToken0: 0,
                reserveToken1: 0
            }
        }

        this.poolInfo = parseBondingCurve(data.data);

        return {
            token0: NATIVE_MINT.toBase58(),
            token1: this.mintAddr.toBase58(),
            reserveToken0: Number(this.poolInfo.real_sol_reserves),
            reserveToken1: Number(this.poolInfo.real_token_reserves)
        }
    }

    async getPrice(reserve: PoolReserves): Promise<number> {
        const { reserveToken0: reserveBase, reserveToken1: reserveQuote } = reserve;
        if (!this.poolInfo) return 0;

        console.log(reserveBase, reserveQuote);

        return reserveBase / reserveQuote;
    }

    getSwapQuote(baseAmountIn: number, inputMint: string, reserve: PoolReserves, slippage: number = 0): number {
        const { reserveToken0: realSolReserves, reserveToken1: realTokenReserves } = reserve

        const virtualTokenReserves = 279_900_000_000_000 + realTokenReserves;
        const virtualSolReserves = 30_000_000_000 + realSolReserves

        if (inputMint == NATIVE_MINT.toBase58()) {
            // Calculate the product of virtual reserves
            const n = virtualSolReserves * virtualTokenReserves;

            // Calculate the new virtual sol reserves after the purchase
            const i = virtualSolReserves + baseAmountIn;

            // Calculate the new virtual token reserves after the purchase
            const r = n / i + 1;

            // Calculate the amount of tokens to be purchased
            let s = virtualTokenReserves - r;

            s = Math.floor((100 + slippage) * s / 100)

            // Return the minimum of the calculated tokens and real token reserves
            return s < realTokenReserves ? s : realTokenReserves;
        } else {

            // Calculate the proportional amount of virtual sol reserves to be received
            const n =
                (baseAmountIn * virtualSolReserves) / (virtualTokenReserves + baseAmountIn) - 1;

            // Calculate the fee amount in the same units
            const a = (n * 100) / 10000 + 1;

            const s = Math.floor((n - a) * (100 - slippage) / 100)

            // Return the net amount after deducting the fee
            return s;
        }
    }

    getSwapInstruction(
        amountIn: number,
        amountOut: number,
        swapAccountkey: PumpfunSwapAccountKeys
    ): TransactionInstruction {
        const {
            inputMint,
            payer,
        } = swapAccountkey;

        if (!this.poolInfo) {
            throw new Error("Pool info not loaded.");
        }

        const [pumpfunGlobal] = PublicKey.findProgramAddressSync([Buffer.from(PUMPFUN_GLOBAL)], PUMPFUN_PROGRAM_ID)

        const associatedPayerAta = getAssociatedTokenAddressSync(this.mintAddr, payer);

        const associatedBondingCurve = getAssociatedTokenAddressSync(this.mintAddr, this.bondingCurveAddr, true);

        const [rent] = PublicKey.findProgramAddressSync(
            [Buffer.from(PUMPFUN_CREATOR_VAULT), this.poolInfo.creator == undefined ? NATIVE_MINT.toBuffer() : this.poolInfo.creator.toBuffer()],
            PUMPFUN_PROGRAM_ID
        );

        console.log(inputMint, NATIVE_MINT);
        console.log(inputMint == NATIVE_MINT);


        if (inputMint.toBase58() == NATIVE_MINT.toBase58()) {
            const tokenAmountOut = amountIn
            const maxSolAmountCost = amountOut
            return pumpfunBuyIx(
                PUMPFUN_PROGRAM_ID,
                pumpfunGlobal,
                PUMPFUN_FEE_RECIPIENT[0],
                this.mintAddr,
                this.bondingCurveAddr,
                associatedBondingCurve,
                associatedPayerAta,
                payer,
                TOKEN_PROGRAM_ID,
                rent,
                this.cluster == "mainnet" ? PUMPFUN_MAINNET_EVENT_AUTH : PUMPFUN_DEVNET_EVENT_AUTH,
                tokenAmountOut,
                maxSolAmountCost * 1.01,
            )
        } else {
            const tokenAmountIn = amountIn
            const minSolOutput = amountOut
            return pumpfunSellIx(
                PUMPFUN_PROGRAM_ID,
                pumpfunGlobal,
                PUMPFUN_FEE_RECIPIENT[0],
                this.mintAddr,
                this.bondingCurveAddr,
                associatedBondingCurve,
                associatedPayerAta,
                payer,
                SystemProgram.programId,
                rent,
                TOKEN_PROGRAM_ID,
                this.cluster == "mainnet" ? PUMPFUN_MAINNET_EVENT_AUTH : PUMPFUN_DEVNET_EVENT_AUTH,
                tokenAmountIn,
                minSolOutput
            )
        }
    }
}