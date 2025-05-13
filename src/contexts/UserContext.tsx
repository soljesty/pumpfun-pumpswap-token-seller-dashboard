import { solanaConnection } from "@/constants";
import { getJitoLocation, getPresets, privateKeys, readJson } from "@/utils/utils";
import { getSOlBalance, getTokenBalance } from "@/utils/web3Func";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

// Define the shape of the context
interface UserContextProps {
  sellWallets: Keypair[];
  setSellWallets: React.Dispatch<React.SetStateAction<Keypair[]>>;
  mint: string;
  setMint: React.Dispatch<React.SetStateAction<string>>;
  tableData: ITableData[];
  setTableData: React.Dispatch<React.SetStateAction<ITableData[]>>;
  totalTokenAmount: number;
  setTotalTokenAmount: React.Dispatch<React.SetStateAction<number>>;
  jitoLocation: string;
  setJitoLocationState: React.Dispatch<React.SetStateAction<string>>;
  presets: number[];
  setPresetsState: React.Dispatch<React.SetStateAction<number[]>>;
}

// Create the User context with a default value
const UserContext = createContext<UserContextProps | undefined>(undefined);

// Create the User context provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [mint, setMint] = useState<string>('');
  const [sellWallets, setSellWallets] = useState<Keypair[]>([])
  const [tableData, setTableData] = useState<ITableData[]>([])
  const [totalTokenAmount, setTotalTokenAmount] = useState<number>(0);
  const [jitoLocation, setJitoLocationState] = useState<string>(''); // Default value
  const [presets, setPresetsState] = useState<number[]>([]); // Default empty array


  const trackWalletTransactions = () => {
    for (const keyPair of sellWallets) {
      const walletPub = keyPair.publicKey;

      solanaConnection.onLogs(
        walletPub,
        async () => {
          try {
            // Fetch updated balances
            console.log("mint address => ", mint);
            const tokenBal = await getTokenBalance(walletPub, mint); // Replace `mint` with the token mint address
            const solBal = await getSOlBalance(walletPub);

            setTableData((prevTableData) => {
              const updatedTableData = prevTableData.map((entry) => {
                if (entry.pubKey === walletPub.toBase58()) {
                  return {
                    ...entry,
                    tokenBal,
                    solBal,
                  };
                }
                return entry;
              });
              return updatedTableData;
            });
          } catch (error) {
            console.error("Error fetching balances:", error);
          }
        },
        'confirmed'
      );
    }
  }

  useEffect(() => {
    setJitoLocationState(getJitoLocation());
    setPresetsState(getPresets());
    const fetchSellWallets = async () => {
      if (privateKeys.length === 0) {
        const sellWalletList = await readJson();
        setSellWallets(sellWalletList);
        // Load initial values
      } else {
        const walletKps = privateKeys.map((key) => {
          return Keypair.fromSecretKey(base58.decode(key));
        });
        setSellWallets(walletKps);
      }
    };

    fetchSellWallets();
  }, [])

  useEffect(() => {
    if (mint !== "") {
      trackWalletTransactions()
    }
  }, [sellWallets, mint])


  return (
    <UserContext.Provider
      value={{
        sellWallets,
        setSellWallets,
        mint,
        setMint,
        tableData,
        setTableData,
        totalTokenAmount,
        setTotalTokenAmount,
        jitoLocation,
        setJitoLocationState,
        presets,
        setPresetsState
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook for consuming the context
export const useUserProvider = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserProvider must be used within a UserProvider");
  }
  return context;
};
