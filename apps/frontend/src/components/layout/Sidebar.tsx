import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  ShieldCheck,
  PanelLeftClose,
  UploadCloud,
  Eye,
  Trash2,
  CheckCircle2,
  Plus,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';
import { useSidebar } from '../../context/SidebarContext';

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

export const Sidebar: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const activeConvId = searchParams.get('conversationId') || undefined;
  const selectedDocId = searchParams.get('documentId') || undefined;

  const fetchDocuments = async () => {
    try {
      const res: any = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res: any = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
    const interval = setInterval(fetchDocuments, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Only PDF files are supported');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments();
    } catch (err: any) {
      alert(err.error?.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${id}`);
      if (activeConvId === id) {
        searchParams.delete('conversationId');
        setSearchParams(searchParams);
      }
      fetchConversations();
    } catch (err: any) {
      alert('Failed to delete conversation');
    }
  };

  const handleNewChat = () => {
    searchParams.delete('conversationId');
    searchParams.delete('documentId');
    setSearchParams(searchParams);
    navigate('/chat');
  };

  const handleDocSelect = (id: string) => {
    searchParams.set('documentId', id);
    searchParams.delete('conversationId');
    setSearchParams(searchParams);
    navigate('/chat');
  };

  const handleAllDocsSelect = () => {
    searchParams.delete('documentId');
    searchParams.delete('conversationId');
    setSearchParams(searchParams);
    navigate('/chat');
  };

  const handleConvSelect = (id: string) => {
    searchParams.set('conversationId', id);
    searchParams.delete('documentId');
    setSearchParams(searchParams);
    navigate('/chat');
  };

  const handleViewPDF = (e: React.MouseEvent, docId: string, docName: string) => {
    e.stopPropagation();
    searchParams.set('viewPdf', docId);
    searchParams.set('pdfName', docName);
    setSearchParams(searchParams);
  };

  return (
    <aside className="w-72 h-full bg-canvas-parchment flex flex-col justify-between p-4 shrink-0 overflow-hidden select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header Block */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 active:scale-95 transition-all">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-ink tracking-apple-headline">RAG-PDF</h1>
              <p className="text-[10px] text-primary font-semibold tracking-apple-tight">Office Intelligence</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-canvas text-muted-ink hover:text-ink rounded-full transition-all active:scale-95 cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Quick Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleNewChat}
            className="h-10 bg-primary hover:bg-primary-600 text-white rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
          <label className="h-10 bg-canvas text-ink hover:bg-canvas/80 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-hairline cursor-pointer">
            <UploadCloud className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{isUploading ? 'Ingesting...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>

        {/* Main Navigation & Lists Wrapper */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Section: Platform Apps Navigation */}
          <div className="space-y-1">
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-ink hover:text-ink hover:bg-canvas'
                }`
              }
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Platform Overview (Home)</span>
            </NavLink>

            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                  isActive || selectedDocId || activeConvId
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-ink hover:text-ink hover:bg-canvas'
                }`
              }
              onClick={handleAllDocsSelect}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Grounded Chat Workspace</span>
            </NavLink>
          </div>

          {/* Section: PDF Workspace Library */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-muted-ink uppercase tracking-wider px-2 pb-1 select-none">
              PDF Workspace Library
            </div>
            
            <div
              onClick={handleAllDocsSelect}
              className={`p-2.5 rounded-xl cursor-pointer transition-all text-xs font-semibold active:scale-[0.98] ${
                selectedDocId === undefined && activeConvId === undefined
                  ? 'bg-primary/10 text-primary'
                  : 'bg-canvas text-muted-ink hover:text-ink hover:bg-canvas/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>🌐 All Uploaded Documents</span>
                {selectedDocId === undefined && activeConvId === undefined && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-muted-soft font-mono bg-canvas rounded-xl">No PDFs uploaded</div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocSelect(doc.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                    selectedDocId === doc.id
                      ? 'bg-primary/10 text-ink shadow-sm'
                      : 'bg-canvas text-ink hover:bg-canvas/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs truncate text-ink">{doc.name}</h4>
                      <div className="text-[9px] text-muted-ink font-mono mt-0.5">
                        {doc.pageCount || 1} Pages • {doc.status}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleViewPDF(e, doc.id, doc.name)}
                      className="p-1 text-muted-ink hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Quick View PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section: Chat Threads History */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-muted-ink uppercase tracking-wider px-2 pb-1 select-none">
              Recent Chats History
            </div>

            {conversations.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-muted-soft font-mono bg-canvas rounded-xl">No recent chats</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleConvSelect(conv.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs font-semibold active:scale-[0.98] ${
                    activeConvId === conv.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-ink hover:text-ink hover:bg-canvas/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConv(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-error-red transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="pt-3 border-t border-hairline mt-auto space-y-2.5">
        <div className="px-1.5 flex items-center gap-2 text-[10px] text-[#30d158] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse"></span>
          <span>Engine Active</span>
        </div>
      </div>
    </aside>
  );
};
