import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { api } from '../services/api';
import { DocumentItem } from '../components/documents/DocumentList';

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

  return (
    <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex overflow-hidden">
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
