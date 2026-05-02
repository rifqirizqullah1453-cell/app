import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';
import { useChat } from './ChatContext';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

interface Notification {
  id: string;
  type: 'order' | 'message' | 'status' | 'payment' | 'emergency';
  title: string;
  body: string;
  orderId?: string;
  timestamp: number;
  read: boolean;
}

const NOTIF_KEY = 'boh_notifications_v1';

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function loadNotifs(): Notification[] {
  try {
    const s = safeGetItem(NOTIF_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}
function saveNotifs(n: Notification[]) {
  try { safeSetItem(NOTIF_KEY, JSON.stringify(n)); } catch {}
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be within NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { orders } = useOrders();
  const { getMessages } = useChat();
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifs());
  const prevOrdersRef = useRef<string>('');
  const prevMsgsRef = useRef<string>('');

  useEffect(() => {
    if (!userProfile) return;

    try {
      const searchingOrders = orders.filter(o => o.status === 'searching_worker');
      const orderSig = searchingOrders.map(o => o.id + o.status).join(',');
      if (prevOrdersRef.current && prevOrdersRef.current !== orderSig && searchingOrders.length > 0) {
        toast(`${searchingOrders.length} new order available!`, 'info');
      }
      prevOrdersRef.current = orderSig;

      const myOrderIds = orders.map(o => o.id);
      let newMsgs = 0;
      myOrderIds.forEach(oid => {
        try {
          const msgs = getMessages(oid);
          const unread = msgs.filter(m => m.senderId !== userProfile.uid && Date.now() - m.timestamp < 60000);
          newMsgs += unread.length;
        } catch {}
      });
      const msgSig = String(newMsgs);
      if (prevMsgsRef.current && prevMsgsRef.current !== msgSig && newMsgs > 0) {
        toast(`${newMsgs} new message${newMsgs > 1 ? 's' : ''}`, 'info');
      }
      prevMsgsRef.current = msgSig;

      orders.forEach(o => {
        if (o.status === 'completed' && !o.customerRating && userProfile.role === 'customer') {
          toast('Order completed! Please rate your experience.', 'success');
        }
        if (o.emergencyAlert && Date.now() - o.emergencyAlert.timestamp < 30000) {
          toast(`EMERGENCY: ${o.emergencyAlert.message}`, 'error');
        }
      });
    } catch (err) {
      console.log('Notification error:', err);
    }
  }, [orders, userProfile, toast, getMessages]);

  const markAsRead = (id: string) => {
    const n = notifications.map(x => x.id === id ? { ...x, read: true } : x);
    setNotifications(n);
    saveNotifs(n);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifs([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}