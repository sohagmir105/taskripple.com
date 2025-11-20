import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckCircle, Wallet, Users, LogOut, 
  ShieldCheck, ListTodo, DollarSign, Menu, X, CheckSquare
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = isAdmin ? [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Task Approvals', path: '/admin/approvals', icon: CheckSquare },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Tasks', path: '/admin/tasks', icon: ListTodo },
    { label: 'Deposits', path: '/admin/deposits', icon: DollarSign },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: Wallet },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: ListTodo },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'Referrals', path: '/referrals', icon: Users },
    { label: 'Activation', path: '/activation', icon: CheckCircle },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b p-4 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold text-indigo-600">TaskRipple</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" />
              TaskRipple
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin ? 'Administrator' : 'User Dashboard'}
            </p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-14 lg:mt-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <div className="mb-4 px-4">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0 min-w-0 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
};