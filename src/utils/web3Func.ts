import { solanaConnection, slippage, jitoFee, location } from "@/constants"
import { Commitment, Connection, Finality, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction, VersionedTransactionResponse } from "@solana/web3.js";
import { DEFAULT_DECIMALS, PumpFunSDK } from "pumpdotfun-sdk";
import base58 from "bs58";
import axios, { AxiosError } from "axios";

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
    const balance = await solanaConnection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);

    console.log(`Balance: ${balance.value.uiAmount}`);
    return balance.value.uiAmount ?? 0;
}

export const getSOlBalance = async (walletPublicKey: PublicKey) => {

    const balanceInLamports = await solanaConnection.getBalance(walletPublicKey);
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    return balanceInSol
}

export const tokenSell = async (signer: Keypair, mintPub: PublicKey, sellAmount: number) => {
    const sdk = new PumpFunSDK({
        connection: solanaConnection, // Replace 'rpcEndpoint' with the correct property name
    });

    const sellTx = await sdk.getSellInstructionsByTokenAmount(signer.publicKey, mintPub, BigInt(sellAmount * 10 ** DEFAULT_DECIMALS), BigInt(slippage), "confirmed");

    const versionedSellTx = await buildVersionedTx(solanaConnection, signer.publicKey, sellTx);
    versionedSellTx.sign([signer]);

    return versionedSellTx
}

export const jitoWithAxios = async (transaction: VersionedTransaction[], payer: Keypair) => {

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
            console.log(await solanaConnection.simulateTransaction(transaction[i], undefined))
            const simulation = await solanaConnection.simulateTransaction(transaction[i], undefined)
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

        const endpoint = location;

        const requests = axios.post(endpoint, {
            jsonrpc: '2.0',
            id: 1,
            method: 'sendBundle',
            params: [serializedTransactions],
        })
        console.log('Sending transactions to endpoints...');

        const results = await requests.catch((e) => e);
        console.log("🚀 ~ jitoWithAxios ~ results:", results);

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

const buildVersionedTx = async (
    connection: Connection,
    payer: PublicKey,
    tx: Transaction,
): Promise<VersionedTransaction> => {
    const { blockhash } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
        instructions: tx.instructions,
        recentBlockhash: blockhash,
        payerKey: payer,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
};

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