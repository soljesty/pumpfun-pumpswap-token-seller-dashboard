import { Connection } from "@solana/web3.js";

const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT;
const RPC_WEBSOCKET_ENDPOINT = import.meta.env.VITE_RPC_WEBSOCKET_ENDPOINT;

const depositWallet = import.meta.env.VITE_DEPOSIT_PUBLICKEY;
const feeWallet = import.meta.env.VITE_PRIVATE_KEY;

const jitoFee = import.meta.env.VITE_JITO_FEE;
const location = import.meta.env.VITE_JITO_LOCATION;

const amountList: number[] = JSON.parse(import.meta.env.VITE_PRESETS);

const slippage = import.meta.env.VITE_SLIPPAGE;

// Initialize Solana connection (mainnet)
const solanaConnection = new Connection(RPC_ENDPOINT, { wsEndpoint: RPC_WEBSOCKET_ENDPOINT, commitment: "processed" });

export { solanaConnection, depositWallet, feeWallet, jitoFee, location, amountList, slippage }