import { ticketService } from '../../services/ticketService';

interface Attachment { id: number; file_name: string; size_bytes: number }
interface AttachmentListProps {
  ticketId: number;
  attachments: Attachment[];
}

export function AttachmentList({ ticketId, attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  const handleDownload = async (attachmentId: number) => {
    const res = await ticketService.getDownloadUrl(attachmentId);
    window.open((res.data as any).url, '_blank');
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <strong style={{ fontSize: '0.85rem' }}>Attachments</strong>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 6 }}>
        {attachments.map((a) => (
          <li key={a.id} style={{ padding: '6px 0' }}>
            <button
              onClick={() => handleDownload(a.id)}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              📎 {a.file_name} ({(a.size_bytes / 1024).toFixed(0)} KB)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}