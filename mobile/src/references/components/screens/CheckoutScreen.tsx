import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Clock, CheckCircle2, Plus, Home, Briefcase, Building, ChevronLeft, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { MOCK_ADDRESSES, DELIVERY_SLOTS, VALID_PINCODES, type Address } from '../../data/mockData';
import { SlotChip } from '../common/SlotChip';
import { Button } from '../ui/button';
import { toast, Toaster } from 'sonner';
type Step = 'address' | 'slot' | 'confirm';
export function CheckoutScreen() {
  const navigate = useNavigate();
  const { grandTotal, totalItems, clearCart } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<string>(MOCK_ADDRESSES[0]?.id || '');
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullAddress: '', landmark: '', pincode: '', label: 'Home' as Address['label'] });
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [orderId] = useState(`ORD-${10050 + Math.floor(Math.random() * 100)}`);
  const [isPlacing, setIsPlacing] = useState(false);
  // Get unique dates from slots
  const dates = useMemo(() => {
    const seen = new Set<string>();
    return DELIVERY_SLOTS.filter((s) => {
      if (seen.has(s.date)) return false;
      seen.add(s.date);
      return true;
    }).map((s) => ({ date: s.date, label: s.dateLabel }));
  }, []);
  const slotsForDate = useMemo(() => {
    if (!dates[selectedDate]) return [];
    return DELIVERY_SLOTS.filter((s) => s.date === dates[selectedDate].date);
  }, [selectedDate, dates]);
  const selectedSlotData = DELIVERY_SLOTS.find((s) => s.id === selectedSlot);
  const handleContinueToSlot = () => {
    if (showNewAddr) {
      if (!newAddr.fullAddress.trim() || !newAddr.pincode.trim()) {
        toast.error('Please fill in address and pincode');
        return;
      }
      if (!VALID_PINCODES.includes(newAddr.pincode)) {
        toast.error("Sorry, we don't deliver to this location yet.");
        return;
      }
    }
    setStep('slot');
  };
  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    setIsPlacing(false);
    setStep('confirm');
  };
  const stepIndex = step === 'address' ? 0 : step === 'slot' ? 1 : 2;
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center h-14 px-4">
          {step !== 'confirm' && (
            <button
              onClick={() => step === 'address' ? navigate(-1) : setStep('address')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 mr-1"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
          )}
          <h1 className="text-base font-bold text-gray-900 flex-1 text-center pr-10">Checkout</h1>
        </div>
        {/* Progress */}
        <div className="flex items-center px-6 pb-3 gap-1">
          {['Address', 'Slot', 'Confirm'].map((label, i) => (
            <div key={label} className="flex-1 flex items-center gap-1">
              <div className={`flex-1 h-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-[#22c55e]' : 'bg-gray-200'}`} />
              {i < 2 && <div className="w-0.5" />}
            </div>
          ))}
        </div>
        <div className="flex px-6 pb-2">
          {['Address', 'Slot', 'Confirm'].map((label, i) => (
            <span key={label} className={`flex-1 text-center text-[10px] font-medium ${i <= stepIndex ? 'text-[#22c55e]' : 'text-gray-400'}`}>
              {label}
            </span>
          ))}
        </div>
      </header>
      {/* Step 1: Address */}
      {step === 'address' && (
        <div className="p-4 pb-28">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-[#22c55e]" />
            Select Delivery Address
          </h2>
          <div className="space-y-2 mb-4">
            {MOCK_ADDRESSES.map((addr) => (
              <button
                key={addr.id}
                onClick={() => { setSelectedAddress(addr.id); setShowNewAddr(false); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAddress === addr.id && !showNewAddr
                    ? 'border-[#22c55e] bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {addr.label === 'Home' ? <Home size={14} className="text-[#22c55e]" /> : <Briefcase size={14} className="text-blue-500" />}
                  <span className="text-sm font-semibold text-gray-800">{addr.label}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{addr.fullAddress}</p>
                <p className="text-xs text-gray-400 mt-1">{addr.landmark} • {addr.pincode}</p>
              </button>
            ))}
          </div>
          {/* Add New Address */}
          <button
            onClick={() => setShowNewAddr(!showNewAddr)}
            className="w-full flex items-center gap-2 p-3 text-sm font-semibold text-[#22c55e] border-2 border-dashed border-[#22c55e]/30 rounded-xl hover:bg-green-50 transition-colors mb-4"
          >
            <Plus size={16} />
            Add New Address
          </button>
          {showNewAddr && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 mb-4">
              <input
                type="text"
                placeholder="Full address"
                value={newAddr.fullAddress}
                onChange={(e) => setNewAddr({ ...newAddr, fullAddress: e.target.value })}
                className="w-full h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#22c55e]"
              />
              <input
                type="text"
                placeholder="Landmark (optional)"
                value={newAddr.landmark}
                onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                className="w-full h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#22c55e]"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                inputMode="numeric"
                className="w-full h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#22c55e]"
              />
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((label) => (
                  <button
                    key={label}
                    onClick={() => setNewAddr({ ...newAddr, label })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                      newAddr.label === label ? 'border-[#22c55e] bg-green-50 text-[#22c55e]' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {label === 'Home' ? '🏠' : label === 'Work' ? '💼' : '📍'} {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
            <div className="max-w-md mx-auto">
              <Button onClick={handleContinueToSlot} className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200">
                Continue to Slot Selection
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Step 2: Slot Selection */}
      {step === 'slot' && (
        <div className="p-4 pb-28">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-[#22c55e]" />
            Choose Delivery Slot
          </h2>
          {/* Date Strip */}
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: 'none' }}>
            {dates.map((d, i) => (
              <button
                key={d.date}
                onClick={() => { setSelectedDate(i); setSelectedSlot(null); }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-center transition-all ${
                  selectedDate === i
                    ? 'bg-[#22c55e] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xs font-semibold block">{d.label}</span>
              </button>
            ))}
          </div>
          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-2.5">
            {slotsForDate.map((slot) => (
              <SlotChip
                key={slot.id}
                slot={slot}
                selected={selectedSlot === slot.id}
                onClick={() => setSelectedSlot(slot.id)}
              />
            ))}
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
            <div className="max-w-md mx-auto">
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedSlot || isPlacing}
                className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none"
              >
                {isPlacing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  `Place Order (COD) — ₹${grandTotal}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Step 3: Confirmation */}
      {step === 'confirm' && (
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
          {/* Animated Checkmark */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-[scaleIn_0.5s_ease-out]">
            <CheckCircle2 size={56} className="text-[#22c55e]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">Your order has been placed successfully and will be delivered soon.</p>
          <div className="bg-white rounded-xl border border-gray-200 p-4 w-full mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Order ID</span>
              <span className="font-bold text-gray-800">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Items</span>
              <span className="font-medium text-gray-700">{totalItems} items</span>
            </div>
            {selectedSlotData && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Slot</span>
                <span className="font-medium text-gray-700">{selectedSlotData.dateLabel}, {selectedSlotData.timeWindow}</span>
              </div>
            )}
          </div>
          <div className="w-full space-y-2.5">
            <Button
              onClick={() => navigate('/orders')}
              className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold"
            >
              Track Order
            </Button>
            <Button
              onClick={() => navigate('/home')}
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-semibold border-gray-300"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
