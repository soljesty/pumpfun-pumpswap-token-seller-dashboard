import { solanaConnection, slippage, jitoFee } from "@/constants"
import { Commitment, Connection, Finality, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction, VersionedTransactionResponse } from "@solana/web3.js";
import { DEFAULT_DECIMALS } from "pumpdotfun-sdk";
import { PumpAmmSdk } from "@pump-fun/pump-swap-sdk";
import base58 from "bs58";
import axios, { AxiosError } from "axios";
import BN from "bn.js";
import { PumpfunAdapter } from "@/SDK/pumpfun";

export const getTokenBalance = async (walletPublicKey: PublicKey, tokenMintAddress: string) => {
    // Convert addresses to PublicKey objects
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Get all token accounts for the wallet and specific mint
    const tokenAccounts = await solanaConnection.getTokenAccountsByOwner(walletPublicKey, {
        mint: tokenMintPublicKey
    });

    if (tokenAccounts.value.length === 0) {
        console.log('No token accounts found for this wallet and mint.');
        return 0;
    }

    // Get the balance of the first token account (assuming one account per mint)
    const pubString = tokenAccounts.value[0].pubkey.toString();
    const ataPub = new PublicKey(pubString);
    const balance = await solanaConnection.getTokenAccountBalance(ataPub);

    console.log(`Balance: ${balance.value.uiAmount}`);
    return balance.value.uiAmount ?? 0;
}

export const getSOlBalance = async (walletPublicKey: PublicKey) => {

    const balanceInLamports = await solanaConnection.getBalance(walletPublicKey);
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    return balanceInSol
}

export const tokenSell_pumpfun = async (signer: Keypair, mint: string, sellAmount: number) => {
    const sdk = await PumpfunAdapter.create(
        solanaConnection, // Replace 'rpcEndpoint' with the correct property name
        mint,
        "mainnet"
    );

    const reserve = await sdk.getPoolReserves();
    console.log("🚀 ~ consttokenSell_pumpfun= ~ reserve:", reserve)

    if (reserve.reserveToken1 < sellAmount * 10 ** DEFAULT_DECIMALS) {
        throw new Error("Insufficient liquidity in the pool to execute the transaction.");
    }

    const minQuoteAmount = sdk.getSwapQuote(sellAmount * 10 ** DEFAULT_DECIMALS, mint, reserve, slippage)

    const ix = await sdk.getSwapInstruction(sellAmount * 10 ** DEFAULT_DECIMALS, minQuoteAmount, {
        inputMint: new PublicKey(mint),
        payer: signer.publicKey
    })

    return ix
}

export const tokenSell_pumpswap = async (signer: Keypair, pool: PublicKey, sellAmount: number) => {
    const pSwap = new PumpAmmSdk(solanaConnection)

    const sellAmountBigInt = new BN(sellAmount * 10 ** DEFAULT_DECIMALS);
    const sellInstructions = await pSwap.swapBaseInstructions(
        pool,
        sellAmountBigInt,
        slippage,
        "baseToQuote",
        signer.publicKey
    );
    console.log("🚀 ~ consttokenSell_pumpswap= ~ sellInstructions:", sellInstructions)

    return sellInstructions
}

export const getPoolIdFromTokenAddress = async (mint: string) => {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            // Filter for PumpSwap pools only
            interface Pair {
                dexId: string;
                chainId: string;
                pairAddress: string;
            }

            const pumpSwapPools = data.pairs.filter((pair: Pair) =>
                pair.dexId === "pumpswap" &&
                pair.chainId === "solana"
            );

            if (pumpSwapPools.length > 0) {
                return pumpSwapPools[0].pairAddress; // Return the first PumpSwap pool found
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching PumpSwap pool ID:', error);
        return null;
    }
}

export const jitoWithAxios = async (transaction: VersionedTransaction[], payer: Keypair, location: string) => {

    console.log('Starting Jito transaction execution...');
    const tipAccounts = [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
        'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
        'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    ];
    const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

    console.log(`Selected Jito fee wallet: ${jitoFeeWallet.toBase58()}`);

    try {
        console.log(`Calculated fee: ${jitoFee / LAMPORTS_PER_SOL} sol`);
        const latestBlockhash = await solanaConnection.getLatestBlockhash();
        const jitTipTxFeeMessage = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: jitoFeeWallet,
                    lamports: jitoFee,
                }),
            ],
        }).compileToV0Message();

        const jitoFeeTx = new VersionedTransaction(jitTipTxFeeMessage);
        jitoFeeTx.sign([payer]);

        for (let i = 0; i < transaction.length; i++) {
            console.log(await solanaConnection.simulateTransaction(transaction[i], { sigVerify: true }))
            const simulation = await solanaConnection.simulateTransaction(transaction[i], { sigVerify: true })
            if (simulation.value.err) {
                console.error("Transaction simulation error:", simulation.value.err)
                throw new Error("Transaction simulation failed")
            }
        }

        const jitoTxsignature = base58.encode(jitoFeeTx.signatures[0]);

        // Serialize the transactions once here
        const serializedjitoFeeTx = base58.encode(jitoFeeTx.serialize());
        const serializedTransactions = [serializedjitoFeeTx];
        for (let i = 0; i < transaction.length; i++) {
            const serializedTransaction = base58.encode(transaction[i].serialize());
            serializedTransactions.push(serializedTransaction);
        }

        const endpoints = {
            mainnet: 'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
            amsterdam: 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
            frankfurt: 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
            ny: 'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
            tokyo: 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
        }

        const endpoint = endpoints[location as keyof typeof endpoints];
        if (!endpoint) {
            console.error("Invalid location or endpoint:", location);
            return;
        }

        const requests = axios.post(endpoint, {
            jsonrpc: '2.0',
            id: 1,
            method: 'sendBundle',
            params: [serializedTransactions],
        })
        console.log('Sending transactions to endpoints...');

        const results = await requests.catch((e) => {
            console.error("Error response from Jito API:", e.response?.data || e.message);
            return e;
        });

        // Check if the response is successful
        if (results && results.status === 200 && results.data) {
            console.log(`Successful response`);
            console.log(`Confirming jito transaction...`);

            const txResult = await getTxDetails(solanaConnection, jitoTxsignature, "confirmed", "confirmed");
            console.log("🚀 ~ jitoCreatTansaction ~ txResult:", txResult);
            if (txResult && !txResult.meta?.err) {
                console.log("create token => ", `https://solscan.io/tx/${jitoTxsignature}`);
                return true;
            }
        } else {
            console.log(`No successful responses received for jito`);
            return false;
        }
    } catch (error) {
        if (error instanceof AxiosError) {
            console.log('Failed to execute jito transaction');
            return false
        }
        console.log('Error during transaction execution', error);
        return false
    }
}

const getTxDetails = async (
    connection: Connection,
    sig: string,
    commitment: Commitment,
    finality: Finality
): Promise<VersionedTransactionResponse | null> => {
    const latestBlockHash = await connection.getLatestBlockhash();
    const start_time = Date.now();
    await connection.confirmTransaction(
        {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig,
        },
        commitment
    );
    console.log("during confirmTransaction time => ", Date.now() - start_time)

    return connection.getTransaction(sig, {
        maxSupportedTransactionVersion: 0,
        commitment: finality,
    });
};

// Sol transfer
export const transferSOL = async (
    fromKeypair: Keypair,
    toAddress: PublicKey,
    signer: Keypair,
    amountInSOL: number
): Promise<string> => {
    try {
        // 1. Convert SOL amount to lamports (1 SOL = 1,000,000,000 lamports)
        const lamports = amountInSOL * LAMPORTS_PER_SOL;

        // 2. Create transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toAddress,
                lamports,
            })
        );
        transaction.feePayer = signer.publicKey;

        const signature = await solanaConnection.sendTransaction(transaction, [fromKeypair, signer]);
        await solanaConnection.confirmTransaction(signature, "confirmed");
        console.log("Transaction successful with signature:", signature);

        return signature;
    } catch (error) {
        console.error('Transfer failed:', error);
        throw error;
    }
}