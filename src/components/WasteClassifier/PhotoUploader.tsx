import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, AlertCircle } from 'lucide-react';

interface PhotoUploaderProps {
  onAnalyze: (base64: string, mimeType: string, optionalNote?: string) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onAnalyze,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [optionalNote, setOptionalNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setError(`Invalid file type (${file.type || 'unknown'}). Please upload a JPG, PNG, or WebP photo.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`);
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      // Clean base64 data for API payload
      const cleaned = result.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      setBase64Data(cleaned);
      setMimeType(file.type);
    };

    reader.onerror = () => {
      setError('Failed to read the image file from your device.');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setBase64Data(null);
    setMimeType(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!base64Data || !mimeType) {
      setError('Please select or drop an image file first.');
      return;
    }
    onAnalyze(base64Data, mimeType, optionalNote.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!previewUrl ? (
        <div
          className={`dropzone-container ${isDragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleTriggerUpload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerUpload();
            }
          }}
          aria-label="Upload an image of your electronic item"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="feature-icon-wrapper" style={{ margin: '0 auto' }}>
              <UploadCloud size={24} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              Click or drag & drop a photo of your electronic item
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              Supports JPG, PNG, WebP up to 5 MB. In-memory processing; photos are never stored.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="image-preview-wrapper">
            <img src={previewUrl} alt="E-waste item preview" className="image-preview-img" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <ImageIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {fileName}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              onClick={handleTriggerUpload}
              disabled={isLoading}
            >
              Change Photo
            </button>
            <button
              type="button"
              className="btn btn-danger-outline"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              onClick={handleClear}
              disabled={isLoading}
            >
              <X size={14} /> Remove
            </button>
          </div>

          <div className="form-group" style={{ textAlign: 'left', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            <label htmlFor="photo-note" className="form-label" style={{ fontSize: '0.85rem' }}>
              Optional context note (e.g. "Screen is broken", "Battery expanded"):
            </label>
            <input
              id="photo-note"
              type="text"
              className="form-control"
              placeholder="e.g. Model name or observed defects..."
              value={optionalNote}
              onChange={(e) => setOptionalNote(e.target.value)}
              disabled={isLoading}
              maxLength={200}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.85rem', margin: '0.75rem 0' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {previewUrl && (
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !base64Data}
        >
          <Sparkles size={16} />
          <span>{isLoading ? 'Analyzing Photo with Gemini...' : 'Analyze Photo with AI'}</span>
        </button>
      )}
    </form>
  );
};
