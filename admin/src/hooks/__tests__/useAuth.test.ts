// packages/admin/src/hooks/__tests__/useAuth.test.ts
// Unit tests for the useAuth hook, specifically checking auth listening and session timeout

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '../../stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the services firebase module
vi.mock('../../services/firebase', () => ({
  auth: {},
}));

describe('useAuth hook', () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    vi.useFakeTimers();
    window.alert = vi.fn();
    (onAuthStateChanged as any).mockImplementation((_authInstance: any, _callback: any) => {
      // Do not invoke callback immediately, letting store state persist without triggering async auth checks
      return vi.fn(); // unsubscribe function
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.alert = originalAlert;
    vi.clearAllMocks();
  });

  it('should initialize with default store values', () => {
    // Arrange: set store state
    act(() => {
      useAuthStore.setState({
        user: null,
        isAdmin: false,
        loading: false,
        error: null,
      });
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should trigger logout when session exceeds 30 minutes of inactivity', async () => {
    // Arrange: mock logged-in admin state
    const mockLogout = vi.fn().mockImplementation(() => {
      useAuthStore.setState({ user: null, isAdmin: false });
      return Promise.resolve();
    });
    const mockUser = { email: 'admin@bazaarbasket.com', getIdTokenResult: vi.fn() };
    
    act(() => {
      useAuthStore.setState({
        user: mockUser as any,
        isAdmin: true,
        loading: false,
        lastActivity: Date.now(),
        logout: mockLogout,
      });
    });

    // Act
    renderHook(() => useAuth());

    // Fast-forward time by 31 minutes (31 * 60 * 1000 ms)
    act(() => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    // Assert
    expect(mockLogout).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('session has expired due to inactivity')
    );
  });

  it('should NOT trigger logout if user remains active within 30 minutes', () => {
    // Arrange: mock logged-in admin state
    const mockLogout = vi.fn().mockImplementation(() => {
      useAuthStore.setState({ user: null, isAdmin: false });
      return Promise.resolve();
    });
    const mockUser = { email: 'admin@bazaarbasket.com' };
    
    act(() => {
      useAuthStore.setState({
        user: mockUser as any,
        isAdmin: true,
        loading: false,
        lastActivity: Date.now(),
        logout: mockLogout,
      });
    });

    // Act
    renderHook(() => useAuth());

    // Advance time by 20 minutes
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    // Simulate activity (dispatches mouse down event)
    act(() => {
      window.dispatchEvent(new Event('mousedown'));
    });

    // Advance time by another 20 minutes (total 40, but last active was 20 mins ago)
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    // Assert
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
