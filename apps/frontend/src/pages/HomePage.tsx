import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Layers, BookOpen, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Hero Section inspired by designmd.ai */}
      <div className="relative rounded-3xl glass-panel p-10 md:p-16 overflow-hidden border border-border/80 shadow-2xl text-center">
        {/* Glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-indigo-600/30 via-cyan-500/20 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Enterprise Document Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transform Your PDFs into Grounded{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              OKF Knowledge
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Scale your document intelligence across 1,000+ PDFs using pgvector hybrid search, Reciprocal Rank Fusion, Groq Cloud real-time streaming, and page-level citations.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/chat"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <span>Launch Document Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/documents"
              className="px-6 py-4 bg-surface hover:bg-surface-hover border border-border text-gray-200 rounded-2xl font-bold text-sm transition-all"
            >
              Manage Document Library
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border hover:border-indigo-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">OKF Knowledge Transformation</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Automatically parses multi-page PDFs into structured Open Knowledge Format bundles complete with YAML frontmatter, table-of-contents indexing, and cross-section graphs.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border hover:border-cyan-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20 shadow-md">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Hybrid Retrieval & RRF Fusion</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Combines pgvector cosine similarity with PostgreSQL TSVector BM25 full-text search. Candidates are merged via Reciprocal Rank Fusion (RRF k=60) and Cross-Encoder reranking.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Verifiable Page-Level Citations</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every answer is strictly grounded with citations formatted as [DocumentName — Page X]. Click any citation card to navigate straight to that page in the embedded PDF viewer.
          </p>
        </div>
      </div>

      {/* Account Info Banner */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-300 font-extrabold text-lg flex items-center justify-center border border-indigo-500/30">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base">{user?.name || 'Admin User'}</h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-500/30">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Neon Cloud Postgres & Groq Cloud Connected</span>
        </div>
      </div>
    </div>
  );
};
