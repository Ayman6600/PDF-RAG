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
      className={`group relative flex flex-col p-3 rounded-[12px] border transition-all cursor-pointer text-left max-w-sm active:scale-[0.98] ${
        isTopMatch
          ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
          : 'bg-canvas-parchment hover:bg-canvas border-hairline'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-semibold text-xs text-ink truncate">
            {citation.documentName}
          </span>
        </div>

        {isTopMatch && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20 shrink-0">
            <Star className="w-3 h-3 fill-primary" /> Best Match
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-ink font-mono mt-0.5 select-none">
        <span>Page {citation.pageNumber}</span>
        <span className="group-hover:text-primary flex items-center gap-1">
          Open PDF <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </span>
      </div>

      {citation.snippet && (
        <p className="text-[11px] text-body-ink mt-2 line-clamp-2 italic border-t border-hairline pt-1.5 font-sans font-normal leading-relaxed">
          "{citation.snippet}"
        </p>
      )}
    </div>
  );
};
