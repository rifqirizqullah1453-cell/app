import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#E8F8FA' }}
        >
          <span className="text-3xl font-black" style={{ color: '#2BC5D4' }}>404</span>
        </motion.div>
        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>Page Not Found</h1>
        <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
          The page you are looking for does not exist.
        </p>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border border-[var(--border)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-2xl text-sm font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
          >
            <Home className="w-4 h-4" /> Home
          </motion.button>
        </div>
      </div>
    </div>
  );
}
