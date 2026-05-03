import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Sparkles, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kimiLoading, setKimiLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleGuest = () => {
    const guestProfile = {
      uid: 'guest-' + Date.now(),
      name: 'Guest',
      email: '',
      role: 'customer' as const,
      phone: '',
      rating: 5.0,
      totalRatings: 0,
      isOnline: true,
      createdAt: Date.now(),
    };
    localStorage.setItem('boh_session', JSON.stringify(guestProfile));
    toast('Continuing as guest', 'info');
    navigate('/customer');
    window.location.reload();
  };

  const submit = async () => {
    if (!email || !password) { toast('Email and password required', 'error'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Welcome back!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKimiOAuth = async () => {
    setKimiLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
      setKimiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-10 rounded-b-[32px] gradient-hero relative overflow-hidden">
        <motion.div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-40%', right: '-20%' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-full glass mb-6">
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="relative z-10 flex items-center gap-4">
          <motion.div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 shrink-0 bg-white/10 backdrop-blur"
            animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <img src="/images/c-mascot.png" alt="BOH" className="w-full h-full object-cover" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{t('auth.login')}</h1>
            <p className="text-sm text-white/60 font-medium mt-0.5">{t('auth.hasAccount')}</p>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-6 pb-10 max-w-md mx-auto w-full -mt-4">
        {/* Kimi OAuth Login */}
        <motion.button onClick={handleKimiOAuth} disabled={kimiLoading} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 bg-white card-bg border-[1.5px] border-[var(--border)] border-dark hover:border-[var(--sky)] hover:shadow-md transition-all mb-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {kimiLoading ? (
            <motion.div className="w-4 h-4 border-[2.5px] border-[var(--border)] rounded-full border-t-[var(--sky)]" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="url(#kimi)"/><defs><linearGradient id="kimi" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#7C3AED"/><stop offset="1" stopColor="#2DD4BF"/></linearGradient></defs></svg>
              Sign in with Kimi
            </>
          )}
        </motion.button>

        {/* Divider */}
        <motion.div className="flex items-center gap-3 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{t('auth.email').toUpperCase()}</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: focusedField === 'email' ? 'var(--sky)' : '#B8D4E8' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                className="input" onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: focusedField === 'password' ? 'var(--sky)' : '#B8D4E8' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')}
                onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                className="input" style={{ paddingRight: 48 }} onKeyDown={e => e.key === 'Enter' && submit()} />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </motion.div>

          <motion.button onClick={submit} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full btn-cyan flex items-center justify-center gap-2 rounded-2xl py-4" style={{ opacity: loading ? 0.7 : 1 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            {loading ? (
              <motion.div className="w-5 h-5 border-[2.5px] border-white/40 rounded-full border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            ) : <><Sparkles className="w-4 h-4" /> {t('auth.login')} <ArrowRight className="w-4 h-4" /></>}
          </motion.button>

          <motion.p className="text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {t('auth.noAccount')}{' '}
            <button onClick={() => navigate('/register')} className="font-bold transition-colors hover:underline" style={{ color: 'var(--sky)' }}>{t('auth.register')}</button>
          </motion.p>

          {/* Guest Checkout */}
          <motion.button
            onClick={handleGuest}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border border-[var(--border)] card-bg"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <User className="w-4 h-4" /> {t('auth.guestCheckout')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
