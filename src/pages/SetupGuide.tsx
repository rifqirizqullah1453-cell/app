import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Globe, Server, Database, Shield, Smartphone, FileText } from 'lucide-react';

export default function SetupGuide() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Globe,
      color: '#2BC5D4',
      bg: '#E8F8FA',
      title: '1. Buy a Domain',
      desc: 'Purchase your domain (e.g., boh-hizmet.com) from Namecheap, Cloudflare, or Niagahoster.',
    },
    {
      icon: Server,
      color: '#10B981',
      bg: '#ECFDF5',
      title: '2. Deploy to Vercel (FREE)',
      desc: 'Sign up at vercel.com, import your GitHub repo, and deploy. Add your domain in project settings.',
    },
    {
      icon: Database,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      title: '3. Connect Database',
      desc: 'Use TiDB Cloud (free tier) or PlanetScale. Copy the DATABASE_URL to your Vercel env vars.',
    },
    {
      icon: Shield,
      color: '#F59E0B',
      bg: '#FFFBEB',
      title: '4. Setup OAuth',
      desc: 'Go to Kimi Developer Portal, create app, copy APP_ID and APP_SECRET to env vars.',
    },
    {
      icon: Smartphone,
      color: '#EC4899',
      bg: '#FDF2F8',
      title: '5. PWA Install',
      desc: 'Users can add to home screen. Enable the VitePWA plugin in vite.config.ts.',
    },
    {
      icon: FileText,
      color: '#6366F1',
      bg: '#EEF2FF',
      title: '6. Environment Variables',
      desc: 'Set these in Vercel: DATABASE_URL, VITE_APP_ID, VITE_KIMI_AUTH_URL, APP_SECRET, OWNER_UNION_ID.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-[var(--border-light)] flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="p-2 rounded-xl" style={{ background: '#E8F8FA' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>
        <h1 className="text-lg font-black" style={{ color: 'var(--text)' }}>Setup Guide</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto pb-8">
        <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
          Follow these steps to deploy Boh-Hizmet to your own domain.
        </p>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white card-bg border border-[var(--border-light)] border-dark"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: step.bg }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{step.title}</h3>
                  <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-5 rounded-2xl text-center"
          style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
        >
          <p className="text-sm font-bold text-white">
            Need help? Contact support at boh-hizmet@example.com
          </p>
        </motion.div>
      </div>
    </div>
  );
}
