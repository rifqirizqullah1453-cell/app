import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/i18n';

const languages = ['en', 'tr', 'id'];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language?.split('-')[0] || 'en';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('boh_language', lang);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-[var(--border-light)] dark:border-[#1E3D42] bg-white dark:bg-[#152B2F]"
        style={{ color: 'var(--text-muted)' }}
      >
        <Globe className="w-3.5 h-3.5" />
        {LANGUAGE_FLAGS[currentLang] || 'EN'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 z-[100] min-w-[160px] rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42] shadow-xl overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold transition-colors ${
                  currentLang === lang
                    ? 'bg-[#E8F8FA] dark:bg-[#1A353A] text-[#2BC5D4]'
                    : 'text-[var(--text)] hover:bg-[var(--bg)]'
                }`}
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border border-[var(--border)] dark:border-[#1E3D42]">
                  {LANGUAGE_FLAGS[lang]}
                </span>
                {LANGUAGE_NAMES[lang]}
                {currentLang === lang && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#2BC5D4' }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
