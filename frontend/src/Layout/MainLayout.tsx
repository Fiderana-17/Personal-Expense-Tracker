import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard/Dashboard";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Dashboard />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <p className="text-blue-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      case 'income':
        return <p className="text-amber-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      case 'categories':
        return <p className="text-green-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      case 'reports':
        return <p className="text-fuchsia-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      case 'receipts':
        return <p className="text-lime-500 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      case 'profile':
        return <p className="text-red-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
      default:
        return <p className="text-red-600 text-3xl text-center mt-40">contenu à changer dans <br /> components/Layout/MainLayout.tsx</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto p-8">
          {children}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
