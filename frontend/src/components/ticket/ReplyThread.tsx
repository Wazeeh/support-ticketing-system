import { useState } from 'react';
import { RichTextEditor } from '../shared/RichTextEditor';
import { RichTextViewer } from '../shared/RichTextViewer';
import { Button } from '../shared/Button';

interface Reply { message: string; created_at: string; author_role: string }

interface ReplyThreadProps {
  replies: Reply[];
  canReply: boolean;
  canClose?: boolean;
  onSubmit: (message: string, closeTicket: boolean) => void;
}

export function ReplyThread({ replies, canReply, canClose, onSubmit }: ReplyThreadProps) {
  const [message, setMessage] = useState('');
  const [closeTicket, setCloseTicket] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message, closeTicket);
    setMessage('');
    setCloseTicket(false);
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <strong>Replies</strong>
      <div style={{ marginTop: 8 }}>
        {replies.map((r, i) => (
          <div key={i} style={{ padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>
              {r.author_role} — {new Date(r.created_at).toLocaleString()}
            </p>
            <RichTextViewer html={r.message} />
          </div>
        ))}
      </div>

      {canReply && (
        <div style={{ marginTop: 12 }}>
          <RichTextEditor value={message} onChange={setMessage} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            {canClose && (
              <label style={{ fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={closeTicket}
                  onChange={(e) => setCloseTicket(e.target.checked)}
                />{' '}
                Close with this reply
              </label>
            )}
            <Button onClick={handleSubmit}>Send Reply</Button>
          </div>
        </div>
      )}
    </div>
  );
}