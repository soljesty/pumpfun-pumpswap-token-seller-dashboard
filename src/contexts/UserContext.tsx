import { solanaConnection } from "@/constants";
import { readJson } from "@/utils/utils";
import { getSOlBalance, getTokenBalance } from "@/utils/web3Func";
import { Keypair } from "@solana/web3.js";
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
}

// Create the User context with a default value
const UserContext = createContext<UserContextProps | undefined>(undefined);

// Create the User context provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [mint, setMint] = useState<string>('');
  const [sellWallets, setSellWallets] = useState<Keypair[]>([])
  const [tableData, setTableData] = useState<ITableData[]>([])
  const [totalTokenAmount, setTotalTokenAmount] = useState<number>(0);

  const trackWalletTransactions = () => {
    for (const keyPair of sellWallets) {
      const publicKey = keyPair.publicKey;

      solanaConnection.onLogs(
        publicKey,
        async (logs, context) => {
          console.log(`Transaction for ${publicKey.toBase58()}:`, {
            signature: logs.signature,
            slot: context.slot,
            logs: logs.logs
          });

          // Fetch updated balances
          const tokenBal = await getTokenBalance(publicKey, mint); // Replace `mint` with the token mint address
          const solBal = await getSOlBalance(publicKey);

          setTableData((prevTableData) => {
            const updatedTableData = prevTableData.map((entry) => {
              if (entry.pubKey === publicKey.toBase58()) {
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
        },
        'confirmed'
      );
    }
  }

  useEffect(() => {
    const fetchSellWallets = async () => {
      const sellWalletList = await readJson();
      setSellWallets(sellWalletList);
    };

    fetchSellWallets();
  }, [])

  useEffect(() => {
    trackWalletTransactions()
  }, [sellWallets])


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
        setTotalTokenAmount
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
