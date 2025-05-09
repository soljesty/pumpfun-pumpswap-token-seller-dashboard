import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="flex flex-col w-full bg-[#131121] text-white h-screen font-monts relative">
      <Header />
      <div className="flex gap-6 w-full h-[calc(100vh-97px)] bg-[#131121]">
        <Outlet />
        <Sidebar />
      </div>
    </div>
  );
};

export default Layout;
