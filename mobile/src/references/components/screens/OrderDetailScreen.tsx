import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Phone, MapPin, Clock, XCircle, Check } from 'lucide-react';
import { MOCK_ORDERS, type OrderStatus } from '../../data/mockData';
import { AppHeader } from '../layout/AppHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
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
const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];
function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STEPS.findIndex((s) => s.key === status);
}
export function OrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelled, setCancelled] = useState(false);
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        <AppHeader title="Order Details" />
        <EmptyState title="Order not found" actionLabel="Go to Orders" onAction={() => navigate('/orders')} />
      </div>
    );
  }
  const currentStatus = cancelled ? 'cancelled' : order.status;
  const stepIdx = getStepIndex(currentStatus);
  const showPartner = ['accepted', 'out_for_delivery', 'delivered'].includes(currentStatus) && order.deliveryPartner;
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-8">
      <AppHeader title={`Order ${order.id}`} />
      <div className="px-4 py-3">
        {/* Status + Badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
          <StatusBadge status={currentStatus} />
        </div>
        {/* Status Tracker */}
        {currentStatus !== 'cancelled' ? (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-[#22c55e] transition-all duration-500"
                style={{ width: `${Math.max(0, stepIdx) / (STEPS.length - 1) * (100 - 8)}%` }}
              />
              {STEPS.map((step, i) => (
                <div key={step.key} className="relative z-10 flex flex-col items-center" style={{ width: 70 }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= stepIdx
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${i === stepIdx ? 'ring-4 ring-green-100' : ''}`}>
                    {i <= stepIdx ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium mt-2 text-center leading-tight ${
                    i <= stepIdx ? 'text-[#22c55e]' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl border border-red-100 p-4 mb-4 text-center">
            <XCircle size={32} className="text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
          </div>
        )}
        {/* Delivery Partner */}
        {showPartner && order.deliveryPartner && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Delivery Partner</p>
              <p className="text-sm font-semibold text-gray-800">{order.deliveryPartner.name}</p>
            </div>
            <a
              href={`tel:${order.deliveryPartner.phone}`}
              className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center shadow-sm"
            >
              <Phone size={16} className="text-white" />
            </a>
          </div>
        )}
        {/* Address & Slot */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 space-y-3">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Delivery Address</p>
              <p className="text-sm text-gray-700">{order.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={16} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Delivery Slot</p>
              <p className="text-sm text-gray-700">{order.slot}</p>
            </div>
          </div>
        </div>
        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Items ({order.items.length})</h3>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.weight} × {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bill Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className={order.deliveryCharge === 0 ? 'text-[#22c55e] font-semibold' : ''}>
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
        {/* Cancel Order */}
        {currentStatus === 'pending' && !cancelled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full h-11 rounded-xl border-red-300 text-red-500 hover:bg-red-50">
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your order {order.id} will be cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => setCancelled(true)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
