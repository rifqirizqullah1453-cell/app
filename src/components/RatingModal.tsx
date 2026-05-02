import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  title: string;
  subtitle: string;
}

export default function RatingModal({ isOpen, onClose, onSubmit, title, subtitle }: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = () => {
    onSubmit(rating, review);
    setRating(5);
    setReview('');
    onClose();
  };

  const labels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 mb-4 md:mb-0 bg-white rounded-3xl p-6 shadow-2xl"
          >
            {/* Drag handle */}
            <div className="w-12 h-1 rounded-full bg-gray-300 mx-auto mb-4" />

            <div className="text-center mb-6">
              <h3 className="text-lg font-black" style={{ color: 'var(--text)' }}>{title}</h3>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1"
                >
                  <Star
                    className="w-9 h-9 transition-all"
                    fill={star <= (hoveredStar || rating) ? '#F59E0B' : 'transparent'}
                    stroke={star <= (hoveredStar || rating) ? '#F59E0B' : '#CBD5E1'}
                    strokeWidth={2}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm font-bold mb-4" style={{ color: '#F59E0B' }}>
              {labels[(hoveredStar || rating) - 1]}
            </p>

            {/* Review textarea */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience... (optional)"
              rows={3}
              className="w-full px-4 py-3 text-sm font-medium resize-none outline-none rounded-2xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] transition-all bg-white mb-4"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold border-[1.5px] border-[var(--border)] bg-white"
                style={{ color: 'var(--text-secondary)' }}
              >
                Skip
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-[2] py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
              >
                <Send className="w-4 h-4" /> Submit Review
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
