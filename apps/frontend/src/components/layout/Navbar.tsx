import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="h-16 glass-panel border-b border-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-semibold">
          OKF Knowledge v1.0
        </span>
        {isAdmin ? (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Shield className="w-3 h-3" /> Admin Access
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
            <UserIcon className="w-3 h-3 text-indigo-400" /> User Access
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-surface px-3.5 py-1.5 rounded-xl border border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-extrabold text-sm border border-indigo-500/30">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white leading-tight">{user?.name || 'User'}</span>
              <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase rounded border border-indigo-500/30">
                {user?.role || 'USER'}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
