/* Shared form validation. Each validator returns an error string, or '' when valid. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'letter', label: 'One letter',            test: (p) => /[A-Za-z]/.test(p) },
  { id: 'number', label: 'One number',            test: (p) => /\d/.test(p) },
];

export function validateName(value) {
  const v = value.trim();
  if (!v) return 'Full name is required.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  if (v.length > 60) return 'Name must be 60 characters or fewer.';
  return '';
}

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Email is required.';
  if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
  return '';
}

export function validateRequiredPassword(value) {
  return value ? '' : 'Password is required.';
}

export function validateNewPassword(value) {
  if (!value) return 'Password is required.';
  if (value.length > 128) return 'Password must be 128 characters or fewer.';
  const failed = PASSWORD_RULES.filter(r => !r.test(value));
  return failed.length ? `Password needs: ${failed.map(r => r.label.toLowerCase()).join(', ')}.` : '';
}

export function validateConfirm(value, password) {
  if (!value) return 'Please confirm your password.';
  if (value !== password) return 'Passwords do not match.';
  return '';
}
