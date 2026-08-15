import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Settings, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'Document Workspace', icon: MessageSquare },
    { to: '/documents', label: 'Document Library', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel flex flex-col justify-between p-4 border-r border-border shrink-0">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide">OKF RAG</h1>
            <p className="text-xs text-indigo-400 font-medium">Document Intelligence</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 glass-card rounded-xl border border-indigo-500/20">
        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">System Status</div>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>pgvector Engine Ready</span>
        </div>
      </div>
    </aside>
  );
};
