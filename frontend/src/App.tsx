import { BrowserRouter, Routes } from 'react-router-dom';
import clientPortalRoutes from './apps/client-portal/routes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {clientPortalRoutes}
      </Routes>
    </BrowserRouter>
  );
}