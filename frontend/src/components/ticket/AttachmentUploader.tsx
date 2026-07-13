import { useRef } from 'react';

interface AttachmentUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB

export function AttachmentUploader({ files, onChange }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected);
    const combined = [...files, ...newFiles];

    if (combined.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const combinedBytes = combined.reduce((sum, f) => sum + f.size, 0);
    if (combinedBytes > MAX_TOTAL_BYTES) {
      alert('Total attachment size cannot exceed 20MB.');
      return;
    }
    onChange(combined);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const isFull = files.length >= MAX_FILES || totalBytes >= MAX_TOTAL_BYTES;

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
        Attachments (optional)
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFilesSelected(e.dataTransfer.files);
        }}
        style={{
          border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px',
          textAlign: 'center', cursor: isFull ? 'not-allowed' : 'pointer',
          opacity: isFull ? 0.5 : 1, color: '#6b7280',
        }}
      >
        Drag files here or click to browse
        <input
          ref={inputRef}
          type="file"
          multiple
          disabled={isFull}
          onChange={(e) => handleFilesSelected(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 6 }}>
        {totalMb} MB / 20 MB used — {files.length} / {MAX_FILES} files
      </p>

      {files.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
          {files.map((f, i) => (
            <li key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: 4,
            }}>
              <span style={{ fontSize: '0.85rem' }}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
              <button
                onClick={() => removeFile(i)}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}