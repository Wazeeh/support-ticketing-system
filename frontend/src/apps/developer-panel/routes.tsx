import { Route } from 'react-router-dom';
import { RequireRole } from '../../components/shared/RequireRole';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

export default [
  <Route key="dev-home" path="/developer" element={<RequireRole role="DEVELOPER"><MyTicketsPage /></RequireRole>} />,
  <Route key="dev-ticket-detail" path="/developer/tickets/:id" element={<RequireRole role="DEVELOPER"><TicketDetailPage /></RequireRole>} />,
];