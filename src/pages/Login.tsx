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
  const [googleLoading, setGoogleLoading] = useState(false);
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
    try { await signIn(email, password); toast('Welcome back!', 'success'); navigate('/'); } catch (err: any) { toast(err.message || 'Login failed', 'error'); } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try { await signInWithGoogle(); toast('Welcome with Google!', 'success'); navigate('/'); } catch (err: any) { toast(err.message || 'Google login failed', 'error'); } finally { setGoogleLoading(false); }
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
        {/* Google */}
        <motion.button onClick={handleGoogle} disabled={googleLoading} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 bg-white card-bg border-[1.5px] border-[var(--border)] border-dark hover:border-[var(--sky)] hover:shadow-md transition-all mb-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {googleLoading ? (
            <motion.div className="w-4 h-4 border-[2.5px] border-[var(--border)] rounded-full border-t-[var(--sky)]" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t('auth.login')} Google
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
