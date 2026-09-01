import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  UploadCloud, 
  Layers, 
  MessageSquare, 
  Plus, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Loader2,
  Lock,
  ChevronRight,
  Shield,
  Activity,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  fileSize: number;
  status: 'UPLOADING' | 'PROCESSING' | 'INDEXING' | 'READY' | 'FAILED' | 'ARCHIVED';
  pageCount: number;
  createdAt: string;
  _count?: { sections: number; chunks: number };
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Dynamic States
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingDocs(false);
      setIsLoadingConvs(false);
      return;
    }
    fetchDocuments();
    fetchConversations();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('Only PDF files are supported');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res: any = await api.post('/documents', formData);
      fetchDocuments();
      navigate(`/chat?documentId=${res.id || res.data?.id}`);
    } catch (err: any) {
      const msg = err.status ? `Error ${err.status}: ${err.message}` : (err.message || 'Failed to upload PDF');
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === 'READY').length;
  const processingDocs = documents.filter((d) => ['PROCESSING', 'INDEXING', 'UPLOADING'].includes(d.status)).length;
  const totalChunks = documents.reduce((sum, d) => sum + (d._count?.chunks || 0), 0);

  // Landing Page View (Unauthenticated User)
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto space-y-16 py-10 px-4 select-none font-sans">
        
        {/* Clean, Human-Focused Landing Hero */}
        <div className="text-center space-y-6 relative py-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-soft border border-hairline text-ink text-xs font-semibold tracking-wide animate-fade-in shadow-xs">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Document Intelligence Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-ink tracking-tight leading-tight max-w-4xl mx-auto">
            Transform PDFs into <br />
            <span className="text-primary font-bold">
              Grounded Knowledge & Drafts
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-ink leading-relaxed max-w-2xl mx-auto font-normal">
            A clean, human-centered document intelligence platform. Analyze, research, and compose structured workspace drafts grounded directly in verified PDF citations.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-primary hover:bg-primary-600 text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="#features"
              className="px-6 py-3.5 bg-canvas hover:bg-canvas-parchment border border-hairline text-ink rounded-full font-bold text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Explore Features</span>
            </a>
          </div>
        </div>

        {/* Dynamic Visual Mockup of the Platform */}
        <div className="relative border border-hairline bg-canvas rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto">
          {/* Mock Browser Title Bar */}
          <div className="h-10 bg-canvas-parchment border-b border-hairline flex items-center px-4 gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="text-[10px] text-muted-ink font-mono mx-auto pl-10 select-none">
              workspace.rag-pdf.internal/chat
            </div>
          </div>

          <div className="grid grid-cols-3 h-[380px] text-xs">
            {/* Mock Sidebar */}
            <div className="col-span-1 border-r border-hairline bg-canvas-parchment/40 p-4 space-y-3">
              <div className="font-bold text-[10px] text-muted-ink uppercase tracking-wider">Document Library</div>
              <div className="space-y-2">
                <div className="p-2 bg-canvas border border-hairline rounded-lg flex items-center gap-2 shadow-xs">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-medium text-[11px] text-ink">financial_report_2026.pdf</span>
                </div>
                <div className="p-2 bg-canvas/60 border border-hairline/60 rounded-lg flex items-center gap-2 opacity-75">
                  <FileText className="w-4 h-4 text-muted-ink shrink-0" />
                  <span className="truncate text-[11px] text-muted-ink">product_specs_v3.pdf</span>
                </div>
                <div className="p-2 bg-canvas/60 border border-hairline/60 rounded-lg flex items-center gap-2 opacity-75">
                  <FileText className="w-4 h-4 text-muted-ink shrink-0" />
                  <span className="truncate text-[11px] text-muted-ink">company_compliance.pdf</span>
                </div>
              </div>
            </div>

            {/* Mock Chat Panel */}
            <div className="col-span-2 p-4 flex flex-col justify-between bg-canvas">
              <div className="space-y-3 overflow-y-auto">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-strong text-ink flex items-center justify-center shrink-0 font-bold text-[10px] border border-hairline">US</div>
                  <div className="bg-canvas-parchment/60 p-2.5 rounded-2xl rounded-tl-none border border-hairline text-[11px] text-ink max-w-[85%]">
                    Summarize the Q2 performance highlights.
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px] border border-primary/20"><FileText className="w-3.5 h-3.5" /></div>
                  <div className="bg-canvas p-2.5 rounded-2xl rounded-tl-none border border-hairline text-[11px] text-ink max-w-[85%] space-y-1.5 shadow-xs">
                    <p>Q2 net revenue increased by 14% year-over-year, driven by cloud workspace adoption.</p>
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-soft text-primary font-mono text-[9px] font-semibold border border-hairline">
                      financial_report_2026.pdf • Page 12
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="mt-4 pt-2 border-t border-hairline flex items-center gap-2">
                <div className="flex-1 bg-canvas-parchment border border-hairline rounded-full h-8 px-4 flex items-center text-muted-soft text-[11px]">
                  Ask questions about your uploaded documents...
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">Structured Document Intelligence</h2>
            <p className="text-xs text-muted-ink max-w-xl mx-auto">Equipped with hybrid search infrastructure for verified precision and clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-canvas p-6 rounded-2xl border border-hairline shadow-sm hover:border-border-strong transition-colors">
              <div className="w-10 h-10 rounded-xl bg-surface-soft text-ink flex items-center justify-center mb-4 border border-hairline">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-ink text-sm mb-1.5">Section Outline Extraction</h3>
              <p className="text-xs text-muted-ink leading-relaxed font-normal">
                PDF parser breaks down complex multi-page files into distinct hierarchy levels, exposing outline titles and document context.
              </p>
            </div>

            <div className="bg-canvas p-6 rounded-2xl border border-hairline shadow-sm hover:border-border-strong transition-colors">
              <div className="w-10 h-10 rounded-xl bg-surface-soft text-ink flex items-center justify-center mb-4 border border-hairline">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-ink text-sm mb-1.5">Hybrid Vector Search</h3>
              <p className="text-xs text-muted-ink leading-relaxed font-normal">
                pgvector dense embeddings combined with BM25 full-text indexing, re-arranged by Reciprocal Rank Fusion for perfect retrieval relevance.
              </p>
            </div>

            <div className="bg-canvas p-6 rounded-2xl border border-hairline shadow-sm hover:border-border-strong transition-colors">
              <div className="w-10 h-10 rounded-xl bg-surface-soft text-ink flex items-center justify-center mb-4 border border-hairline">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-ink text-sm mb-1.5">Office Drafting Workspace</h3>
              <p className="text-xs text-muted-ink leading-relaxed font-normal">
                Draft professional specifications, project memos, and executive drafts inside a dual-pane editor pulling straight from document facts.
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Dashboard View (Authenticated User)
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 select-none font-sans">
      
      {/* Clean, Refined Header */}
      <div className="relative rounded-2xl bg-canvas p-8 md:p-10 border border-hairline shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-ink text-xs font-semibold tracking-wide">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Workspace Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
            Welcome back, <span className="text-primary">{user?.name || 'Workspace User'}</span>.
            <br />
            Transform PDFs into grounded documents.
          </h1>

          <p className="text-xs sm:text-sm text-muted-ink leading-relaxed max-w-2xl font-normal">
            Query your PDF library using vector similarity, full-text search, and reranking. Ask questions, extract structured facts, and retrieve page-level citations instantly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/chat"
              className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Launch Grounded Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <label className="px-5 py-2.5 bg-surface-soft hover:bg-surface-strong border border-hairline text-ink rounded-full font-bold text-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Ingesting File...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-primary" />
                  <span>Quick Ingest PDF</span>
                </>
              )}
              <input 
                type="file" 
                accept=".pdf,application/pdf" 
                className="hidden" 
                onChange={handleQuickUpload} 
                disabled={isUploading} 
              />
            </label>
          </div>

          {uploadError && (
            <p className="text-[10px] text-error-red font-semibold pl-2">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-ink uppercase tracking-wider block">Total PDFs</span>
            <span className="text-2xl font-bold text-ink mt-1 block tracking-apple-headline">{isLoadingDocs ? '...' : totalDocs}</span>
          </div>
          <BookOpen className="w-8 h-8 text-muted-soft opacity-30" />
        </div>

        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-ink uppercase tracking-wider block">Ready Indices</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block tracking-apple-headline">{isLoadingDocs ? '...' : readyDocs}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
        </div>

        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-ink uppercase tracking-wider block">Processing</span>
            <span className="text-2xl font-bold text-primary mt-1 block tracking-apple-headline">{isLoadingDocs ? '...' : processingDocs}</span>
          </div>
          <Activity className="w-8 h-8 text-primary opacity-20 animate-pulse" />
        </div>

        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-ink uppercase tracking-wider block">Chunks Created</span>
            <span className="text-2xl font-bold text-purple-600 mt-1 block tracking-apple-headline">{isLoadingDocs ? '...' : totalChunks}</span>
          </div>
          <Layers className="w-8 h-8 text-purple-500 opacity-20" />
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Recent Chats */}
        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <h3 className="font-bold text-ink text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Continue Conversations
            </h3>
            <Link to="/chat" className="text-[11px] text-primary font-bold hover:underline">
              View Workspace
            </Link>
          </div>

          {isLoadingConvs ? (
            <div className="flex items-center justify-center p-8 text-xs text-muted-ink font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-1.5" /> Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-soft text-xs font-mono bg-canvas-parchment/30 rounded-xl">
              No recent conversations. Click "Launch Grounded Chat" to start.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 3).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat?conversationId=${conv.id}`}
                  className="block p-3 bg-canvas hover:bg-canvas-parchment/60 border border-hairline rounded-xl transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-xs text-ink truncate group-hover:text-primary transition-colors">{conv.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-soft group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Uploads */}
        <div className="bg-canvas p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <h3 className="font-bold text-ink text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Latest Uploads
            </h3>
            <Link to="/documents" className="text-[11px] text-primary font-bold hover:underline">
              View PDF Library
            </Link>
          </div>

          {isLoadingDocs ? (
            <div className="flex items-center justify-center p-8 text-xs text-muted-ink font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-1.5" /> Loading PDFs...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-muted-soft text-xs font-mono bg-canvas-parchment/30 rounded-xl">
              No recent documents. Drop a PDF file to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-canvas border border-hairline rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-ink truncate block">{doc.name}</span>
                    <span className="text-[9px] text-muted-ink font-mono">
                      {doc.pageCount || 1} Pages • {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      doc.status === 'READY' 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : doc.status === 'FAILED'
                        ? 'bg-error-red/10 text-error-red border border-error-red/20'
                        : 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
                    }`}>
                      {doc.status}
                    </span>
                    <Link
                      to={`/chat?documentId=${doc.id}`}
                      className="p-1.5 hover:bg-canvas-parchment rounded-lg border border-hairline text-muted-ink hover:text-primary transition-colors"
                      title="Open in Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Static features breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-canvas p-5 rounded-xl border border-hairline shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-surface-soft text-ink flex items-center justify-center mb-3 border border-hairline">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-bold text-ink text-xs mb-1">Outline Extraction</h4>
          <p className="text-[10px] text-muted-ink leading-relaxed">
            Directly parse multi-page PDFs into structured outlines with metadata and page citation coordinates.
          </p>
        </div>

        <div className="bg-canvas p-5 rounded-xl border border-hairline shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-surface-soft text-ink flex items-center justify-center mb-3 border border-hairline">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-bold text-ink text-xs mb-1">Hybrid Retrieval</h4>
          <p className="text-[10px] text-muted-ink leading-relaxed">
            Vector similarity fused with full-text search and ranked via Reciprocal Rank Fusion.
          </p>
        </div>

        <div className="bg-canvas p-5 rounded-xl border border-hairline shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-surface-soft text-ink flex items-center justify-center mb-3 border border-hairline">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-bold text-ink text-xs mb-1">Page-Level Citations</h4>
          <p className="text-[10px] text-muted-ink leading-relaxed">
            Every statement is grounded. Clicking citations opens the target page in the embedded PDF drawer.
          </p>
        </div>
      </div>

    </div>
  );
};
