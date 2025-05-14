import { feeWallet, solanaConnection } from "@/constants";
import { useUserProvider } from "@/contexts/UserContext";
import { formatNumber, sleep } from "@/utils/utils";
import { getPoolIdFromTokenAddress, jitoWithAxios, tokenSell_pumpfun, tokenSell_pumpswap } from "@/utils/web3Func";
import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import base58 from "bs58";
import { buildVersionedTx } from "pumpdotfun-sdk";

const AmountItem: React.FC<IAmountItem> = ({ nums }) => {
    const { mint, tableData, sellWallets, totalTokenAmount, jitoLocation, setTotalTokenAmount } = useUserProvider()

    const customSell = async (sellAmount: number) => {
        const feeWalletKp = Keypair.fromSecretKey(base58.decode(feeWallet))
        let cnt_versioned = 0;
        let cnt_jito = 0;
        const versionedSelltxs: VersionedTransaction[] = []
        const sellTx = new Transaction();
        console.log("🚀 ~ customSell ~ sellAmount:", sellAmount)
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].solBal > 0) {
                if (tableData[i].tokenBal > sellAmount) {
                    cnt_versioned = cnt_versioned + 1;

                    const poolId = await getPoolIdFromTokenAddress(mint);

                    if (!poolId) {
                        const sellIns_pumpfun = await tokenSell_pumpfun(sellWallets[i], mint, sellAmount)
                        sellTx.add(sellIns_pumpfun)
                        if (!(cnt_versioned % 4)) {
                            cnt_jito = cnt_jito + 1;
                            const versionedSellTx = await buildVersionedTx(solanaConnection, feeWalletKp.publicKey, sellTx);
                            versionedSellTx.sign([feeWalletKp, ...sellWallets.slice(cnt_versioned - 4, cnt_versioned)]);
                            versionedSelltxs.push(versionedSellTx);

                            sellTx.instructions = [];

                            if (!(cnt_jito % 4)) {
                                const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                if (res) {
                                    setTotalTokenAmount(totalTokenAmount - 16 * sellAmount);
                                    for (let j = 0; j < 4; j++) {
                                        versionedSelltxs.pop();
                                    }
                                } else {
                                    console.log("Failed transaction!")
                                }
                                await sleep(800);
                            } else {
                                if (i === tableData.length - 1) {
                                    const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                    if (res) {
                                        setTotalTokenAmount(totalTokenAmount - (cnt_versioned % 16) * sellAmount);
                                    } else {
                                        console.log("Failed transaction!")
                                    }
                                }
                            }
                        } else {
                            if (i === tableData.length - 1) {
                                // const sig = await sendAndConfirmTransaction(solanaConnection, sellTx, [feeWalletKp, sellWallets[0], sellWallets[1]])
                                // console.log("🚀 ~ customSell ~ sig:", sig)
                                const versionedSellTx = await buildVersionedTx(solanaConnection, feeWalletKp.publicKey, sellTx);
                                versionedSellTx.sign([feeWalletKp, ...sellWallets.slice(i + 1 - (cnt_versioned % 4), i + 1)]);
                                versionedSelltxs.push(versionedSellTx);
                                const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                if (res) {
                                    setTotalTokenAmount(totalTokenAmount - (cnt_versioned % 16) * sellAmount);
                                } else {
                                    console.log("Failed transaction!")
                                }
                            }
                        }
                    } else {
                        const sellIns_pumpswap = await tokenSell_pumpswap(sellWallets[i], new PublicKey(poolId), sellAmount)
                        sellTx.add(...sellIns_pumpswap)
                        if (!(cnt_versioned % 2)) {
                            cnt_jito = cnt_jito + 1;
                            const versionedSellTx = await buildVersionedTx(solanaConnection, feeWalletKp.publicKey, sellTx);
                            versionedSellTx.sign([feeWalletKp, ...sellWallets.slice(cnt_versioned - 2, cnt_versioned)]);
                            versionedSelltxs.push(versionedSellTx);

                            sellTx.instructions = [];

                            if (!(cnt_jito % 4)) {
                                const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                if (res) {
                                    setTotalTokenAmount(totalTokenAmount - 8 * sellAmount);
                                    for (let j = 0; j < 4; j++) {
                                        versionedSelltxs.pop();
                                    }
                                } else {
                                    console.log("Failed transaction!")
                                }
                                await sleep(800);
                            } else {
                                if (i === tableData.length - 1) {
                                    const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                    if (res) {
                                        setTotalTokenAmount(totalTokenAmount - (cnt_versioned % 8) * sellAmount);
                                    } else {
                                        console.log("Failed transaction!")
                                    }
                                }
                            }
                        } else {
                            if (i === tableData.length - 1) {
                                // const sig = await sendAndConfirmTransaction(solanaConnection, sellTx, [feeWalletKp, sellWallets[0], sellWallets[1]])
                                // console.log("🚀 ~ customSell ~ sig:", sig)
                                const versionedSellTx = await buildVersionedTx(solanaConnection, feeWalletKp.publicKey, sellTx);
                                versionedSellTx.sign([feeWalletKp, ...sellWallets.slice(i + 1 - (cnt_versioned % 2), i + 1)]);
                                versionedSelltxs.push(versionedSellTx);
                                const res = await jitoWithAxios(versionedSelltxs, feeWalletKp, jitoLocation)
                                if (res) {
                                    setTotalTokenAmount(totalTokenAmount - (cnt_versioned % 8) * sellAmount);
                                } else {
                                    console.log("Failed transaction!")
                                }
                            }
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
            <button className="flex items-center justify-center border border-[#211C33] rounded-md h-[45px] w-full" onClick={() => customSell(nums)}>
                <p className="text-[#AAAFB8] text-[16px] font-semibold">{formatNumber(nums)}</p>
            </button >
            <p className="text-[#AAAFB8] text-[12px] font-normal text-center">Amount to sell</p>
        </div>
    )
}

export default AmountItem
