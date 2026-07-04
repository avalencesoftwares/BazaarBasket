import { useRef, useEffect, useCallback } from 'react';
interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}
export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  const handleChange = useCallback(
    (idx: number, char: string) => {
      if (!/^\d?$/.test(char)) return;
      const arr = value.split('');
      arr[idx] = char;
      const newValue = arr.join('').slice(0, length);
      onChange(newValue);
      if (char && idx < length - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [value, length, onChange]
  );
  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !value[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [value]
  );
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
    },
    [length, onChange]
  );
  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 outline-none transition-all
            ${error
              ? 'border-red-400 bg-red-50 animate-[shake_0.4s_ease-in-out]'
              : value[i]
                ? 'border-[#22c55e] bg-green-50'
                : 'border-gray-200 focus:border-[#22c55e] focus:bg-green-50'
            }
          `}
        />
      ))}
    </div>
  );
}
