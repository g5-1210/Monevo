/* Browser-local account store.
   Monevo has no backend yet, so accounts live in this browser's localStorage.
   Passwords are never stored in plain text (PBKDF2-SHA256 with a per-user salt),
   but this is NOT a substitute for server-side auth — see README. When a real API
   exists, replace the functions in this file and keep their signatures. */

const USERS_KEY = 'monevo-users';
const SESSION_KEY = 'monevo-session';
const ITERATIONS = 150000;

export class AuthError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

/* ---------- storage ---------- */
function readUsers() {
  try {
    const list = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}
function writeUsers(list) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
  catch { throw new AuthError('storage', "Couldn't save to this browser's storage. Check that storage isn't full or blocked."); }
}

/* ---------- hashing ---------- */
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function hashPassword(password, saltB64) {
  if (!globalThis.crypto?.subtle) {
    throw new AuthError('crypto', 'Secure sign-in needs HTTPS or localhost. Please open Monevo over a secure connection.');
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(saltB64), iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
  return b64(bits);
}

function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const normEmail = (e) => e.trim().toLowerCase();
export const publicUser = ({ id, name, email, avatar, createdAt }) => ({ id, name, email, avatar: avatar ?? '', createdAt });

/* ---------- accounts ---------- */
export async function createUser({ name, email, password }) {
  const users = readUsers();
  const e = normEmail(email);
  if (users.some(u => u.email === e)) throw new AuthError('email-taken', 'An account with this email already exists. Try logging in instead.');
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  const user = {
    id: crypto.randomUUID(), name: name.trim(), email: e, avatar: '',
    salt, hash: await hashPassword(password, salt), createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return publicUser(user);
}

export async function authenticate(email, password) {
  const user = readUsers().find(u => u.email === normEmail(email));
  // Same message for "no such user" and "wrong password" so emails can't be probed.
  const fail = () => new AuthError('invalid-credentials', 'Incorrect email or password.');
  if (!user) { await hashPassword(password, b64(new Uint8Array(16))); throw fail(); }
  if (!sameHash(await hashPassword(password, user.salt), user.hash)) throw fail();
  return publicUser(user);
}

export async function updateUserRecord(id, patch) {
  const users = readUsers();
  const i = users.findIndex(u => u.id === id);
  if (i < 0) throw new AuthError('not-found', 'Account not found. Please log in again.');
  const next = { ...users[i] };
  if (patch.name !== undefined) next.name = patch.name.trim();
  if (patch.avatar !== undefined) next.avatar = patch.avatar;
  if (patch.email !== undefined) {
    const e = normEmail(patch.email);
    if (users.some(u => u.id !== id && u.email === e)) throw new AuthError('email-taken', 'Another account already uses this email.');
    next.email = e;
  }
  users[i] = next;
  writeUsers(users);
  return publicUser(next);
}

export async function changeUserPassword(id, current, next) {
  const users = readUsers();
  const i = users.findIndex(u => u.id === id);
  if (i < 0) throw new AuthError('not-found', 'Account not found. Please log in again.');
  if (!sameHash(await hashPassword(current, users[i].salt), users[i].hash)) {
    throw new AuthError('wrong-password', 'Your current password is incorrect.');
  }
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  users[i] = { ...users[i], salt, hash: await hashPassword(next, salt) };
  writeUsers(users);
}

export function removeUserRecord(id) {
  writeUsers(readUsers().filter(u => u.id !== id));
}

/* ---------- per-user app data keys ---------- */
export const dataKey = (id) => `monevo:data:${id}`;
export const prefsKey = (id) => `monevo:prefs:${id}`;

export function removeUserData(id) {
  try {
    localStorage.removeItem(dataKey(id));
    localStorage.removeItem(prefsKey(id));
  } catch {
    throw new AuthError('storage', "Couldn't remove this account's data from the browser.");
  }
}

/* ---------- session ---------- */
/* "Remember me" -> localStorage (survives closing the browser); otherwise sessionStorage. */
export function saveSession(userId, remember) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  try { store.setItem(SESSION_KEY, JSON.stringify({ userId })); }
  catch { throw new AuthError('storage', "Couldn't start a session in this browser."); }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function readSessionUser() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(SESSION_KEY);
      if (!raw) continue;
      const { userId } = JSON.parse(raw) ?? {};
      const user = typeof userId === 'string' ? readUsers().find(u => u.id === userId) : null;
      if (user) return publicUser(user);
      store.removeItem(SESSION_KEY); // stale or legacy value
    } catch { /* ignore malformed session */ }
  }
  return null;
}
