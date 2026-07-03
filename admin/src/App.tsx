// packages/admin/src/App.tsx
// Core Application router and layout orchestrator

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';

// Lazy-load page components for faster initial load
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Products = React.lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const Categories = React.lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Orders = React.lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Inventory = React.lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Layout wrapper for authenticated admin users
const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // The ProtectedRoute HOC handles redirects, so we just show nothing while transitioning
  }

  return (
    <div className="flex bg-[#f8fafc] text-foreground min-h-screen">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-[#F4F5F7] via-white to-[#EBF9F9]">
        <div className="relative z-10">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};
