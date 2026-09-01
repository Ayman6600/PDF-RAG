import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { router } from './app/router';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MissingConfigScreen: React.FC<{ missingVars: string[] }> = ({ missingVars }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] p-6 text-white font-sans">
      <div className="max-w-lg w-full bg-[#161b22] border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Missing Environment Variables</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The frontend is missing required build-time variables:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingVars.map((v) => (
              <code key={v} className="bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded text-amber-300 font-mono text-xs">
                {v}
              </code>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-3 font-mono text-slate-300">
          <div className="font-sans font-semibold text-slate-200">How to fix in Vercel:</div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 font-sans text-xs">
            <li>Go to your project on <span className="text-white font-semibold">Vercel Dashboard</span></li>
            <li>Navigate to <span className="text-white font-semibold">Settings &rarr; Environment Variables</span></li>
            <li>Add <span className="text-amber-300 font-mono">VITE_API_URL</span> pointing to your backend URL (e.g. <span className="text-slate-300">https://your-backend.onrender.com</span>)</li>
            <li>Add <span className="text-amber-300 font-mono">VITE_CLERK_PUBLISHABLE_KEY</span> with your Clerk Publishable Key</li>
            <li>Go to <span className="text-white font-semibold">Deployments &rarr; Redeploy</span> (make sure to untick "Use existing build cache")</li>
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

const missing: string[] = [];
if (!CLERK_PUBLISHABLE_KEY) missing.push('VITE_CLERK_PUBLISHABLE_KEY');
if (!API_URL && import.meta.env.PROD) missing.push('VITE_API_URL');

if (missing.length > 0) {
  root.render(<MissingConfigScreen missingVars={missing} />);
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


