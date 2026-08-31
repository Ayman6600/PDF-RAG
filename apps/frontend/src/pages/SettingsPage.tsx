import React from 'react';
import { Sliders, Database, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      <div>
        <h2 className="text-2xl font-semibold text-ink tracking-apple-headline">Platform Settings</h2>
        <p className="text-xs text-muted-ink mt-1 tracking-apple-tight">Configure retrieval options, AI adapters, and multi-tenancy access control.</p>
      </div>

      <div className="bg-canvas rounded-[18px] p-6 border border-hairline shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-ink text-sm flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-primary" /> AI LLM & Embedding Providers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline">
              <label className="block text-xs font-medium text-ink mb-1.5 pl-1">Active LLM Provider</label>
              <select className="w-full bg-canvas border border-hairline rounded-full px-4 h-9 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent transition-all">
                <option value="openai">OpenAI (gpt-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="google">Google Gemini 1.5 Pro</option>
              </select>
            </div>
            <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline">
              <label className="block text-xs font-medium text-ink mb-1.5 pl-1">Active Embedding Model</label>
              <select className="w-full bg-canvas border border-hairline rounded-full px-4 h-9 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent transition-all">
                <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536d)</option>
                <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072d)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-hairline">
          <h3 className="font-semibold text-ink text-sm flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-primary" /> Hybrid Search & Fusion Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline">
              <span className="text-[10px] font-semibold text-muted-ink block uppercase tracking-wider">Vector Candidates</span>
              <span className="text-lg font-semibold text-ink mt-1 block tracking-apple-headline">Top 30</span>
            </div>
            <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline">
              <span className="text-[10px] font-semibold text-muted-ink block uppercase tracking-wider">Full-Text BM25</span>
              <span className="text-lg font-semibold text-ink mt-1 block tracking-apple-headline">Top 30</span>
            </div>
            <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline">
              <span className="text-[10px] font-semibold text-muted-ink block uppercase tracking-wider">RRF Fusion Constant (k)</span>
              <span className="text-lg font-semibold text-primary mt-1 block tracking-apple-headline">60</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
