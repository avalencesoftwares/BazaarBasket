import { useNavigate } from 'react-router';
import { Package, ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MOCK_ORDERS } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
export function OrdersScreen() {
  const navigate = useNavigate();
  const activeOrders = MOCK_ORDERS.filter((o) => ['pending', 'accepted', 'out_for_delivery'].includes(o.status));
  const pastOrders = MOCK_ORDERS.filter((o) => ['delivered', 'cancelled'].includes(o.status));
  const renderOrderCard = (order: typeof MOCK_ORDERS[0]) => (
    <button
      key={order.id}
      onClick={() => navigate(`/orders/${order.id}`)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">{order.id}</span>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
        <span>{order.date}</span>
        <span>•</span>
        <span>{order.slot}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
        <span className="text-sm font-bold text-gray-900">₹{order.total}</span>
      </div>
    </button>
  );
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center h-14 px-4">
          <Package size={20} className="text-[#22c55e] mr-2" />
          <h1 className="text-base font-bold text-gray-900">My Orders</h1>
        </div>
      </header>
      <div className="px-4 pt-3">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full bg-gray-100 rounded-xl p-1 h-11">
            <TabsTrigger value="active" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#22c55e] data-[state=active]:shadow-sm">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#22c55e] data-[state=active]:shadow-sm">
              Past ({pastOrders.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-3 space-y-2.5">
            {activeOrders.length > 0 ? (
              activeOrders.map(renderOrderCard)
            ) : (
              <EmptyState
                icon={Package}
                title="No active orders"
                description="You don't have any active orders right now."
                actionLabel="Start Shopping"
                onAction={() => navigate('/home')}
              />
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-3 space-y-2.5">
            {pastOrders.length > 0 ? (
              pastOrders.map(renderOrderCard)
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No past orders"
                description="Your completed and cancelled orders will appear here."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
