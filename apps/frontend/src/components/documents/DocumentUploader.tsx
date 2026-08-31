import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface DocumentUploaderProps {
  onUploadSuccess: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents', formData);
      setSuccess(`"${file.name}" uploaded successfully. BullMQ worker is processing document into OKF knowledge format.`);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.error?.message || 'Failed to upload PDF document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-canvas rounded-[18px] p-6 border border-hairline shadow-sm select-none">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-all duration-200 active:scale-[0.99] ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-hairline hover:border-primary/50 hover:bg-canvas-parchment'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h4 className="font-semibold text-ink text-base tracking-apple-headline">
              {isUploading ? 'Uploading & Queueing PDF...' : 'Drag & drop PDF files here'}
            </h4>
            <p className="text-xs text-muted-ink mt-1 tracking-apple-tight">
              Supports multi-page PDFs up to 50MB. Automatic text extraction, OKF transformation & pgvector indexing.
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            className="mt-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-full font-semibold text-xs transition-all active:scale-95 shadow-sm"
          >
            Browse Files
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-red/5 border border-error-red/20 text-error-red text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-xl bg-[#30d158]/5 border border-[#30d158]/20 text-[#30d158] text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
