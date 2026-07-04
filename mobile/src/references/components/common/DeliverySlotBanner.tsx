import { Clock, ChevronRight } from 'lucide-react';
export function DeliverySlotBanner() {
  return (
    <div className="mx-4 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] p-3.5 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Clock size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-white/80 text-[10px] font-medium uppercase tracking-wide">Next Delivery</p>
        <p className="text-white text-sm font-bold">Today, 6:00 PM – 8:00 PM</p>
      </div>
      <ChevronRight size={18} className="text-white/60" />
    </div>
  );
}
