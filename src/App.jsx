import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { AuthProvider } from './context/AuthContext';
import AppRoot from './components/app/AppRoot';
import Dashboard from './pages/app/Dashboard';
import Transactions from './pages/app/Transactions';
import Budgets from './pages/app/Budgets';
import Goals from './pages/app/Goals';
import Analytics from './pages/app/Analytics';
import Recurring from './pages/app/Recurring';
import Settings from './pages/app/Settings';
import './styles.css';

function LandingLayout() {
  return (
    <>
      <Navbar />
      <Landing />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<LandingLayout />} />
          <Route path="/login"   element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup"  element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route element={<AppRoot />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets"      element={<Budgets />} />
            <Route path="/goals"        element={<Goals />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/recurring"    element={<Recurring />} />
            <Route path="/settings"     element={<Settings />} />
          </Route>
          <Route path="/home"    element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
