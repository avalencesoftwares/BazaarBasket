import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { TabLayout } from './components/layout/TabLayout';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { CartScreen } from './components/screens/CartScreen';
import { OrdersScreen } from './components/screens/OrdersScreen';
import { CategoryScreen } from './components/screens/CategoryScreen';
import { ProductDetailScreen } from './components/screens/ProductDetailScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { OrderDetailScreen } from './components/screens/OrderDetailScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route
        element={
          <ProtectedRoute>
            <TabLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
      </Route>
      <Route path="/category/:id" element={<ProtectedRoute><CategoryScreen /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetailScreen /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutScreen /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default function App() {
  return (
    <div className="size-full flex items-center justify-center">
    </div>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="size-full bg-gray-50">
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
}