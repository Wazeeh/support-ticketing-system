import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../../services/ticketService';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { DeveloperDashboardLayout } from '../DeveloperDashboardLayout';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['developer-tickets', page],
    queryFn: () =>
      ticketService.listDeveloperTickets({ page, page_size: pageSize }).then((res) => res.data as any),
  });

  return (
    <DeveloperDashboardLayout>
      <h1>My Tickets</h1>
      {isLoading && <p>Loading...</p>}
      {data && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 8 }}>Tracking #</th>
                <th style={{ padding: 8 }}>Software</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((t: any) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/developer/tickets/${t.id}`)}
                  style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                >
                  <td style={{ padding: 8 }}>{t.tracking_number}</td>
                  <td style={{ padding: 8 }}>{t.software}</td>
                  <td style={{ padding: 8 }}>{t.issue_category}</td>
                  <td style={{ padding: 8 }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: 8 }}><PriorityBadge priority={t.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span style={{ fontSize: '0.85rem' }}>Page {page}</span>
            <button
              disabled={data.data.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </DeveloperDashboardLayout>
  );
}