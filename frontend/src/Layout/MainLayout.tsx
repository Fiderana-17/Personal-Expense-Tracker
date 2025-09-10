import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 relative scrollbar-custom bg-aside duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;