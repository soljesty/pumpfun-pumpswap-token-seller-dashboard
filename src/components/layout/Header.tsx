import cn from "classnames";

const Header = () => {
    return (
        <div
            className={cn(
                "flex items-center",
                "justify-between",
                "w-full h-[97px]",
                "px-[30px]",
                "bg-[#100E1D]"
            )}
        >
            <p className="text-white text-[20px] font-extrabold capitalize">token seller dashboard</p>
        </div>
    )
}

export default Header
