import { motion } from 'framer-motion';

export function PixelLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="pc p-4"
          style={{ border: '3px solid var(--border)', boxShadow: 'none' }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-lg"
              style={{ background: 'var(--border)' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
            <div className="flex-1 space-y-2">
              <motion.div
                className="h-3 rounded"
                style={{ background: 'var(--border)', width: '60%' }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
              <motion.div
                className="h-2.5 rounded"
                style={{ background: 'var(--border)', width: '40%' }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 + 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PixelSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 32, md: 48, lg: 64 }[size];
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="border-4 rounded-full"
        style={{
          width: s,
          height: s,
          borderColor: 'var(--border)',
          borderTopColor: 'var(--purple)',
        }}
      />
    </div>
  );
}

export function PixelPulse({ text = 'Memuat...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: 'var(--purple)', border: '2px solid var(--bg-dark)' }}
            animate={{ y: [0, -10, 0], scaleY: [1, 0.6, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <p className="font-pixel text-[7px]" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  );
}
