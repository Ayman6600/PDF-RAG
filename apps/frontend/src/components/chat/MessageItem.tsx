import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { CitationCard, CitationItem } from './CitationCard';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationItem[];
}

interface MessageItemProps {
  message: ChatMessage;
  onCitationClick: (docId: string, docName: string, page: number) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onCitationClick }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-5 rounded-[18px] border border-hairline shadow-sm ${isUser ? 'bg-canvas-parchment' : 'bg-canvas'}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-surface-strong text-ink border border-hairline'
            : 'bg-primary text-white border border-primary/20'
        }`}
      >
        {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-ink">
            {isUser ? 'You' : 'Grounded Assistant'}
          </span>
        </div>

        <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
          {message.content}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-hairline">
            <div className="text-[10px] font-semibold text-muted-ink mb-2 uppercase tracking-wider">
              Verified Sources & Citations
            </div>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((cit, idx) => (
                <CitationCard key={idx} citation={cit} isTopMatch={idx === 0} onClick={onCitationClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
