import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Circle, MessageSquarePlus, FileText, CheckCircle2, Layers } from 'lucide-react';
import { MessageItem, ChatMessage } from './MessageItem';
import { CitationItem } from './CitationCard';
import { api } from '../../services/api';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface ChatWindowProps {
  conversationId?: string;
  selectedDocId?: string;
  selectedDocName?: string;
  initialQuery?: string;
  onOpenViewer: (docId: string, docName: string, page: number) => void;
  onNewConversation: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  selectedDocId,
  selectedDocName,
  initialQuery,
  onOpenViewer,
  onNewConversation,
}) => {
  const { getToken } = useClerkAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

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

    // Construct SSE URL with authentication token and optional document ID scope filter
    const token = await getToken();
    let sseUrl = `/api/v1/conversations/${currentConvId}/stream?content=${encodeURIComponent(queryText)}&token=${encodeURIComponent(token || '')}`;
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

  useEffect(() => {
    if (initialQuery && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas h-full overflow-hidden">
      {/* Top Bar with Context Scope Indicator */}
      <div className="h-14 bg-canvas px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <Circle className="w-4 h-4 text-primary fill-primary/10 shrink-0" />
          <h3 className="font-semibold text-ink text-sm tracking-apple-headline">Grounded PDF Knowledge Chat</h3>

          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <FileText className="w-3.5 h-3.5 text-primary" />
            {selectedDocName ? `Scope: ${selectedDocName}` : 'Scope: All Uploaded Documents'}
          </span>
        </div>

        <button
          onClick={onNewConversation}
          className="flex items-center gap-2 px-3.5 h-8 bg-surface-soft hover:bg-surface-strong text-ink rounded-full text-xs font-semibold transition-all active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-primary" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 active:scale-95 transition-all border border-primary/20">
              <Circle className="w-8 h-8 fill-primary" />
            </div>
            <h3 className="font-semibold text-ink text-lg tracking-apple-headline">Ask Your PDF Knowledge Base</h3>
            <p className="text-[15px] text-muted-ink max-w-md mt-2 font-normal leading-relaxed tracking-apple-tight">
              Query uploaded PDF documents using hybrid pgvector + BM25 search. Every answer includes verifiable page-level citations.
            </p>

            {/* Quick Prompt Cards Grid (2x2 ChatGPT style) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl w-full">
              {[
                {
                  title: 'Summarize Document',
                  desc: 'Generate a concise executive summary and key findings',
                  prompt: 'Provide a comprehensive summary of the uploaded document, highlighting the main objectives and findings.',
                },
                {
                  title: 'Technical Specs',
                  desc: 'Retrieve core technical data, metrics, and specs',
                  prompt: 'What are the key technical specifications, architecture patterns, and engineering metrics in this document?',
                },
                {
                  title: 'Analyze Requirements',
                  desc: 'Identify deliverables, rules, and conditions',
                  prompt: 'List and explain the main requirements, tasks, deliverables, and compliance terms defined in this document.',
                },
                {
                  title: 'Identify Risk Factors',
                  desc: 'Detect warning points, assumptions, and gaps',
                  prompt: 'What are the potential risks, issues, assumptions, gaps, or security warning points discussed in this document?',
                },
              ].map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(card.prompt)}
                  className="p-4 bg-canvas-parchment hover:bg-[#eaeaea] dark:hover:bg-[#2c2c2e] rounded-[16px] text-left transition-all active:scale-[0.98] flex flex-col justify-between h-24 select-none cursor-pointer"
                >
                  <div className="font-semibold text-xs text-ink tracking-apple-headline">{card.title}</div>
                  <div className="text-[11px] text-muted-ink mt-1 font-normal leading-normal">{card.desc}</div>
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
      <form onSubmit={handleFormSubmit} className="p-4 bg-canvas">
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
            className="w-full pl-5 pr-14 h-12 bg-[#fafafc] dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full text-sm placeholder-muted-soft focus:outline-none focus:ring-2 focus:ring-primary-focus transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-1.5 p-2 bg-primary hover:bg-primary-600 disabled:bg-primary/40 text-white rounded-full transition-all active:scale-95 shrink-0"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
