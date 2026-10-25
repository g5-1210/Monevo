import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Login/Signup are for signed-out users: anyone already signed in goes to the app
   (or back to the page they were originally trying to reach). */
export default function PublicOnlyRoute({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (isAuthed) return <Navigate to={location.state?.from ?? '/dashboard'} replace />;
  return children;
}
