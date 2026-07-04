import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBasket, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OTPInput } from '../common/OTPInput';
import { Button } from '../ui/button';
export function LoginScreen() {
  const navigate = useNavigate();
  const { user, isLoading, otpSent, error, sendOTP, verifyOTP, clearError } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  // Redirect if already logged in
  if (user) {
    navigate('/home', { replace: true });
    return null;
  }
  const handleSendOTP = async () => {
    await sendOTP(phone);
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const handleVerifyOTP = async () => {
    const success = await verifyOTP(otp);
    if (success) {
      navigate('/home', { replace: true });
    }
  };
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
      {/* Top Gradient Section */}
      <div className="flex-shrink-0 bg-gradient-to-br from-[#22c55e] to-[#16a34a] pt-16 pb-12 px-8 rounded-b-[2.5rem] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-20 -left-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="flex flex-col items-center relative z-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <ShoppingBasket size={40} className="text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">BazaarBasket</h1>
          <p className="text-white/80 text-sm">Fresh groceries at your doorstep</p>
        </div>
      </div>
      {/* Form Section */}
      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
        {!otpSent ? (
          /* Phase 1: Phone Input */
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome!</h2>
            <p className="text-sm text-gray-500 mb-8">Enter your phone number to continue</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center h-12 px-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => {
                  clearError();
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(v);
                }}
                className="flex-1 h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base font-medium focus:border-[#22c55e] focus:bg-green-50 outline-none transition-all tracking-widest"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </p>
            )}
            <Button
              onClick={handleSendOTP}
              disabled={phone.length !== 10 || isLoading}
              className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Send OTP'
              )}
            </Button>
          </>
        ) : (
          /* Phase 2: OTP Verification */
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Verify OTP</h2>
            <p className="text-sm text-gray-500 mb-8">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-gray-700">+91 {phone}</span>
            </p>
            <div className="mb-6">
              <OTPInput
                value={otp}
                onChange={(v) => {
                  clearError();
                  setOtp(v);
                }}
                error={!!error}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 mb-4 text-center flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </p>
            )}
            <Button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isLoading}
              className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Verify & Continue'
              )}
            </Button>
            <div className="text-center mt-5">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-400">Resend OTP in <span className="font-semibold text-gray-600">{resendTimer}s</span></p>
              ) : (
                <button
                  onClick={handleSendOTP}
                  className="text-sm font-semibold text-[#22c55e] hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
        {/* Footer hint */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-xs text-gray-300">Demo: Use OTP <span className="font-mono font-bold text-gray-400">123456</span></p>
        </div>
      </div>
    </div>
  );
}
