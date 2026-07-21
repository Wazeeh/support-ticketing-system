import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import clientPortalRoutes from './apps/client-portal/routes';
import adminRoutes from './apps/admin-panel/routes';
import developerRoutes from './apps/developer-panel/routes';

import { LoginPage } from './apps/auth/LoginPage';
import { UnauthorizedPage } from './apps/auth/UnauthorizedPage';
import { PublicNavbar } from './components/shared/PublicNavbar';

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();

  const showPublicNavbar =
    location.pathname === '/' ||
    location.pathname === '/track' ||
    location.pathname === '/login';

  return (
    <>
      {showPublicNavbar && <PublicNavbar />}

      <Routes>
        {clientPortalRoutes}

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {adminRoutes}
        {developerRoutes}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}