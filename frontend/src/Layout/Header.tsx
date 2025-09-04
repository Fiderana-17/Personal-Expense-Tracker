import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-background shadow-xs border-b border-white/10 duration-500">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-7">
            <Logo isDark={isDark} />
            <h1 className="text-3xl font-bold text-title font-[Raleway] duration-500">
              Expense<span className="text-blue-500">Tracker</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4 relative">
            <Switch onToggle={setIsDark} />
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <div className="flex items-center space-x-3" ref={menuRef}>
              <div className="flex items-center space-x-3 relative">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-title duration-500">
                    {user?.name}
                  </span>
                </div>

                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center shadow-sm focus:outline-hidden"
                >
                  <User className="h-5 w-5 text-blue-600" />
                </button>

                <div
                  className={`absolute z-1 right-0 top-12.5 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/10 transition-all duration-200 ease-out ${
                    menuOpen
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    Your profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>              
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;