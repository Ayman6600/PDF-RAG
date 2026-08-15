import React from 'react';
import { Sliders, Shield, Database, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">Platform Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure retrieval options, AI adapters, and multi-tenancy access control.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-border space-y-6">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-indigo-400" /> AI LLM & Embedding Providers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Active LLM Provider</label>
              <select className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white">
                <option value="openai">OpenAI (gpt-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="google">Google Gemini 1.5 Pro</option>
              </select>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Active Embedding Model</label>
              <select className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white">
                <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536d)</option>
                <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072d)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-indigo-400" /> Hybrid Search & Fusion Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border">
              <span className="text-xs text-gray-400 block font-mono">Vector Candidates</span>
              <span className="text-lg font-bold text-white mt-1 block">Top 30</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <span className="text-xs text-gray-400 block font-mono">Full-Text BM25</span>
              <span className="text-lg font-bold text-white mt-1 block">Top 30</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <span className="text-xs text-gray-400 block font-mono">RRF Fusion constant (k)</span>
              <span className="text-lg font-bold text-indigo-400 mt-1 block">60</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
