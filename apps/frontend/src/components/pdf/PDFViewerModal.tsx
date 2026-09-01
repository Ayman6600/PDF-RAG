import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getApiV1Url } from '../../services/api';

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
  const [token, setToken] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage, documentId]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await getToken();
        setToken(t);
      } catch (err) {
        console.error('Failed to get Clerk token:', err);
      }
    };
    fetchToken();
  }, [getToken, documentId]);

  if (!isOpen) return null;

  if (token === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="w-full max-w-5xl h-[88vh] bg-canvas rounded-[18px] flex items-center justify-center text-primary font-sans text-sm font-semibold">
          Loading document...
        </div>
      </div>
    );
  }

  const pdfUrl = `${getApiV1Url()}/documents/${documentId}/file?token=${encodeURIComponent(token)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-canvas rounded-[18px] flex flex-col overflow-hidden border border-hairline shadow-sm">
        {/* Header toolbar */}
        <div className="h-14 bg-canvas px-6 flex items-center justify-between border-b border-hairline select-none">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-ink text-sm truncate max-w-xs sm:max-w-md tracking-apple-headline">{documentName}</h3>
          </div>

          <div className="flex items-center gap-2 bg-canvas-parchment px-3 py-1.5 rounded-full border border-hairline">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-muted-ink hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-primary">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1 text-muted-ink hover:text-ink transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-hairline mx-1" />

            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-muted-ink hover:text-ink transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-muted-ink px-1">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 text-muted-ink hover:text-ink transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-ink hover:text-ink hover:bg-canvas-parchment rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF iframe / viewer frame - Void Background */}
        <div className="flex-1 bg-surface-black overflow-auto flex items-center justify-center p-4">
          <iframe
            src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
            className="w-full h-full rounded-lg border border-hairline shadow-sm bg-white"
            title={documentName}
          />
        </div>
      </div>
    </div>
  );
};
