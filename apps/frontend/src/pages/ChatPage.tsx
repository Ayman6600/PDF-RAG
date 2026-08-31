import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { api } from '../services/api';
import { DocumentItem } from '../components/documents/DocumentList';
import { FileText, Globe, CheckCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const activeConvId = searchParams.get('conversationId') || undefined;
  const selectedDocId = searchParams.get('documentId') || undefined;
  const initialQuery = searchParams.get('query') || undefined;

  const fetchDocuments = async () => {
    try {
      const res: any = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedDocObj = documents.find((d) => d.id === selectedDocId);

  const handleOpenViewer = (docId: string, docName: string, page: number) => {
    searchParams.set('viewPdf', docId);
    searchParams.set('pdfName', docName);
    setSearchParams(searchParams);
  };

  const handleSelectDocument = (id: string | undefined) => {
    if (id) {
      searchParams.set('documentId', id);
    } else {
      searchParams.delete('documentId');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex gap-6 overflow-hidden">
      {/* Scope Selector Sidebar inside Chat */}
      <div className="w-80 bg-canvas border border-hairline rounded-[18px] flex flex-col overflow-hidden shrink-0 shadow-sm hidden md:flex">
        <div className="p-4 border-b border-hairline select-none">
          <h3 className="font-semibold text-ink text-sm tracking-apple-headline">Chat Document Scope</h3>
          <p className="text-[10px] text-muted-ink mt-0.5 font-normal">Select a document to scope your questions, or search all.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Option 1: All Documents */}
          <button
            onClick={() => handleSelectDocument(undefined)}
            className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all select-none active:scale-[0.98] cursor-pointer ${
              !selectedDocId
                ? 'bg-primary/10 border-primary/20 text-primary font-bold'
                : 'bg-canvas border-hairline text-muted-ink hover:text-ink hover:bg-canvas-parchment/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 shrink-0 text-primary" />
              <span className="text-xs truncate font-semibold">🌐 All Uploaded Documents</span>
            </div>
            {!selectedDocId && <CheckCircle className="w-4 h-4 shrink-0 text-primary" />}
          </button>

          <div className="h-px bg-hairline my-2" />

          {/* Option 2: Individual Documents */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-ink uppercase tracking-wider px-1 block mb-2 select-none">
              PDF Document Library ({documents.filter(d => d.status === 'READY').length})
            </span>
            {documents.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-soft font-mono bg-canvas-parchment/20 rounded-xl">
                No PDFs available
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.id)}
                  disabled={doc.status !== 'READY'}
                  className={`w-full p-3 rounded-xl text-left border flex items-start justify-between transition-all select-none active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedDocId === doc.id
                      ? 'bg-primary/10 border-primary/20 text-ink font-semibold'
                      : 'bg-canvas border-hairline text-muted-ink hover:text-ink hover:bg-canvas-parchment/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className={`text-xs truncate ${selectedDocId === doc.id ? 'text-primary font-bold' : 'text-ink'}`}>
                        {doc.name}
                      </div>
                      <div className="text-[9px] text-muted-soft font-mono mt-0.5">
                        {doc.pageCount || 1} Pages • {doc.status}
                      </div>
                    </div>
                  </div>
                  {selectedDocId === doc.id && <CheckCircle className="w-4 h-4 shrink-0 text-primary mt-0.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <ChatWindow
        conversationId={activeConvId}
        selectedDocId={selectedDocId}
        selectedDocName={selectedDocObj?.name}
        initialQuery={initialQuery}
        onNewConversation={() => {
          searchParams.delete('conversationId');
          searchParams.delete('documentId');
          setSearchParams(searchParams);
        }}
        onOpenViewer={handleOpenViewer}
      />
    </div>
  );
};

