import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../../services/ticketService';
import { TicketFilterBar, type TicketFilters } from '../../../components/reporting/TicketFilterBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { AdminDashboardLayout } from '../AdminDashboardLayout';

export function TicketListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TicketFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', filters, page],
    queryFn: () =>
      ticketService
        .listAdminTickets({ ...filters, page, page_size: pageSize })
        .then((res) => res.data),
  });

  const totalPages = data ? Math.ceil(data.pagination.total / pageSize) : 1;

  return (
    <AdminDashboardLayout>
      <h1>Tickets</h1>
      <TicketFilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

      {isLoading && <p>Loading tickets...</p>}

      {data && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px' }}>Tracking #</th>
                <th style={{ padding: '8px' }}>Software</th>
                <th style={{ padding: '8px' }}>Category</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Priority</th>
                <th style={{ padding: '8px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                >
                  <td style={{ padding: '8px' }}>{t.tracking_number}</td>
                  <td style={{ padding: '8px' }}>{t.software}</td>
                  <td style={{ padding: '8px' }}>{t.issue_category}</td>
                  <td style={{ padding: '8px' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '8px' }}><PriorityBadge priority={t.priority} /></td>
                  <td style={{ padding: '8px' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span style={{ fontSize: '0.85rem' }}>Page {page} of {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
}