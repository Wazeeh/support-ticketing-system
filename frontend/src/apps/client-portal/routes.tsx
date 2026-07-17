import { Route } from 'react-router-dom';
import { SubmitTicketPage } from './pages/SubmitTicketPage';
import { TrackTicketPage } from './pages/TrackTicketPage';

export default [
  <Route key="submit" path="/" element={<SubmitTicketPage />} />,
  <Route key="track" path="/track" element={<TrackTicketPage />} />,
];