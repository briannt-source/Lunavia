"use client";
import { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  label: string;
  hint?: string;
  accept?: string;
  maxFiles?: number;
  uploadUrl?: string;
  deleteUrl?: string;
  onUploadComplete?: (document: UploadedFile) => void;
  onDocumentsChange?: (documents: UploadedFile[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentUpload({
  label,
  hint,
  accept = "image/*,.pdf",
  maxFiles = 5,
  uploadUrl = '/api/verification/upload',
  deleteUrl,
  onUploadComplete,
  onDocumentsChange,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (documents.length >= maxFiles) {
      setError(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      const newDoc = data.document as UploadedFile;
      const newDocs = [...documents, newDoc];
      setDocuments(newDocs);
      onUploadComplete?.(newDoc);
      onDocumentsChange?.(newDocs);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [documents, maxFiles, onUploadComplete, onDocumentsChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = async (docId: string) => {
    try {
      const res = await fetch(deleteUrl || uploadUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      });

      if (res.ok) {
        const newDocs = documents.filter(d => d.id !== docId);
        setDocuments(newDocs);
        onDocumentsChange?.(newDocs);
      }
    } catch (err) {
      console.error('Failed to remove document:', err);
    }
  };

  const canUploadMore = documents.length < maxFiles;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <span className="text-xs text-gray-500">
          {hint || `${documents.length}/${maxFiles} files`}
        </span>
      </div>

      {/* Upload Zone */}
      {canUploadMore && (
        <label
          className="block cursor-pointer group"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${dragActive
              ? 'border-indigo-400 bg-indigo-50/50'
              : uploading
                ? 'border-gray-300 bg-gray-50/50'
                : 'border-gray-200 bg-gray-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}>
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 group-hover:bg-indigo-100 transition-colors">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                  Click or drag to upload
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, or PDF up to 10MB
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Uploaded Documents
          </p>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  {doc.mimeType === 'application/pdf' ? (
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(doc.id)}
                className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Max limit reached message */}
      {!canUploadMore && (
        <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Maximum {maxFiles} documents reached
        </p>
      )}
    </div>
  );
}
