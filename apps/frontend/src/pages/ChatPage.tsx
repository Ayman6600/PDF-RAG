import React, { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { PDFViewerModal } from '../components/pdf/PDFViewerModal';
import { MessageSquare, FileText, UploadCloud, Eye, Trash2, RefreshCw, CheckCircle2, Clock, Plus } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../components/documents/DocumentList';

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

export const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'history'>('documents');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedPDFModal, setSelectedPDFModal] = useState<{ id: string; name: string; page: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      if (activeConvId === id) setActiveConvId(undefined);
      fetchConversations();
    } catch (err: any) {
      alert('Failed to delete conversation');
    }
  };

  const selectedDocObj = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex gap-6 overflow-hidden">
      {/* Sidebar - Combined Documents & History */}
      <div className="w-80 glass-panel rounded-2xl border border-border flex flex-col p-4 shrink-0 overflow-hidden">
        {/* Quick Upload Button */}
        <label className="w-full py-2.5 px-4 mb-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer transition-all">
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? 'Ingesting PDF...' : 'Upload PDF Document'}</span>
          <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1 rounded-xl mb-4 border border-border">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDFs ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats ({conversations.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeTab === 'documents' ? (
            <>
              {/* Option to query ALL documents */}
              <div
                onClick={() => setSelectedDocId(undefined)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDocId === undefined
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-white shadow-md'
                    : 'bg-surface/50 border-border text-gray-400 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>🌐 All Uploaded Documents</span>
                  {selectedDocId === undefined && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Search across all indexed PDFs in your organization</p>
              </div>

              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-2">
                Your PDF Library
              </div>

              {documents.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 font-mono">No PDFs uploaded yet. Click Upload above!</div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedDocId === doc.id
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                        : 'bg-surface/40 border-border text-gray-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs truncate text-white">{doc.name}</h4>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {doc.pageCount || 1} Pages • {doc._count?.chunks || 0} OKF Chunks
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPDFModal({ id: doc.id, name: doc.name, page: 1 });
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors"
                        title="View PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {doc.status === 'READY' ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed & Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> {doc.status}...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 font-mono">No previous chat threads</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-xs font-semibold ${
                      activeConvId === conv.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConv(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Grounded Chat Window */}
      <ChatWindow
        conversationId={activeConvId}
        selectedDocId={selectedDocId}
        selectedDocName={selectedDocObj?.name}
        onNewConversation={() => {
          setActiveConvId(undefined);
          fetchConversations();
        }}
        onOpenViewer={(id, name, page) => setSelectedPDFModal({ id, name, page })}
      />

      {/* Embedded PDF Viewer Modal */}
      {selectedPDFModal && (
        <PDFViewerModal
          isOpen={!!selectedPDFModal}
          onClose={() => setSelectedPDFModal(null)}
          documentId={selectedPDFModal.id}
          documentName={selectedPDFModal.name}
          initialPage={selectedPDFModal.page}
        />
      )}
    </div>
  );
};
