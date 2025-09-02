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
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: CreditCard },
    { path: '/income', label: 'Income', icon: TrendingUp },
    { path: '/categories', label: 'Categories', icon: FolderOpen },
    { path: '/reports', label: 'Reports', icon: PieChart },
    { path: '/receipts', label: 'Receipts', icon: Receipt },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-background duration-500 shadow-xs border-gray-200 h-[calc(100vh-60px)] flex flex-col justify-between">
      <nav className="mt-8">
        <div className="px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-500 ${
                    isActive
                      ? 'bg-background-hover text-blue-700 border-r-2 border-blue-700'
                      : 'text-title hover:bg-background-hover hover:text-title bg-backgroundy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bouton Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-left  rounded-lg hover:bg-logout transition-all duration-200 hover:text-red-600 text-title-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;