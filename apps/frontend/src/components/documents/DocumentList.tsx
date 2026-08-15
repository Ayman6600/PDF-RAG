import React from 'react';
import { FileText, Eye, RefreshCw, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onOpenViewer,
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Indexed & Ready
          </span>
        );
      case 'PROCESSING':
      case 'INDEXING':
      case 'UPLOADING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> {status}...
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Processing Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400">
            {status}
          </span>
        );
    }
  };

  if (documents.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-border">
        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="font-bold text-white text-base">No documents uploaded yet</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Upload your first PDF to transform it into structured OKF knowledge and perform grounded hybrid retrieval.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Uploaded Knowledge Documents ({documents.length})</h3>
        <button
          onClick={onRefresh}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 flex items-center justify-between hover:bg-surface-hover/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">{doc.name}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 font-mono">
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
                <button
                  onClick={() => onOpenViewer(doc.id, doc.name, 1)}
                  className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="View PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReprocess(doc.id)}
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  title="Reprocess OKF"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
