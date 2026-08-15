import React, { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { PDFViewerModal } from '../components/pdf/PDFViewerModal';
import { MessageSquare, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; name: string; page: number } | null>(null);

  const fetchConversations = async () => {
    try {
      const res: any = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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

  return (
    <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex gap-6 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-72 glass-panel rounded-2xl border border-border flex flex-col p-4 shrink-0 overflow-hidden">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 px-2">Conversations</h3>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center p-6 text-xs text-gray-500 font-mono">No previous chats</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs font-semibold ${
                  activeConvId === conv.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 shrink-0" />
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
        </div>
      </div>

      {/* Main Chat Panel */}
      <ChatWindow
        conversationId={activeConvId}
        onNewConversation={() => {
          setActiveConvId(undefined);
          fetchConversations();
        }}
        onOpenViewer={(id, name, page) => setSelectedDoc({ id, name, page })}
      />

      {selectedDoc && (
        <PDFViewerModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          documentId={selectedDoc.id}
          documentName={selectedDoc.name}
          initialPage={selectedDoc.page}
        />
      )}
    </div>
  );
};
