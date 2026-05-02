import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useOrders } from '@/contexts/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Phone, MapPin, ArrowDown } from 'lucide-react';

interface Msg {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: number;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function isSameDay(a: number, b: number) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatRoom() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { getMessages, sendMessage } = useChat();
  const { orders } = useOrders();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const justSentRef = useRef(false);
  const prevMsgCountRef = useRef(0);
  const order = orders.find((o) => o.id === orderId);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!orderId) return;
    const refresh = () => {
      const msgs = getMessages(orderId);
      setMessages(msgs);
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [orderId, getMessages]);

  // Smart auto-scroll: only scroll on FIRST load or when USER sent a message
  useEffect(() => {
    if (messages.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // First load (0 → some messages)
    if (prevMsgCountRef.current === 0 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
      prevMsgCountRef.current = messages.length;
      return;
    }

    // User just sent a message → always scroll to bottom
    if (justSentRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      justSentRef.current = false;
      prevMsgCountRef.current = messages.length;
      return;
    }

    // New message from OTHER person: only scroll if user is already near bottom
    if (messages.length > prevMsgCountRef.current) {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (nearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // Track scroll position to show/hide "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollBtn(!nearBottom);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!order || !userProfile || !orderId) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div className="w-8 h-8 border-[3px] rounded-full" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const isCustomer = userProfile.role === 'customer';
  const otherName = isCustomer ? (order.workerName || 'Pekerja') : (order.customerName || 'Customer');
  const otherPhone = isCustomer ? order.workerPhone : order.customerPhone;

  const handleSend = () => {
    if (!input.trim()) return;
    justSentRef.current = true;
    sendMessage(orderId, input, userProfile.uid, userProfile.name, userProfile.role);
    setInput('');
    setMessages(getMessages(orderId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages: consecutive same sender = no avatar, same day = no date separator
  const groupedMessages: Array<{ type: 'date'; date: string } | { type: 'msg'; msg: Msg; showAvatar: boolean; showName: boolean }> = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const showDate = i === 0 || !isSameDay(prev.timestamp, msg.timestamp);
    const showAvatar = i === 0 || prev.senderId !== msg.senderId || showDate;
    const showName = showAvatar && msg.senderId !== userProfile.uid;

    if (showDate) {
      groupedMessages.push({ type: 'date', date: formatDate(msg.timestamp) });
    }
    groupedMessages.push({ type: 'msg', msg, showAvatar, showName });
  });

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* ===== STICKY HEADER ===== */}
      <div className="shrink-0 px-4 py-3 bg-white card-bg border-b border-[var(--border-light)] border-dark flex items-center gap-3 z-20 shadow-sm">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="p-2 rounded-xl" style={{ background: '#E8F8FA' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border-light)] shrink-0">
          <img src={isCustomer ? '/images/c-worker.png' : '/images/c-user.png'} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{otherName}</p>
          <p className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-3 h-3" />
            {order.pickupAddress}
          </p>
        </div>
        {otherPhone && (
          <motion.a href={`tel:${otherPhone}`} whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
            <Phone className="w-4 h-4 text-white" />
          </motion.a>
        )}
      </div>

      {/* ===== MESSAGES AREA ===== */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 relative"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: '#E8F8FA' }}>
              <Send className="w-6 h-6" style={{ color: '#2BC5D4' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Start a conversation</p>
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Send a message to {otherName}</p>
          </div>
        )}

        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {groupedMessages.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="flex items-center justify-center py-3">
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {item.date}
                    </div>
                  </div>
                );
              }

              const { msg, showAvatar, showName } = item;
              const isMe = msg.senderId === userProfile.uid;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {showAvatar && !isMe ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-light)] shrink-0 self-start mt-1">
                      <img src={msg.senderRole === 'worker' ? '/images/c-worker.png' : '/images/c-user.png'} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    !isMe && <div className="w-8 shrink-0" />
                  )}

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <p className="text-[10px] font-bold mb-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>{msg.senderName}</p>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      style={{
                        background: isMe ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : 'var(--bg-card)',
                        color: isMe ? 'white' : 'var(--text)',
                        border: isMe ? 'none' : '1.5px solid var(--border)',
                        boxShadow: isMe ? '0 2px 8px rgba(43,197,212,0.25)' : 'var(--shadow-sm)',
                      }}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[10px] font-medium mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`} style={{ color: 'var(--text-muted)' }}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Invisible anchor for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== FLOATING SCROLL-TO-BOTTOM BUTTON ===== */}
      <AnimatePresence>
        {showScrollBtn && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-white card-bg shadow-lg border border-[var(--border-light)] flex items-center justify-center"
          >
            <ArrowDown className="w-4 h-4" style={{ color: '#2BC5D4' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== INPUT AREA ===== */}
      <div className="shrink-0 px-4 py-3 bg-white card-bg border-t border-[var(--border-light)] border-dark z-20">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
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
