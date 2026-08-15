import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, Cpu, Layers, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../components/documents/DocumentList';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res: any = await api.get('/documents');
        setDocuments(res.data || []);
      } catch (err: any) {
        console.error('Failed to load documents:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === 'READY').length;
  const processingDocs = documents.filter((d) => ['PROCESSING', 'INDEXING', 'UPLOADING'].includes(d.status)).length;
  const failedDocs = documents.filter((d) => d.status === 'FAILED').length;
  const totalChunks = documents.reduce((sum, d) => sum + (d._count?.chunks || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">Knowledge Base Dashboard</h2>
        <p className="text-xs text-gray-400 mt-1">Overview of transformed OKF documents, hybrid indices, and system metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Documents</div>
            <div className="text-3xl font-extrabold text-white mt-1">{totalDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Indexed & Ready</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{readyDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">BullMQ Processing</div>
            <div className="text-3xl font-extrabold text-cyan-400 mt-1">{processingDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OKF Chunks Indexed</div>
            <div className="text-3xl font-extrabold text-purple-400 mt-1">{totalChunks}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action & System Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">Recent Knowledge Documents</h3>
            <Link to="/documents" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs font-mono">
              No recent documents found. Go to Documents to upload your first PDF.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold text-white text-sm">{doc.name}</span>
                      <div className="text-xs text-gray-400 font-mono">{doc.pageCount || 1} Pages • {doc.status}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Hybrid Retrieval Specs</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Combines pgvector Cosine similarity with PostgreSQL TSVector full-text BM25 search. Rankings are fused via Reciprocal Rank Fusion (RRF k=60) and Cross-Encoder reranking.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Link
              to="/chat"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Start Grounded Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
