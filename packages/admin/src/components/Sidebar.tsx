// packages/admin/src/components/Sidebar.tsx
// Premium, collapsible navigation sidebar — Light Theme

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  FileText,
  Warehouse,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Orders', path: '/orders', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Warehouse },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ease-in-out z-25 border-r border-border shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Header Logo */}
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary/10 p-2 rounded-lg text-primary flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#E0C375] to-[#34495E] bg-clip-text text-transparent">
                BazaarBasket
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground hidden md:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white text-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-border">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-border bg-gray-50/50">
        {!collapsed && (
          <div className="mb-3 px-2 overflow-hidden text-ellipsis">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              logout().catch(console.error);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-destructive hover:bg-red-50 transition-colors duration-200 ${
            collapsed ? 'hover:bg-red-50' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-semibold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
