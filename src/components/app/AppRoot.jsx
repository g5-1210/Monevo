import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataContext';
import { ToastProvider } from '../../context/ToastContext';
import { UIProvider } from '../../context/UIContext';
import AppLayout from './AppLayout';

/* Guards the authenticated routes and wires up the app-level providers. */
export default function AppRoot() {
  const { isAuthed, user, signedOut } = useAuth();
  const location = useLocation();
  if (!isAuthed && signedOut) return <Navigate to="/" replace />;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return (
    <DataProvider key={user.id}>
      <ToastProvider>
        <UIProvider>
          <AppLayout />
        </UIProvider>
      </ToastProvider>
    </DataProvider>
  );
}
