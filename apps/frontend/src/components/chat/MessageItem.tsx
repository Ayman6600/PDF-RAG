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
    <div className={`flex gap-4 p-4 rounded-2xl ${isUser ? 'bg-surface/50 border border-border/50' : 'glass-card border border-indigo-500/20'}`}>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gray-700 text-gray-200'
            : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
        }`}
      >
        {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-400">
            {isUser ? 'You' : 'Grounded Assistant'}
          </span>
        </div>

        <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
          {message.content}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Verified Sources & Citations
            </div>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((cit, idx) => (
                <CitationCard key={idx} citation={cit} onClick={onCitationClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
