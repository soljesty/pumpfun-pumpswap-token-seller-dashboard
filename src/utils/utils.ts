import { Keypair } from '@solana/web3.js';
import base58 from "bs58";

export const formatNumber = (num: number) => {
    try {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(2).replace(/\.0$/, '') + ' T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(2).replace(/\.0$/, '') + ' B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2).replace(/\.0$/, '') + ' M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2).replace(/\.0$/, '') + ' K';
        } else if (num <= 1e-3 && num !== 0) {
            return (num / 1e-3).toFixed(2).replace(/\.0$/, '') + 'e-3';
        } else if (num <= 1e-6 && num !== 0) {
            return (num / 1e-6).toFixed(2).replace(/\.0$/, '') + 'e-6';
        } else if (num <= 1e-9 && num !== 0) {
            return (num / 1e-9).toFixed(2).replace(/\.0$/, '') + 'e-9';
        } else if (num <= 1e-12 && num !== 0) {
            return (num / 1e-12).toFixed(2).replace(/\.0$/, '') + 'e-12';
        } else {
            return num.toString();
        }
    } catch (error) {
        console.log("format number error => ", error);
        return num.toString()
    }
}

export const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, 6)}...${text.slice(-5)}`;
};

// Function to read JSON file
export const readJson = async (filename: string = "./data.json"): Promise<Keypair[]> => {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const privateKeys = await response.json() as string[];
        const walletKps = privateKeys.map((key) => {
            return Keypair.fromSecretKey(base58.decode(key));
        });
        return walletKps;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return [];
    }
}
export const sleep = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms))
}