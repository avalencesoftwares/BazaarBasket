// packages/admin/src/components/__tests__/ProtectedRoute.test.tsx
// Unit tests for the ProtectedRoute routing guard component

import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { expect, vi, describe, it } from 'vitest';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom elements
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(() => <div data-testid="navigate-mock" />),
  useLocation: vi.fn(() => ({ pathname: '/admin/dashboard' })),
}));

describe('ProtectedRoute component', () => {
  it('should render a loading spinner when auth state is loading', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: true,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="child-content">Secret Content</div>
      </ProtectedRoute>
    );

    // Assert
    expect(screen.getByText(/verifying security credentials/i)).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should redirect to /login when user is not logged in', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="child-content">Secret Content</div>
      </ProtectedRoute>
    );

    // Assert
    expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/login',
        replace: true,
      }),
      expect.any(Object)
    );
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should redirect to /login when user is logged in but is not an admin', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: { email: 'customer@bazaarbasket.com' },
      isAdmin: false,
      loading: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="child-content">Secret Content</div>
      </ProtectedRoute>
    );

    // Assert
    expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render children when user is logged in and is an admin', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: { email: 'admin@bazaarbasket.com' },
      isAdmin: true,
      loading: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="child-content">Secret Content</div>
      </ProtectedRoute>
    );

    // Assert
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
  });
});
