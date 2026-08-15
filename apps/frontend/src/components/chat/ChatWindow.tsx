import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, MessageSquarePlus, FileText, CheckCircle2, Layers } from 'lucide-react';
import { MessageItem, ChatMessage } from './MessageItem';
import { CitationItem } from './CitationCard';
import { api } from '../../services/api';

interface ChatWindowProps {
  conversationId?: string;
  selectedDocId?: string;
  selectedDocName?: string;
  onOpenViewer: (docId: string, docName: string, page: number) => void;
  onNewConversation: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  selectedDocId,
  selectedDocName,
  onOpenViewer,
  onNewConversation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res: any = await api.get(`/conversations/${conversationId}`);
        setMessages(res.data.messages || []);
      } catch (err: any) {
        console.error('Failed to load conversation messages:', err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isStreaming) return;

    let currentConvId = conversationId;
    if (!currentConvId) {
      try {
        const newConvRes: any = await api.post('/conversations', { title: queryText.slice(0, 30) });
        currentConvId = newConvRes.data.id;
        onNewConversation();
      } catch (err: any) {
        alert('Failed to start conversation');
        return;
      }
    }

    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      citations: [],
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    // Construct SSE URL with optional document ID scope filter
    let sseUrl = `/api/v1/conversations/${currentConvId}/stream?content=${encodeURIComponent(queryText)}`;
    if (selectedDocId) {
      sseUrl += `&documentIds=${encodeURIComponent(selectedDocId)}`;
    }

    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('token', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, content: msg.content + data.text } : msg,
        ),
      );
    });

    eventSource.addEventListener('citation', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, citations: data.citations as CitationItem[] } : msg,
        ),
      );
    });

    eventSource.addEventListener('message_complete', () => {
      eventSource.close();
      setIsStreaming(false);
    });

    eventSource.addEventListener('error', (e) => {
      console.error('SSE Stream Error:', e);
      eventSource.close();
      setIsStreaming(false);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-border h-full overflow-hidden">
      {/* Top Bar with Context Scope Indicator */}
      <div className="h-14 bg-surface px-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Grounded PDF Knowledge Chat</h3>

          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            {selectedDocName ? `Scope: ${selectedDocName}` : 'Scope: All Uploaded Documents'}
          </span>
        </div>

        <button
          onClick={onNewConversation}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-white text-xl">Ask Your PDF Knowledge Base</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2">
              Query uploaded PDF documents using hybrid pgvector + BM25 search. Every answer includes verifiable page-level citations.
            </p>

            {/* Quick Prompt Chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                'Summarize the uploaded PDF document',
                'What are the key technical specifications?',
                'Explain the main requirements mentioned',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border text-xs text-indigo-300 rounded-xl transition-all font-medium text-left hover:scale-[1.02]"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} onCitationClick={onOpenViewer} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleFormSubmit} className="p-4 bg-surface/50 border-t border-border">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedDocName
                ? `Ask anything about "${selectedDocName}"...`
                : 'Ask a question about your uploaded PDF documents...'
            }
            disabled={isStreaming}
            className="w-full pl-4 pr-12 py-3 bg-slate-900/90 border border-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
