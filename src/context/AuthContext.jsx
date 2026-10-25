import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  authenticate, changeUserPassword, clearSession, createUser, readSessionUser,
  removeUserData, removeUserRecord, saveSession, updateUserRecord,
} from '../utils/authStore';

const AuthContext = createContext(null);

/* Auth state for the whole app. Components only use this API, so swapping the
   local store in utils/authStore.js for a real backend won't touch the UI. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSessionUser());
  // True after the user deliberately logged out / deleted their account (so guards send them home, not to /login).
  const [signedOut, setSignedOut] = useState(false);

  // Keep tabs in sync (log out in one tab -> logged out everywhere).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key === 'monevo-session' || e.key === 'monevo-users') setUser(readSessionUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const startSession = useCallback((nextUser, remember = false) => {
    saveSession(nextUser.id, remember);
    setUser(nextUser);
    setSignedOut(false);
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    const u = await authenticate(email, password);
    startSession(u, remember);
    return u;
  }, [startSession]);

  /** Creates the account only; the caller decides when to start the session. */
  const register = useCallback((details) => createUser(details), []);

  const logout = useCallback(() => { clearSession(); setUser(null); setSignedOut(true); }, []);

  const updateProfile = useCallback(async (patch) => {
    const updated = await updateUserRecord(user.id, patch);
    setUser(updated);
    return updated;
  }, [user]);

  const changePassword = useCallback((current, next) => changeUserPassword(user.id, current, next), [user]);

  const deleteAccount = useCallback(async () => {
    removeUserData(user.id);
    removeUserRecord(user.id);
    clearSession();
    setUser(null);
    setSignedOut(true);
  }, [user]);

  const value = useMemo(() => ({
    user, signedOut, isAuthed: Boolean(user),
    login, register, startSession, logout, updateProfile, changePassword, deleteAccount,
  }), [user, signedOut, login, register, startSession, logout, updateProfile, changePassword, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
