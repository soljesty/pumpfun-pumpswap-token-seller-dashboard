import { useUserProvider } from "@/contexts/UserContext";
import { formatNumber } from "@/utils/utils";
import { getSOlBalance, getTokenBalance, transferSOL } from "@/utils/web3Func";
import { Icon } from "@iconify-icon/react";
import { useEffect } from "react";
import base58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import { depositWallet, feeWallet } from "@/constants";

const WalletTable = () => {
    const { sellWallets, mint, tableData, totalTokenAmount, setTotalTokenAmount, setTableData } = useUserProvider()

    const refreshBalance = async () => {
        let tokenAmount = 0;
        const tmp: ITableData[] = [];
        for (let i = 0; i < sellWallets.length; i++) {
            let tokenBal = 0;
            let solBal = 0;
            if (mint) {
                tokenBal = await getTokenBalance(sellWallets[i].publicKey, mint);
            }

            solBal = await getSOlBalance(sellWallets[i].publicKey);
            tokenAmount = tokenAmount + tokenBal;

            const data: ITableData = {
                pubKey: sellWallets[i].publicKey.toBase58(),
                tokenBal,
                solBal
            }

            tmp.push(data);
        }
        setTotalTokenAmount(tokenAmount);
        setTableData(tmp);
    }

    const depositSol = async () => {
        const feeWalletKp = Keypair.fromSecretKey(base58.decode(feeWallet))
        const depositWalletPub = new PublicKey(depositWallet);

        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].solBal > 0) {
                await transferSOL(sellWallets[i], depositWalletPub, feeWalletKp, tableData[i].solBal);
            }
        }
        refreshBalance();
    }

    useEffect(() => {
        refreshBalance();
    }, [sellWallets, mint])

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex items-center justify-between">
                <p className="text-[#AAAFB8] text-[16px] font-bold capitalize">wallet pubkey</p>
                <button className="flex items-center gap-2 h-[45px] w-fit px-3 border border-[#211C33] rounded-md" onClick={() => refreshBalance()}>
                    <Icon icon="jam:refresh" width="24" height="24" style={{ color: "#AAAFB8" }} />
                    <p className="text-[#AAAFB8] text-[12px] font-bold capitalize">Refresh-Balances</p>
                </button>
            </div>
            <div className="h-[calc(100vh-462px)] border border-[#211C33] rounded-md overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-[#2e2b3b] border-b border-[#211C33] z-10">
                            <tr className="text-[12px] font-bold text-[#AAAFB8] h-[35px]">
                                <th className="text-start px-3 leading-[18px]">
                                    Wallet Pubkey
                                </th>
                                <th className="text-center px-3 leading-[18px]">
                                    Token Balance
                                </th>
                                <th className="text-end px-3 leading-[18px]">
                                    SCL Balance
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((item, index) => (
                                <tr
                                    key={index}
                                    className="text-[14px] font-semibold text-[#AAAFB8] h-[40px]"
                                >
                                    <td className="w-[45%] text-start px-3 font-[400] leading-5 text-[#AAAFB8]">
                                        {item.pubKey}
                                    </td>
                                    <td className="w-[30%] text-center px-3 leading-5 text-[#AAAFB8]">
                                        {item.tokenBal}
                                    </td>
                                    <td className="w-[25%] text-end px-3 leading-5 text-[#AAAFB8]">
                                        {item.solBal}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex w-full items-center justify-between">
                <p className="text-[#AAAFB8] text-[16px] font-bold capitalize">Total Tokens: {formatNumber(totalTokenAmount)}</p>
                <button className="flex items-center gap-2 h-[45px] w-fit px-3 border border-[#211C33] rounded-md" onClick={() => depositSol()}>
                    <p className="text-[#AAAFB8] text-[12px] font-bold capitalize">Send to Cold Wallet</p>
                </button>
            </div>
        </div>
    )
}

export default WalletTable
