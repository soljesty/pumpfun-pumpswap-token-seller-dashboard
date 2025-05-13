import cn from "classnames";
import { JitoDropdown } from "../Dropdown";
import Input from "../Input";
import { useUserProvider } from "@/contexts/UserContext";
import { setPresets } from "@/utils/utils";
import { useEffect } from "react";

const Sidebar = () => {
  const { presets, setPresetsState } = useUserProvider()

  const params: string[] = ["param 1: ", "param 2: ", "param 3: ", "param 4: ", "param 5: "];

  const changeParam = (index: number, value: string) => {
    const updatedPresets = [...presets];
    updatedPresets[index] = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10); // Update the specific parameter
    setPresetsState(updatedPresets); // Sync with global state (optional)
    setPresets((updatedPresets)); // Update local state
  };

  useEffect(() => {
    if (presets.length !== 0) {
      console.log("presets", presets);
      console.log("presets[0]", presets[0]);
      console.log("presets[0].toString()", presets[0].toString());
    }
  }, [presets])

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
      <JitoDropdown />
      <div className="flex flex-col w-full gap-3">
        <p className="text-white text-[16px] font-semibold capitalize">presets</p>
        {presets.length !== 0 && params.map((item, index) => (
          <Input key={index} index={index} label={item} value={presets[index].toString()} onChange={(index, e) => changeParam(index, e.target.value)} />
        ))}
      </div>
    </div >
  );
};

export default Sidebar;
