import CustormInput from "@/components/CustormInput";
import { AmountItem, WalletTable } from "@/components/Home";
import { amountList } from "@/constants";

const Dashboard = () => {
  return (
    <div className="flex flex-col w-full h-full gap-6 border-t border-r border-[#211C33] rounded-tr-md px-8 py-8 relative">
      <CustormInput />
      <div className="flex flex-col gap-2">
        <p className="text-[#AAAFB8] text-[16px] font-semibold capitalize">presets</p>
        <div className="flex w-full items-center justify-between gap-4">
          {amountList.map((item, index) => (
            <AmountItem key={index} nums={item} />
          ))}
        </div>
      </div>
      <WalletTable />
    </div>
  );
};

export default Dashboard;
