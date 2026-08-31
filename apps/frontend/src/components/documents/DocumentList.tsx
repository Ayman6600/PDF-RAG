import React from 'react';
import { FileText, Eye, RefreshCw, Trash2, CheckCircle2, Clock, AlertTriangle, Compass } from 'lucide-react';
import { api } from '../../services/api';

export interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  fileSize: number;
  status: 'UPLOADING' | 'PROCESSING' | 'INDEXING' | 'READY' | 'FAILED' | 'ARCHIVED';
  pageCount: number;
  createdAt: string;
  _count?: { sections: number; chunks: number };
}

interface DocumentListProps {
  documents: DocumentItem[];
  onRefresh: () => void;
  onOpenViewer: (docId: string, docName: string, page?: number) => void;
  onExploreSections: (docId: string, docName: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onOpenViewer,
  onExploreSections,
}) => {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and all extracted OKF knowledge chunks?')) return;
    try {
      await api.delete(`/documents/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.error?.message || 'Failed to delete document');
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      await api.post(`/documents/${id}/reprocess`);
      onRefresh();
    } catch (err: any) {
      alert(err.error?.message || 'Failed to reprocess document');
    }
  };

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 select-none">
            <CheckCircle2 className="w-3.5 h-3.5" /> Indexed & Ready
          </span>
        );
      case 'PROCESSING':
      case 'INDEXING':
      case 'UPLOADING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-pulse select-none">
            <Clock className="w-3.5 h-3.5" /> {status}...
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-red/5 text-error-red border border-error-red/20 select-none">
            <AlertTriangle className="w-3.5 h-3.5" /> Processing Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-soft text-muted-ink select-none">
            {status}
          </span>
        );
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-canvas rounded-[18px] p-12 text-center border border-hairline shadow-sm select-none">
        <FileText className="w-12 h-12 text-muted-ink mx-auto mb-3" />
        <h4 className="font-semibold text-ink text-base tracking-apple-headline">No documents uploaded yet</h4>
        <p className="text-xs text-muted-ink mt-1 max-w-sm mx-auto font-normal tracking-apple-tight">
          Upload your first PDF to transform it into structured OKF knowledge and perform grounded hybrid retrieval.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-canvas rounded-[18px] border border-hairline shadow-sm overflow-hidden">
      <div className="p-4 border-b border-hairline flex items-center justify-between select-none">
        <h3 className="font-semibold text-ink text-sm tracking-apple-headline">Uploaded Knowledge Documents ({documents.length})</h3>
        <button
          onClick={onRefresh}
          className="p-1.5 text-muted-ink hover:text-ink hover:bg-canvas-parchment rounded-full transition-all active:scale-95"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-hairline">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 flex items-center justify-between hover:bg-canvas-parchment/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 select-none">
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h4 className="font-semibold text-ink text-sm truncate tracking-apple-tight">{doc.name}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-ink mt-0.5 font-mono select-none">
                  <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{doc.pageCount || 1} Pages</span>
                  <span>•</span>
                  <span>{doc._count?.chunks || 0} OKF Chunks</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {getStatusBadge(doc.status)}

              <div className="flex items-center gap-1">
                {doc.status === 'READY' && (
                  <button
                    onClick={() => onExploreSections(doc.id, doc.name)}
                    className="p-2 text-muted-ink hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-95"
                    title="Explore OKF Sections"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onOpenViewer(doc.id, doc.name, 1)}
                  className="p-2 text-muted-ink hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-95"
                  title="View PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReprocess(doc.id)}
                  className="p-2 text-muted-ink hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-95"
                  title="Reprocess OKF"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-muted-ink hover:text-error-red hover:bg-error-red/10 rounded-full transition-all active:scale-95"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
