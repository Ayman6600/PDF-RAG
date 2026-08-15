import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

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
  onClick: (docId: string, docName: string, page: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onClick }) => {
  return (
    <button
      onClick={() => onClick(citation.documentId, citation.documentName, citation.pageNumber)}
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm"
    >
      <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
      <span>
        <strong className="font-semibold">{citation.documentName}</strong> — Page {citation.pageNumber}
      </span>
      <ExternalLink className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
