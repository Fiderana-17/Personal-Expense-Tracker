import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-aside duration-500">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 relative scrollbar-custom">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;