// packages/admin/src/pages/Orders.tsx
// Order management page: list, filter, and view detailed order metrics with timeline tracking

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  ArrowRight,
  ClipboardList,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/adminService';
import {
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS_LABELS,
} from '@bazaarbasket/shared';
import { formatCurrency } from '@bazaarbasket/shared';
import type { Order } from '@bazaarbasket/shared';

const STATUS_ICONS: Record<OrderStatus, any> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.CONFIRMED]: CheckCircle,
  [OrderStatus.PACKED]: Package,
  [OrderStatus.OUT_FOR_DELIVERY]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle,
  [OrderStatus.CANCELLED]: XCircle,
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200/60',
  [OrderStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200/60',
  [OrderStatus.PACKED]: 'bg-purple-50 text-purple-700 border-purple-200/60',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  [OrderStatus.DELIVERED]: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200/60',
};

export const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(''); // empty means All
  const [pageCursor, setPageCursor] = useState<any>(null);
  const [cursorHistory, setCursorHistory] = useState<any[]>([]);

  // Detailed view drawer state
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch orders query
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['orders', selectedStatusFilter, pageCursor],
    queryFn: () => getOrders({
      status: selectedStatusFilter || undefined,
      lastDoc: pageCursor || undefined,
    }),
    refetchInterval: 15000, // auto refresh orders list every 15s
  });

  const orders = orderData?.orders || [];
  const hasMore = orderData?.hasMore || false;

  const handleNextPage = () => {
    if (hasMore && orderData?.lastDoc) {
      setCursorHistory((prev) => [...prev, pageCursor]);
      setPageCursor(orderData.lastDoc);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevHistory = [...cursorHistory];
      const prevCursor = prevHistory.pop();
      setCursorHistory(prevHistory);
      setPageCursor(prevCursor);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatusFilter(status);
    setPageCursor(null);
    setCursorHistory([]);
  };

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!viewingOrder) return;
    
    setUpdatingStatus(true);
    setUpdateError(null);

    try {
      await updateOrderStatus({
        orderId: viewingOrder.id,
        status: nextStatus,
        note: statusNote.trim() || `Status updated to ${ORDER_STATUS_LABELS[nextStatus]}`,
      });

      // Reset state and invalidate cache
      setStatusNote('');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Update local viewing order state
      const updatedHistory = [
        ...viewingOrder.statusHistory,
        {
          status: nextStatus,
          timestamp: new Date(),
          note: statusNote.trim() || `Status updated to ${ORDER_STATUS_LABELS[nextStatus]}`,
        },
      ];
      setViewingOrder({
        ...viewingOrder,
        status: nextStatus,
        paymentStatus: nextStatus === OrderStatus.DELIVERED ? PaymentStatus.PAID : viewingOrder.paymentStatus,
        statusHistory: updatedHistory,
      });

    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      setUpdateError(err?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filterTabs = [
    { key: '', label: 'All Orders' },
    { key: OrderStatus.PENDING, label: 'Pending' },
    { key: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { key: OrderStatus.PACKED, label: 'Packed' },
    { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
    { key: OrderStatus.DELIVERED, label: 'Delivered' },
    { key: OrderStatus.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Monitor order status sequences, delivery allocations, and customer receipts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilterChange(tab.key)}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border whitespace-nowrap ${
              selectedStatusFilter === tab.key
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-gray-100 border-transparent text-muted-foreground hover:bg-gray-200/50 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List Table */}
      {isLoading ? (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[450px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading customer orders database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Orders Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No order records match the selected status category.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50/75">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const StatusIcon = STATUS_ICONS[order.status] || Clock;
                    const date = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="p-4 font-mono font-bold text-foreground text-sm">
                          {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {date.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 text-sm">
                          <div className="font-semibold text-foreground">{order.userName || 'Guest'}</div>
                          <div className="text-xs text-muted-foreground">{order.userPhone}</div>
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              order.paymentStatus === PaymentStatus.PAID
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : order.paymentStatus === PaymentStatus.PENDING
                                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_CLASSES[order.status]
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="bg-secondary hover:bg-primary hover:text-primary-foreground border border-border p-2 rounded-lg text-muted-foreground transition-all duration-150 inline-flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Showing page records
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Drawer for Order Details */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl h-screen overflow-y-auto p-6 md:p-8 flex flex-col justify-between border-l border-white/10 animate-in slide-in-from-right duration-250">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-6 border-b border-border mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-full text-muted-foreground uppercase">
                      COD ORDER
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_CLASSES[viewingOrder.status]}`}>
                      {ORDER_STATUS_LABELS[viewingOrder.status]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mt-2">
                    Order #{viewingOrder.orderNumber || viewingOrder.id.slice(0, 8).toUpperCase()}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update section */}
              {ORDER_STATUS_TRANSITIONS[viewingOrder.status] && ORDER_STATUS_TRANSITIONS[viewingOrder.status].length > 0 && (
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6 space-y-4">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Transition Order Status
                  </h3>
                  {updateError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold">
                      {updateError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Attach a status modification note (optional)..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {ORDER_STATUS_TRANSITIONS[viewingOrder.status].map((next) => (
                        <button
                          key={next}
                          onClick={() => handleUpdateStatus(next)}
                          disabled={updatingStatus}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-[0.98] disabled:opacity-50 transition-all duration-150"
                        >
                          {updatingStatus ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          Move to {ORDER_STATUS_LABELS[next]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Order content sections */}
              <div className="space-y-6">
                {/* 1. Customer details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Customer Details
                    </h4>
                    <p className="font-bold text-foreground text-sm">{viewingOrder.userName || 'Guest customer'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {viewingOrder.userPhone}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Delivery Slot
                    </h4>
                    <p className="font-bold text-foreground text-sm">{viewingOrder.deliverySlot.date}</p>
                    <p className="text-xs text-primary font-semibold">
                      {viewingOrder.deliverySlot.label} ({viewingOrder.deliverySlot.startTime} - {viewingOrder.deliverySlot.endTime})
                    </p>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Delivery Address
                  </h4>
                  <p className="text-sm font-semibold text-foreground">
                    {viewingOrder.deliveryAddress.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {viewingOrder.deliveryAddress.addressLine1}, {viewingOrder.deliveryAddress.addressLine2 && `${viewingOrder.deliveryAddress.addressLine2}, `}
                    {viewingOrder.deliveryAddress.landmark && `Landmark: ${viewingOrder.deliveryAddress.landmark}, `}
                    {viewingOrder.deliveryAddress.city}, {viewingOrder.deliveryAddress.state} - {viewingOrder.deliveryAddress.pincode}
                  </p>
                </div>

                {/* 3. Items list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Order Items ({viewingOrder.items.length})
                  </h4>
                  <div className="border border-gray-200/80 rounded-xl overflow-hidden divide-y divide-gray-200/80 bg-gray-50/40">
                    {viewingOrder.items.map((item, idx) => (
                      <div key={idx} className="p-4 flex justify-between items-center gap-4 hover:bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground"><ShoppingBag size={16} /></div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.unit} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(item.subtotal)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Payment breakdown & notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Notes</h4>
                    <p className="text-xs text-muted-foreground bg-gray-50/50 border border-gray-100 p-3 rounded-xl italic min-h-[50px]">
                      {viewingOrder.notes || 'No notes provided by customer.'}
                    </p>
                    {viewingOrder.cancelReason && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs font-bold text-rose-700">Cancellation Reason</p>
                        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                          {viewingOrder.cancelReason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-2.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Items Total</span>
                      <span>{formatCurrency(viewingOrder.itemsTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>GST Amount</span>
                      <span>{formatCurrency(viewingOrder.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(viewingOrder.deliveryFee)}</span>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <div className="flex justify-between text-sm font-bold text-foreground">
                      <span>Total Amount</span>
                      <span className="text-primary">{formatCurrency(viewingOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Status History Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status History & Timeline</h4>
                  <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                    {viewingOrder.statusHistory.map((hist, idx) => {
                      const histDate = hist.timestamp instanceof Date ? hist.timestamp : new Date(hist.timestamp);
                      const isLast = idx === viewingOrder.statusHistory.length - 1;

                      return (
                        <div key={idx} className="relative flex gap-3 items-start">
                          <span
                            className={`absolute -left-[14.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                              isLast ? 'bg-primary border-primary animate-pulse' : 'bg-background border-border'
                            }`}
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-foreground">
                                {ORDER_STATUS_LABELS[hist.status]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {histDate.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5">{hist.note}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end pt-6 border-t border-border mt-8">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl border border-border text-center transition-colors duration-150"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
