import { useUserProvider } from "@/contexts/UserContext";
import { Icon } from "@iconify-icon/react";

const CustormInput = () => {
    const { mint, setMint } = useUserProvider()

    const clearInput = () => {
        // Logic to send chat mint
        setMint('');
    };

    return (
        <div className='flex w-full items-center justify-between h-[45px] pl-[7px] py-[2px] bg-[#141625] rounded-md'>
            <input
                type="text"
                placeholder='CA Address'
                value={mint}
                className='text-[#646C7C] focus:text-white w-[70%] bg-[#141625] outline-none'
                onChange={(e) => setMint(e.target.value)}
            />
            <button className="flex h-full w-[45px] items-center justify-center bg-[#211C33] rounded-md border border-[#524b6d]" onClick={() => clearInput()}>
                <Icon icon="lets-icons:close-round" width="24" height="24" style={{ color: "#ff000080" }} />
            </button>
        </div>
    )
}

export default CustormInput
