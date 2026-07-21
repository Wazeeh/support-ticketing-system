import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ticketService } from '../../../services/ticketService';
import {
  TicketFilterBar,
  type TicketFilters,
} from '../../../components/reporting/TicketFilterBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { AdminDashboardLayout } from '../AdminDashboardLayout';

export function TicketListPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<TicketFilters>({});
  const [page, setPage] = useState(1);

  const pageSize = 25;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-tickets', filters, page],
    queryFn: () =>
      ticketService
        .listAdminTickets({
          ...filters,
          page,
          page_size: pageSize,
        })
        .then((response) => response.data),
  });

  const totalPages = data
    ? Math.max(
        1,
        Math.ceil(data.pagination.total / data.pagination.page_size),
      )
    : 1;

  return (
    <AdminDashboardLayout>
      <h1>Tickets</h1>

      <TicketFilterBar
        filters={filters}
        onChange={(updatedFilters) => {
          setFilters(updatedFilters);
          setPage(1);
        }}
      />

      {isLoading && <p>Loading tickets...</p>}

      {isError && (
        <p style={{ color: '#dc2626' }}>
          Tickets could not be loaded.
        </p>
      )}

      {data && (
        <>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  borderBottom: '2px solid #e5e7eb',
                }}
              >
                <th style={{ padding: '8px' }}>
                  Tracking #
                </th>

                <th style={{ padding: '8px' }}>
                  Software
                </th>

                <th style={{ padding: '8px' }}>
                  Category
                </th>

                <th style={{ padding: '8px' }}>
                  Status
                </th>

                <th style={{ padding: '8px' }}>
                  Priority
                </th>

                <th style={{ padding: '8px' }}>
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {data.data.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() =>
                    navigate(`/admin/tickets/${ticket.id}`)
                  }
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '8px' }}>
                    {ticket.tracking_number}
                  </td>

                  <td style={{ padding: '8px' }}>
                    {ticket.software}
                  </td>

                  <td style={{ padding: '8px' }}>
                    {ticket.issue_category}
                  </td>

                  <td style={{ padding: '8px' }}>
                    <StatusBadge status={ticket.status} />
                  </td>

                  <td style={{ padding: '8px' }}>
                    <PriorityBadge
                      priority={ticket.priority}
                    />
                  </td>

                  <td style={{ padding: '8px' }}>
                    {new Date(
                      ticket.created_at,
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.data.length === 0 && (
            <p style={{ marginTop: '20px' }}>
              No tickets found.
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(1, currentPage - 1),
                )
              }
            >
              Previous
            </button>

            <span style={{ fontSize: '0.85rem' }}>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(totalPages, currentPage + 1),
                )
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
}