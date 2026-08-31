import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Signup: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0c10] via-[#151821] to-[#0c0d12] p-4 relative overflow-hidden font-sans select-none">
      
      {/* Abstract Background Blur Glows */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 flex flex-col items-center space-y-6">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none pt-2">
            RAG-PDF Platform
          </h2>
          <p className="text-sm text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Document Intelligence Portal</span>
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#0f172a',
              colorInputBackground: '#020617',
              colorText: '#ffffff',
              colorTextSecondary: '#94a3b8',
              colorInputText: '#ffffff',
              colorBorder: '#1e293b'
            },
            elements: {
              card: 'border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl w-full',
              headerTitle: 'text-white font-extrabold text-xl',
              headerSubtitle: 'text-slate-400 text-sm font-medium',
              socialButtonsBlockButton: 'bg-slate-950/50 border border-slate-800 text-white hover:bg-slate-900',
              socialButtonsBlockButtonText: 'text-white font-semibold',
              dividerLine: 'bg-slate-800',
              dividerText: 'text-slate-500 font-medium text-xs',
              formFieldLabel: 'text-slate-400 font-semibold text-xs',
              formFieldInput: 'bg-slate-950/50 border border-slate-800 text-white focus:border-indigo-500 h-12 rounded-xl text-sm font-medium transition-all',
              formButtonPrimary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-none shadow-lg h-12 rounded-xl text-sm font-bold',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold',
              footer: 'bg-[#0f172a]'
            }
          }}
          signInUrl="/login"
          redirectUrl="/home"
        />

      </div>
    </div>
  );
};
