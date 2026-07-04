import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Tag, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from '../common/CartItemRow';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../ui/button';
export function CartScreen() {
  const navigate = useNavigate();
  const { items, totalAmount, deliveryCharge, grandTotal, totalItems } = useCart();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center h-14 px-4">
            <h1 className="text-base font-bold text-gray-900">My Cart</h1>
          </div>
        </header>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start exploring products!"
          actionLabel="Browse Products"
          onAction={() => navigate('/home')}
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-base font-bold text-gray-900">My Cart ({totalItems} item{totalItems > 1 ? 's' : ''})</h1>
        </div>
      </header>
      {/* Cart Items */}
      <div className="px-4 py-3 space-y-2">
        {items.map((item) => (
          <CartItemRow key={item.product.id} item={item} />
        ))}
      </div>
      {/* Promo Code */}
      <div className="mx-4 mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => setPromoOpen(!promoOpen)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Tag size={16} className="text-[#22c55e]" />
            Apply Promo Code
          </div>
          {promoOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {promoOpen && (
          <div className="px-4 pb-3 flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 h-10 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#22c55e]"
            />
            <Button variant="outline" className="h-10 px-4 rounded-lg border-[#22c55e] text-[#22c55e] text-sm font-semibold">
              Apply
            </Button>
          </div>
        )}
      </div>
      {/* Bill Summary */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Bill Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-800 font-medium">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Truck size={14} />
              Delivery
            </span>
            <span className={deliveryCharge === 0 ? 'text-[#22c55e] font-semibold' : 'text-gray-800 font-medium'}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </span>
          </div>
          {deliveryCharge > 0 && (
            <p className="text-[11px] text-gray-400">
              Add ₹{299 - totalAmount} more for free delivery
            </p>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-base">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">₹{grandTotal}</span>
          </div>
        </div>
      </div>
      {/* Sticky Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => navigate('/checkout')}
            className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200"
          >
            Proceed to Checkout — ₹{grandTotal}
          </Button>
        </div>
      </div>
    </div>
  );
}
