import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Package, ShoppingCart, Home as HomeIcon, Truck, Shield, Clock, Star, ArrowRight, MapPin, Zap, ChevronRight, Quote, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const services = [
  { id: 'delivery', name: 'Delivery', desc: 'Fast & reliable package delivery', icon: Package, color: '#2BC5D4', bg: '#E8F8FA' },
  { id: 'shopping', name: 'Shopping', desc: 'Shop from local stores', icon: ShoppingCart, color: '#10B981', bg: '#ECFDF5' },
  { id: 'cleaning', name: 'Cleaning', desc: 'Professional cleaning service', icon: HomeIcon, color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'moving', name: 'Moving', desc: 'Hassle-free transport', icon: Truck, color: '#EC4899', bg: '#FDF2F8' },
];

const features = [
  { icon: Zap, title: 'Instant Booking', desc: 'Book any service in under 30 seconds', color: '#2BC5D4', bg: '#E8F8FA' },
  { icon: Shield, title: 'Trusted Workers', desc: 'Verified & background-checked', color: '#10B981', bg: '#ECFDF5' },
  { icon: Clock, title: 'Live Tracking', desc: 'Real-time order tracking on map', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Star, title: 'Best Prices', desc: 'Transparent pricing, no hidden fees', color: '#F59E0B', bg: '#FFFBEB' },
];

const steps = [
  { step: '01', title: 'Choose Service', desc: 'Pick from 4 trusted services', color: '#2BC5D4', icon: Package },
  { step: '02', title: 'Set Location', desc: 'Mark pickup & destination', color: '#3DD1DC', icon: MapPin },
  { step: '03', title: 'Get Matched', desc: 'We find the best worker', color: '#1BA8B5', icon: Users },
  { step: '04', title: 'Track & Relax', desc: 'Watch progress in real-time', color: '#128A95', icon: TrendingUp },
];

const stats = [
  { value: 500, suffix: '+', label: 'Happy Customers', icon: Users, color: '#2BC5D4', bg: '#E8F8FA' },
  { value: 50, suffix: '+', label: 'Active Workers', icon: Users, color: '#10B981', bg: '#ECFDF5' },
  { value: 1200, suffix: '+', label: 'Orders Delivered', icon: Package, color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 4.9, suffix: '', label: 'Average Rating', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
];

const testimonials = [
  { name: 'Ahmet K.', role: 'Customer', text: 'Boh-Hizmet made my life so much easier. Delivery is always on time!', rating: 5 },
  { name: 'Mehmet T.', role: 'Customer', text: 'The cleaning service was amazing. Professional and thorough work.', rating: 5 },
  { name: 'Hasan D.', role: 'Customer', text: 'I use the shopping service every week. So convenient and fast.', rating: 5 },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)}{suffix}</span>;
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleGetStarted = () => {
    if (userProfile) {
      if (userProfile.role === 'customer') navigate('/customer');
      else if (userProfile.role === 'worker') navigate('/worker');
      else if (userProfile.role === 'admin') navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden px-6 pt-10 pb-20 rounded-b-[40px]" style={{ background: 'linear-gradient(160deg, #4DD4E0 0%, #2BC5D4 40%, #1BA8B5 100%)' }}>
        <motion.div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', top: '-40%', right: '-25%' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', bottom: '-20%', left: '-15%' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          {/* Logo */}
          <motion.div className="flex justify-center mb-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white/10 backdrop-blur p-2">
              <img src="/images/logo-boh.png" alt="Boh-Hizmet" className="w-full h-full object-contain" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: easeOut }}>
            All Services<br />at Your Fingertips
          </motion.h1>

          <motion.p className="text-base text-white/60 font-medium mt-5 max-w-sm mx-auto leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Delivery, Shopping, Cleaning & Moving — delivered fast in Bartin
          </motion.p>

          {/* Buttons */}
          <motion.div className="flex items-center justify-center gap-3 mt-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: easeOut }}>
            <motion.button onClick={handleGetStarted} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl bg-white text-[#2BC5D4]">
              {userProfile ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="w-4 h-4" />
            </motion.button>
            {!userProfile && (
              <motion.button onClick={() => navigate('/register')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-6 py-4 rounded-2xl font-bold text-sm glass text-white hover:bg-white/20 transition-all">
                Register
              </motion.button>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div className="flex items-center justify-center gap-4 mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <span className="text-[11px] font-bold text-white/70">Bartin, Turkey</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />)}
              <span className="text-[11px] text-white/60 font-bold ml-1">4.9</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== STATS COUNTER ========== */}
      <section className="px-5 -mt-10 relative z-10 max-w-lg mx-auto">
        <motion.div
          className="p-5 rounded-3xl bg-white shadow-lg border border-[var(--border-light)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: easeOut }}
        >
          {/* Desktop: 4 cols, Mobile: 2 cols */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                {/* Icon circle */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg || s.color + '15' }}
                >
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                {/* Number + label */}
                <div className="min-w-0">
                  <p className="text-xl font-black leading-none" style={{ color: s.color }}>
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== SERVICES ========== */}
      <section className="px-5 pt-16 pb-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease: easeOut }} className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Our Services</h2>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-muted)' }}>What do you need today?</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {services.map((s, i) => (
            <motion.button key={s.id} onClick={handleGetStarted}
              whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
              className="p-5 rounded-3xl text-left bg-white border border-[var(--border-light)] hover:shadow-lg transition-all group"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, ease: easeOut }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: s.bg }}>
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{s.name}</p>
              <p className="text-xs font-medium mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="px-5 pt-16 pb-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease: easeOut }} className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>How It Works</h2>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-muted)' }}>Get started in 4 simple steps</p>
        </motion.div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-8 bottom-8 w-0.5" style={{ background: 'linear-gradient(to bottom, var(--border), var(--border))' }} />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} className="flex items-center gap-4 relative z-10"
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease: easeOut }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white" style={{ background: s.color }}>
                  <span className="text-xs font-black text-white">{s.step}</span>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-white border border-[var(--border-light)] hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.title}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="px-5 pt-16 pb-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease: easeOut }} className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Why Choose Us</h2>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-muted)' }}>The Boh-Hizmet advantage</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} className="p-6 rounded-3xl bg-white border border-[var(--border-light)] hover:shadow-lg transition-all group text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease: easeOut }}
              whileHover={{ y: -3 }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" style={{ background: f.bg }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{f.title}</p>
              <p className="text-xs font-medium mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="px-5 pt-16 pb-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease: easeOut }} className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>What People Say</h2>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-muted)' }}>Real reviews from our customers</p>
        </motion.div>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} className="p-5 rounded-2xl bg-white border border-[var(--border-light)] hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease: easeOut }}
              whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg)] flex-shrink-0">
                  <img src="/images/c-user.png" alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
                <Quote className="w-5 h-5 ml-auto flex-shrink-0 opacity-30" style={{ color: 'var(--text-muted)' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="px-5 pt-16 pb-8 max-w-lg mx-auto">
        <motion.div className="relative p-10 rounded-3xl overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, #4DD4E0 0%, #2BC5D4 50%, #1BA8B5 100%)' }}
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-5 shadow-lg border border-white/20 bg-white/10 backdrop-blur p-1.5">
            <img src="/images/logo-boh.png" alt="Boh-Hizmet" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-black text-white">Ready to Get Started?</h3>
          <p className="text-sm text-white/60 font-medium mt-2">Join thousands of happy customers</p>
          <motion.button onClick={handleGetStarted} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="mt-6 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl bg-white text-[#2BC5D4]">
            {userProfile ? 'Open Dashboard' : 'Create Free Account'}
          </motion.button>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="px-5 py-10 max-w-lg mx-auto" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md p-1.5 bg-white border border-[var(--border-light)]">
            <img src="/images/logo-boh.png" alt="Boh-Hizmet" className="w-full h-full object-contain" />
          </div>
          <p className="text-lg font-black mt-3" style={{ color: 'var(--text)' }}>Boh-Hizmet</p>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Biz hizmetinizdeyiz</p>
          <div className="flex items-center gap-3 mt-4">
            {['Delivery', 'Shopping', 'Cleaning', 'Moving'].map(s => (
              <span key={s} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: '#2BC5D4', background: '#E8F8FA' }}>{s}</span>
            ))}
          </div>
          <div className="w-full h-px my-5" style={{ background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>2025 Boh-Hizmet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
