import type { DeliverySlot } from '../../data/mockData';
import { Check } from 'lucide-react';
interface SlotChipProps {
  slot: DeliverySlot;
  selected: boolean;
  onClick: () => void;
}
export function SlotChip({ slot, selected, onClick }: SlotChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={!slot.available}
      className={`
        relative w-full p-3.5 rounded-xl border-2 text-left transition-all
        ${selected
          ? 'border-[#22c55e] bg-green-50 shadow-sm'
          : slot.available
            ? 'border-gray-200 bg-white hover:border-gray-300'
            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
        }
      `}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      )}
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${slot.available ? 'bg-[#22c55e]' : 'bg-red-400'}`} />
        <span className="text-sm font-semibold text-gray-800">{slot.timeWindow}</span>
      </div>
      <p className={`text-xs ${slot.available ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
        {slot.available ? `${slot.slotsLeft} slots left` : 'Full'}
      </p>
    </button>
  );
}
