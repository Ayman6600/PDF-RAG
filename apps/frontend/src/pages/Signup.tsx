import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { ShieldCheck, FileText } from 'lucide-react';

export const Signup: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] p-4 relative font-sans select-none">
      <div className="w-full max-w-[420px] z-10 flex flex-col items-center space-y-6">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none pt-2">
            RAG-PDF Platform
          </h2>
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Document Intelligence Portal</span>
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#0066cc',
              colorBackground: '#161b22',
              colorInputBackground: '#0d1117',
              colorText: '#ffffff',
              colorTextSecondary: '#8b949e',
              colorInputText: '#ffffff',
              colorBorder: '#30363d'
            },
            elements: {
              card: 'border border-slate-800 shadow-xl rounded-2xl w-full',
              headerTitle: 'text-white font-extrabold text-xl',
              headerSubtitle: 'text-slate-400 text-sm font-medium',
              socialButtonsBlockButton: 'bg-slate-900 border border-slate-700 text-white hover:bg-slate-800',
              socialButtonsBlockButtonText: 'text-white font-semibold',
              dividerLine: 'bg-slate-700',
              dividerText: 'text-slate-500 font-medium text-xs',
              formFieldLabel: 'text-slate-300 font-semibold text-xs',
              formFieldInput: 'bg-slate-900 border border-slate-700 text-white focus:border-primary h-11 rounded-xl text-sm font-medium transition-all',
              formButtonPrimary: 'bg-primary hover:bg-primary-600 text-white border-none shadow-sm h-11 rounded-xl text-sm font-bold transition-all',
              footerActionLink: 'text-primary hover:underline font-semibold',
              footer: 'bg-[#161b22]'
            }
          }}
          signInUrl="/login"
          redirectUrl="/home"
        />

      </div>
    </div>
  );
};
