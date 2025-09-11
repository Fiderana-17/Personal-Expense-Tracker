import React from 'react';
import { LayoutDashboard, CreditCard, TrendingUp, FolderOpen, Settings, LogOut} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { path: '/expenses', label: t("sidebar.expenses"), icon: CreditCard },
    { path: '/income', label: t("sidebar.income"), icon: TrendingUp },
    { path: '/categories', label: t("sidebar.categories"), icon: FolderOpen },
    { path: '/profile', label: t("sidebar.profile"), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-page duration-500 shadow-xs border-gray-200 h-[calc(100vh-60px)] flex flex-col justify-between">
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
          className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-logout transition-all duration-200 hover:text-red-600 text-title-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;