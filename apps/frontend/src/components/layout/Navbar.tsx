import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User as UserIcon } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="h-[52px] bg-canvas-parchment/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 select-none border-b border-hairline font-sans">
      <div className="flex items-center gap-3">
        <span className="text-[17px] font-semibold tracking-apple-tight text-ink">
          Document Intelligence
        </span>
        {isAdmin ? (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[11px] font-semibold">
            <Shield className="w-3 h-3" /> Admin
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-soft text-muted-ink border border-hairline text-[11px] font-semibold">
            <UserIcon className="w-3 h-3 text-muted-ink" /> User
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-[13px]">
        {user && (
          <div className="hidden md:flex items-center gap-2 text-muted-ink font-normal">
            <span>Logged in as:</span>
            <span className="text-ink font-semibold">{user.name}</span>
          </div>
        )}
        <UserButton afterSignOutUrl="/login" />
      </div>
    </header>
  );
};

