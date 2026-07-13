import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { reportService } from '../../../services/reportService';
import { TicketFilterBar, type TicketFilters } from '../../../components/reporting/TicketFilterBar';
import { Button } from '../../../components/shared/Button';
import { AdminDashboardLayout } from '../AdminDashboardLayout';

const COLORS = ['#6b7280', '#2563eb', '#7c3aed', '#d97706', '#059669', '#374151', '#dc2626'];

export function AnalyticsReportPage() {
  const [filters, setFilters] = useState<TicketFilters>({});

  const { data } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => reportService.getAnalytics(filters).then((res) => res.data as any),
  });

  const handleExport = async () => {
    const res = await reportService.exportCsv(filters);
    const url = window.URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets-export.csv';
    a.click();
  };

  return (
    <AdminDashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Analytics Report</h1>
        <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
      </div>

      <TicketFilterBar filters={filters} onChange={setFilters} />

      {data && (
        <>
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Tickets</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.summary.total_tickets}</p>
            </div>
            <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg Resolution (hrs)</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.summary.avg_resolution_hours?.toFixed(1)}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
            <div>
              <h3>Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.summary.by_status).map(([name, value]) => ({ name, value }))}
                    dataKey="value" nameKey="name" outerRadius={80}
                  >
                    {Object.keys(data.summary.by_status).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3>Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.breakdown_by_category}>
                  <XAxis dataKey="issue_category" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <h3>Submission vs Completion Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.trend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="submitted" stroke="#2563eb" />
                  <Line type="monotone" dataKey="completed" stroke="#059669" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
}