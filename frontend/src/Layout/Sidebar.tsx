import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  FolderOpen, 
  PieChart,
  Receipt,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-xs border-r border-gray-200 h-[calc(100vh-66px)] flex flex-col justify-between">
      <nav className="mt-8">
        <div className="px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-600" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
