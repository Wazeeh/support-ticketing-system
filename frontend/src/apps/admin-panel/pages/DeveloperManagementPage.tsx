import { useQuery } from '@tanstack/react-query';
import { developerService } from '../../../services/developerService';
import { AdminDashboardLayout } from '../AdminDashboardLayout';

export function DeveloperManagementPage() {
  const { data } = useQuery({
    queryKey: ['developers'],
    queryFn: () => developerService.listDevelopers().then((res) => res.data),
  });

  return (
    <AdminDashboardLayout>
      <h1>Developers</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Open Tickets</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((d) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: 8 }}>{d.full_name}</td>
              <td style={{ padding: 8 }}>{d.open_ticket_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminDashboardLayout>
  );
}