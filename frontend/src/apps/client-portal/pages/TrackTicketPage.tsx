import { useState } from 'react';
import { ticketService } from '../../../services/ticketService';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { Button } from '../../../components/shared/Button';

export function TrackTicketPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await ticketService.trackTicket(trackingNumber.trim());
      setResult(res.data);
    } catch {
      setError('No ticket found with that tracking number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
      <h1>Track Your Ticket</h1>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. TKT-2026-000001"
          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <Button onClick={handleLookup} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && <p style={{ color: '#dc2626', marginTop: '12px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <StatusBadge status={result.status} />
            <PriorityBadge priority={result.priority} />
          </div>
          <p><strong>Submitted:</strong> {new Date(result.submitted_at).toLocaleString()}</p>
          <p><strong>Last update:</strong> {new Date(result.last_update_at).toLocaleString()}</p>

          {result.replies?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h3>Replies</h3>
              {result.replies.map((r: any, i: number) => (
                <div key={i} style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {r.author_role} — {new Date(r.created_at).toLocaleString()}
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: r.message }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}