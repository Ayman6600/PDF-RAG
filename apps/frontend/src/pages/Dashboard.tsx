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
        <h2 className="text-2xl font-semibold text-ink tracking-apple-headline">Knowledge Base Dashboard</h2>
        <p className="text-xs text-muted-ink mt-1 tracking-apple-tight">Overview of transformed OKF documents, hybrid indices, and system metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-ink uppercase tracking-apple-tight">Total Documents</div>
            <div className="text-3xl font-semibold text-ink mt-1 tracking-apple-headline">{totalDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-canvas-parchment text-ink flex items-center justify-center border border-hairline">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-ink uppercase tracking-apple-tight">Indexed & Ready</div>
            <div className="text-3xl font-semibold text-[#30d158] mt-1 tracking-apple-headline">{readyDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#30d158]/10 text-[#30d158] flex items-center justify-center border border-[#30d158]/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-ink uppercase tracking-apple-tight">Processing</div>
            <div className="text-3xl font-semibold text-primary mt-1 tracking-apple-headline">{processingDocs}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-ink uppercase tracking-apple-tight">Chunks Indexed</div>
            <div className="text-3xl font-semibold text-purple-600 mt-1 tracking-apple-headline">{totalChunks}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action & System Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink text-base tracking-apple-headline">Recent Knowledge Documents</h3>
            <Link to="/documents" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold tracking-apple-tight">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center text-muted-ink text-xs font-mono">
              No recent documents found. Go to Documents to upload your first PDF.
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-semibold text-ink text-sm tracking-apple-tight">{doc.name}</span>
                      <div className="text-xs text-muted-ink font-mono">{doc.pageCount || 1} Pages • {doc.status}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-soft font-mono">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-canvas p-6 rounded-[18px] border border-hairline shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-ink text-base tracking-apple-headline">Hybrid Retrieval Specs</h3>
            <p className="text-xs text-muted-ink mt-1 leading-relaxed font-normal tracking-apple-tight">
              Combines pgvector Cosine similarity with PostgreSQL TSVector full-text BM25 search. Rankings are fused via Reciprocal Rank Fusion (RRF k=60) and Cross-Encoder reranking.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-hairline">
            <Link
              to="/chat"
              className="w-full py-2.5 bg-primary hover:bg-primary-600 text-white rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              Start Grounded Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
