import { useNavigate } from 'react-router';
import { User, MapPin, Phone, Info, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../layout/AppHeader';
import { MOCK_ADDRESSES } from '../../data/mockData';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const maskedPhone = user?.phone ? `XXXXXX${user.phone.slice(-4)}` : '';
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <AppHeader title="Profile" showBack={true} />
      {/* User Card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{user?.name || 'User'}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Phone size={12} />
            +91 {maskedPhone}
          </p>
        </div>
      </div>
      {/* Menu Items */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* My Addresses */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <MapPin size={18} className="text-[#22c55e]" />
                </div>
                <span className="text-sm font-medium text-gray-800">My Addresses</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle>Saved Addresses</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 pb-6">
              {MOCK_ADDRESSES.map((addr) => (
                <div key={addr.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{addr.label === 'Home' ? '🏠' : '💼'} {addr.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">{addr.landmark} • {addr.pincode}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        {/* Support */}
        <a
          href="tel:+919876543210"
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Phone size={18} className="text-blue-500" />
            </div>
            <span className="text-sm font-medium text-gray-800">Support (Call Store)</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </a>
        {/* About */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Info size={18} className="text-purple-500" />
                </div>
                <span className="text-sm font-medium text-gray-800">About</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>About BazaarBasket</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-6 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">BazaarBasket</h3>
              <p className="text-sm text-gray-500 mb-2">Version 1.0.0</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Your local Kirana store, now delivered to your doorstep within 10km. Fresh groceries, quick delivery, cash on delivery.
              </p>
            </div>
          </SheetContent>
        </Sheet>
        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500">Logout</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout from BazaarBasket?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
