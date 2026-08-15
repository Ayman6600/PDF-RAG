import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  initialPage?: number;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
  initialPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage, documentId]);

  if (!isOpen) return null;

  const token = localStorage.getItem('access_token');
  const pdfUrl = `/api/v1/documents/${documentId}/file?token=${encodeURIComponent(token || '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] glass-panel rounded-2xl flex flex-col overflow-hidden border border-border shadow-2xl">
        {/* Header toolbar */}
        <div className="h-14 bg-surface px-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm truncate max-w-xs sm:max-w-md">{documentName}</h3>
          </div>

          <div className="flex items-center gap-2 bg-background/60 px-3 py-1.5 rounded-xl border border-border">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-indigo-300">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gray-400 px-1">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF iframe / viewer frame */}
        <div className="flex-1 bg-slate-950/80 overflow-auto flex items-center justify-center p-4">
          <iframe
            src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
            className="w-full h-full rounded-lg border border-border shadow-inner"
            title={documentName}
          />
        </div>
      </div>
    </div>
  );
};
