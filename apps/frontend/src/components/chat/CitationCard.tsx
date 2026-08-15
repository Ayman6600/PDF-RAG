import React from 'react';
import { ExternalLink, BookOpen, Star } from 'lucide-react';

export interface CitationItem {
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkId: string;
  snippet?: string;
  relevanceScore?: number;
}

interface CitationCardProps {
  citation: CitationItem;
  isTopMatch?: boolean;
  onClick: (docId: string, docName: string, page: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, isTopMatch, onClick }) => {
  return (
    <div
      onClick={() => onClick(citation.documentId, citation.documentName, citation.pageNumber)}
      className={`group relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer shadow-sm text-left max-w-sm ${
        isTopMatch
          ? 'bg-gradient-to-r from-indigo-950/60 to-cyan-950/60 border-cyan-500/40 hover:border-cyan-400'
          : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-semibold text-xs text-indigo-200 truncate group-hover:text-white">
            {citation.documentName}
          </span>
        </div>

        {isTopMatch && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 shrink-0">
            <Star className="w-3 h-3 fill-cyan-300" /> Best Match
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono mt-0.5">
        <span>Page {citation.pageNumber}</span>
        <span className="group-hover:text-indigo-300 flex items-center gap-1">
          Open PDF <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </span>
      </div>

      {citation.snippet && (
        <p className="text-[11px] text-gray-300/80 mt-2 line-clamp-2 italic border-t border-border/40 pt-1.5 font-sans">
          "{citation.snippet}"
        </p>
      )}
    </div>
  );
};
