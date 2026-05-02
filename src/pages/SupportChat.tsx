import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, ArrowDown, Headphones, ShieldCheck } from 'lucide-react';

interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: number;
}

const SUPPORT_KEY = 'boh_support_chat_v1';

function loadSupportMessages(): Msg[] {
  try {
    const stored = localStorage.getItem(SUPPORT_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveSupportMessages(messages: Msg[]) {
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(messages));
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function SupportChat() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const justSentRef = useRef(false);
  const prevMsgCountRef = useRef(0);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    const refresh = () => {
      setMessages(loadSupportMessages());
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  // Smart auto-scroll
  useEffect(() => {
    if (messages.length === 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    if (prevMsgCountRef.current === 0 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
      prevMsgCountRef.current = messages.length;
      return;
    }

    if (justSentRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      justSentRef.current = false;
      prevMsgCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevMsgCountRef.current) {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (nearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMsgCountRef.current = messages.length;
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollBtn(!nearBottom);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim() || !userProfile) return;
    justSentRef.current = true;
    const msg: Msg = {
      id: 'MSG-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderRole: userProfile.role,
      content: input.trim(),
      timestamp: Date.now(),
    };
    const all = [...loadSupportMessages(), msg];
    saveSupportMessages(all);
    setMessages(all);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto admin reply simulation
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderRole === 'admin') return;
    const timer = setTimeout(() => {
      const replies = [
        'Thank you for reaching out. Our team is reviewing your request.',
        'We have received your message and will get back to you shortly.',
        'Is there anything else I can help you with today?',
        'Please hold on while we check your account details.',
      ];
      const reply: Msg = {
        id: 'MSG-' + Date.now().toString(36),
        senderId: 'admin-support',
        senderName: 'BOH Support',
        senderRole: 'admin',
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now(),
      };
      const all = [...loadSupportMessages(), reply];
      saveSupportMessages(all);
      setMessages(all);
    }, 3000 + Math.random() * 4000);
    return () => clearTimeout(timer);
  }, [messages]);

  if (!userProfile) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div className="w-8 h-8 border-[3px] rounded-full" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const isMe = (msg: Msg) => msg.senderId === userProfile.uid;

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-white card-bg border-b border-[var(--border-light)] border-dark flex items-center gap-3 z-20 shadow-sm">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="p-2 rounded-xl" style={{ background: '#E8F8FA' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border-light)] shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>Live Support</p>
          <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck className="w-3 h-3" /> BOH Admin Team
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: '#E8F8FA' }}>
              <Headphones className="w-6 h-6" style={{ color: '#2BC5D4' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Welcome to Live Support</p>
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>How can we help you today?</p>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMe(msg) ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe(msg) && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-light)] shrink-0 self-start mt-1 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] ${isMe(msg) ? 'items-end' : 'items-start'}`}>
                  <p className="text-[10px] font-bold mb-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>{msg.senderName}</p>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${isMe(msg) ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      background: isMe(msg) ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : 'white',
                      color: isMe(msg) ? 'white' : 'var(--text)',
                      border: isMe(msg) ? 'none' : '1.5px solid var(--border-light)',
                      boxShadow: isMe(msg) ? '0 2px 8px rgba(43,197,212,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] font-medium mt-0.5 ${isMe(msg) ? 'text-right mr-1' : 'ml-1'}`} style={{ color: 'var(--text-muted)' }}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-white card-bg shadow-lg border border-[var(--border-light)] border-dark flex items-center justify-center"
          >
            <ArrowDown className="w-4 h-4" style={{ color: '#2BC5D4' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 bg-white card-bg border-t border-[var(--border-light)] border-dark z-20">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 text-sm font-medium rounded-2xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] outline-none transition-all"
            style={{ background: 'var(--bg)' }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : 'var(--border)',
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
