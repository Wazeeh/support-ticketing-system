import { Route } from 'react-router-dom';
import { RequireRole } from '../../components/shared/RequireRole';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TicketListPage } from './pages/TicketListPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { AnalyticsReportPage } from './pages/AnalyticsReportPage';
import { DeveloperManagementPage } from './pages/DeveloperManagementPage';

export default [
  <Route key="admin-home" path="/admin" element={<RequireRole role="ADMIN"><AdminDashboardPage /></RequireRole>} />,
  <Route key="admin-tickets" path="/admin/tickets" element={<RequireRole role="ADMIN"><TicketListPage /></RequireRole>} />,
  <Route key="admin-ticket-detail" path="/admin/tickets/:id" element={<RequireRole role="ADMIN"><TicketDetailPage /></RequireRole>} />,
  <Route key="admin-reports" path="/admin/reports" element={<RequireRole role="ADMIN"><AnalyticsReportPage /></RequireRole>} />,
  <Route key="admin-developers" path="/admin/developers" element={<RequireRole role="ADMIN"><DeveloperManagementPage /></RequireRole>} />,
];