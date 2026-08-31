import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { router } from './app/router';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MissingConfigScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0c10] via-[#151821] to-[#0c0d12] p-6 text-white font-sans">
      <div className="max-w-lg w-full bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Missing Environment Variable</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The frontend requires <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> to initialize authentication.
          </p>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-3 font-mono text-slate-300">
          <div className="font-sans font-semibold text-slate-200">How to fix in Vercel:</div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-sans text-xs">
            <li>Go to your project on <span className="text-white font-semibold">Vercel Dashboard</span></li>
            <li>Navigate to <span className="text-white font-semibold">Settings &rarr; Environment Variables</span></li>
            <li>Add <span className="text-amber-300 font-mono">VITE_CLERK_PUBLISHABLE_KEY</span> with your Clerk Publishable Key value</li>
            <li>Add <span className="text-amber-300 font-mono">VITE_API_URL</span> pointing to your backend URL</li>
            <li>Go to <span className="text-white font-semibold">Deployments &rarr; Redeploy</span></li>
          </ol>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full h-11 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (!CLERK_PUBLISHABLE_KEY) {
  root.render(<MissingConfigScreen />);
} else {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ClerkProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}


