export type AppRole = 'ADMIN' | 'CLIENT';

export function normalizeRole(role?: string | null): AppRole {
  return role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CLIENT';
}

export function getRoleRedirectPath(role?: string | null): string {
  return normalizeRole(role) === 'ADMIN' ? '/admin' : '/dashboard';
}

export function getRoleFromToken(token?: string | null): string | undefined {
  if (!token) return undefined;

  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as { role?: string };

    return parsed?.role;
  } catch {
    return undefined;
  }
}

export function resolveRole(role?: string | null, token?: string | null): AppRole {
  const tokenRole = getRoleFromToken(token);
  return normalizeRole(tokenRole ?? role);
}
