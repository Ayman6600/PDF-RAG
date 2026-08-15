import React, { useState, useEffect } from 'react';
import { DocumentUploader } from '../components/documents/DocumentUploader';
import { DocumentList, DocumentItem } from '../components/documents/DocumentList';
import { PDFViewerModal } from '../components/pdf/PDFViewerModal';
import { api } from '../services/api';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; name: string; page: number } | null>(null);

  const fetchDocuments = async () => {
    try {
      const res: any = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000); // poll processing status
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">Document Management</h2>
        <p className="text-xs text-gray-400 mt-1">Upload PDFs to ingest, parse, transform into OKF bundles, and index in pgvector.</p>
      </div>

      <DocumentUploader onUploadSuccess={fetchDocuments} />

      <DocumentList
        documents={documents}
        onRefresh={fetchDocuments}
        onOpenViewer={(id, name, page = 1) => setSelectedDoc({ id, name, page })}
      />

      {selectedDoc && (
        <PDFViewerModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          documentId={selectedDoc.id}
          documentName={selectedDoc.name}
          initialPage={selectedDoc.page}
        />
      )}
    </div>
  );
};
