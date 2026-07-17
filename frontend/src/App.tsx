import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clientPortalRoutes from './apps/client-portal/routes';
import adminRoutes from './apps/admin-panel/routes';
import developerRoutes from './apps/developer-panel/routes';
import { LoginPage } from './apps/auth/LoginPage';
import { UnauthorizedPage } from './apps/auth/UnauthorizedPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {clientPortalRoutes}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {adminRoutes}
          {developerRoutes}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}