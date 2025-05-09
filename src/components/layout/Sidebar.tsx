import cn from "classnames";

const Sidebar = () => {

  return (
    <div
      className={cn(
        "flex flex-col",
        "w-[536px] h-full",
        "py-8 px-6 gap-4",
        "border-t border-l border-[#211C33]",
        "rounded-tl-md"
      )}
    >
      <p className="text-white text-[16px] font-semibold capitalize">parameters</p>
    </div >
  );
};

export default Sidebar;
