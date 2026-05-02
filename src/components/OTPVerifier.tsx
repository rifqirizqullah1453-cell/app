import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RotateCcw } from 'lucide-react';

interface OTPVerifierProps {
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onCancel: () => void;
  error?: string;
}

export default function OTPVerifier({ phone, onVerify, onResend, onCancel, error }: OTPVerifierProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
    setCanResend(true);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      onVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    onResend();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#E8F8FA' }}>
          <ShieldCheck className="w-8 h-8" style={{ color: '#2BC5D4' }} />
        </div>
        <p className="text-lg font-black" style={{ color: 'var(--text)' }}>Verify Code</p>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
          Verification code sent to <span className="font-bold" style={{ color: '#2BC5D4' }}>{phone}</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-black rounded-2xl border-[2px] border-[var(--border)] focus:border-[#2BC5D4] outline-none transition-all bg-white card-bg"
            style={{ color: 'var(--text)' }}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs font-bold text-center text-red-500">{error}</p>
      )}

      {/* Resend */}
      <div className="text-center">
        {canResend ? (
          <motion.button
            onClick={handleResend}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-bold flex items-center gap-1.5 mx-auto"
            style={{ color: '#2BC5D4' }}
          >
            <RotateCcw className="w-4 h-4" /> Resend code
          </motion.button>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Resend in <span className="font-bold" style={{ color: '#2BC5D4' }}>{timer}s</span>
          </p>
        )}
      </div>

      {/* Verify Button */}
      <motion.button
        onClick={() => onVerify(code.join(''))}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full btn-cyan rounded-2xl py-3.5 text-sm font-bold"
      >
        Verify
      </motion.button>

      <motion.button
        onClick={onCancel}
        whileTap={{ scale: 0.95 }}
        className="w-full py-3 rounded-2xl text-sm font-bold border border-[var(--border)] card-bg"
        style={{ color: 'var(--text-secondary)' }}
      >
        Cancel
      </motion.button>
    </motion.div>
  );
}
