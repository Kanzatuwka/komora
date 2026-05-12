import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { PageLoader } from '@/shared/components/Loader';
import { 
  BarChart3, 
  Package, 
  FileText, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Database,
  Languages
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/Button';
import { AdminSearch } from '../components/AdminSearch';
import { AdminNotifications } from '../components/AdminNotifications';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrencySwitcher } from '@/shared/components/CurrencySwitcher';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // No need for protection check here as it is handled by ProtectedRoute in AppRouter
  if (!user) return null; // Safety check for TS even if it shouldn't happen

  const menuItems = [
    { label: 'Статистика', path: '/admin', icon: BarChart3 },
    { label: 'Замовлення', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Продукти', path: '/admin/products', icon: Package },
    { label: 'Блог', path: '/admin/blog', icon: FileText },
    { label: 'Категорії блогу', path: '/admin/blog/categories', icon: Settings },
    { label: 'Підписники', path: '/admin/subscribers', icon: Users },
    { label: 'Розсилка', path: '/admin/newsletter', icon: Bell },
    { label: 'Налаштування', path: '/admin/settings', icon: Settings },
    { label: 'Бекап', path: '/admin/backup', icon: Database },
    { label: 'Міграція', path: '/admin/migrate', icon: Languages },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-farm-green text-white z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="text-2xl font-black italic tracking-tighter">КОМОРА ADM</Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
                  location.pathname === item.path ? "bg-white text-farm-green shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" /> Вийти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-400" />
          </button>

          <div className="flex-1 lg:max-w-md mx-8">
            <AdminSearch />
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-gray-100">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            <AdminNotifications />
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.displayName || 'Admin'}</p>
                <p className="text-[10px] font-bold text-farm-green leading-none">Власник</p>
              </div>
              <div className="w-10 h-10 bg-farm-green/10 rounded-full flex items-center justify-center text-farm-green font-bold">
                {user.displayName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
