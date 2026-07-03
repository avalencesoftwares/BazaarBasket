// packages/functions/src/middleware/auth.test.ts
// Unit tests for auth middleware

import { requireAuth, requireAdmin } from './auth';
import type { CallableRequest } from 'firebase-functions/v2/https';

// Mock firebase-functions logger
jest.mock('firebase-functions', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('requireAuth', () => {
  it('should return userId when request has auth', () => {
    const request = {
      auth: { uid: 'user_123', token: {} },
    } as unknown as CallableRequest;

    const uid = requireAuth(request);
    expect(uid).toBe('user_123');
  });

  it('should throw unauthenticated error when no auth', () => {
    const request = {
      auth: undefined,
    } as unknown as CallableRequest;

    expect(() => requireAuth(request)).toThrow();
    try {
      requireAuth(request);
    } catch (error: unknown) {
      const httpsError = error as { code: string };
      expect(httpsError.code).toBe('unauthenticated');
    }
  });

  it('should throw unauthenticated error when auth is null', () => {
    const request = {
      auth: null,
    } as unknown as CallableRequest;

    expect(() => requireAuth(request)).toThrow();
  });
});

describe('requireAdmin', () => {
  it('should return userId when request is from admin', () => {
    const request = {
      auth: {
        uid: 'admin_123',
        token: { role: 'admin' },
      },
    } as unknown as CallableRequest;

    const uid = requireAdmin(request);
    expect(uid).toBe('admin_123');
  });

  it('should throw permission-denied when user is not admin', () => {
    const request = {
      auth: {
        uid: 'user_123',
        token: { role: 'customer' },
      },
    } as unknown as CallableRequest;

    expect(() => requireAdmin(request)).toThrow();
    try {
      requireAdmin(request);
    } catch (error: unknown) {
      const httpsError = error as { code: string };
      expect(httpsError.code).toBe('permission-denied');
    }
  });

  it('should throw permission-denied when no role claim', () => {
    const request = {
      auth: {
        uid: 'user_123',
        token: {},
      },
    } as unknown as CallableRequest;

    expect(() => requireAdmin(request)).toThrow();
  });

  it('should throw unauthenticated when no auth at all', () => {
    const request = {
      auth: undefined,
    } as unknown as CallableRequest;

    expect(() => requireAdmin(request)).toThrow();
    try {
      requireAdmin(request);
    } catch (error: unknown) {
      const httpsError = error as { code: string };
      expect(httpsError.code).toBe('unauthenticated');
    }
  });
});
