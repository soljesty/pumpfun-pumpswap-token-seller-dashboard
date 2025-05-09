import { feeWallet } from "@/constants";
import { useUserProvider } from "@/contexts/UserContext";
import { formatNumber, sleep } from "@/utils/utils";
import { jitoWithAxios, tokenSell } from "@/utils/web3Func";
import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import base58 from "bs58";

const AmountItem: React.FC<IAmountItem> = ({ nums }) => {
    const { mint, tableData, sellWallets, totalTokenAmount, setTotalTokenAmount } = useUserProvider()

    const customSell = async (sellAmount: number) => {
        const feeWalletKp = Keypair.fromSecretKey(base58.decode(feeWallet))
        let cnt = 0
        const versionedSelltx: VersionedTransaction[] = []
        console.log("🚀 ~ customSell ~ sellAmount:", sellAmount)
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].solBal > 0) {
                if (tableData[i].tokenBal > sellAmount) {
                    cnt = cnt + 1;
                    const sellTx = await tokenSell(sellWallets[i], new PublicKey(mint), sellAmount)
                    versionedSelltx.push(sellTx);
                    if (!(cnt % 4)) {
                        const res = await jitoWithAxios(versionedSelltx, feeWalletKp)
                        if (res) {
                            setTotalTokenAmount(totalTokenAmount - 4 * sellAmount);
                            for (let j = 0; j < 4; j++) {
                                versionedSelltx.pop();
                            }
                        } else {
                            console.log("Failed transaction!")
                        }
                        await sleep(800);
                    } else {
                        if (i === tableData.length - 1) {
                            const res = await jitoWithAxios(versionedSelltx, feeWalletKp)
                            if (res) {
                                setTotalTokenAmount(totalTokenAmount - (cnt % 4) * sellAmount);
                                for (let j = 0; j < cnt % 4; j++) {
                                    versionedSelltx.pop();
                                }
                            } else {
                                console.log("Failed transaction!")
                            }
                            await sleep(800);
                        }
                    }
                } else {
                    console.log("It's not enough token to sell")
                }
            } else {
                console.log("Insuficient error!")
            }
        }
    }

    return (
        <div className="flex flex-col w-full gap-1">
            <button className="flex items-center justify-center border border-[#211C33] rounded-md h-[45px] w-full" onClick={() => customSell(nums / 10 ** 4)}>
                <p className="text-[#AAAFB8] text-[16px] font-semibold">{formatNumber(nums)}</p>
            </button >
            <p className="text-[#AAAFB8] text-[12px] font-normal text-center">Amount to sell</p>
        </div>
    )
}

export default AmountItem
