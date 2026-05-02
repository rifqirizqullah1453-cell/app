import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { trpc } from '@/providers/trpc';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: number;
  isMe: boolean;
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

const ChatContext = createContext<ReturnType<typeof useChatData> | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}

function useChatData() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<Msg[]>(loadSupportMessages);

  // Poll for order messages
  const orderMessagesQuery = trpc.order.messages.useQuery(
    { orderId: activeOrderId || '' },
    { enabled: !!activeOrderId, refetchInterval: 2000 }
  );

  const sendMessageMutation = trpc.order.sendMessage.useMutation({
    onSuccess: () => {
      if (activeOrderId) {
        // Invalidate will trigger refetch
      }
    },
  });

  // Transform server messages to client format
  const orderMessages: Msg[] = (orderMessagesQuery.data || []).map(m => ({
    id: String(m.id),
    senderId: String(m.senderId),
    senderName: m.sender?.name || 'Unknown',
    senderRole: m.sender?.role || 'user',
    content: m.content,
    timestamp: new Date(m.createdAt).getTime(),
    isMe: m.senderId === userProfile?.uid,
  }));

  const sendOrderMessage = useCallback(async (orderId: string, content: string) => {
    await sendMessageMutation.mutateAsync({ orderId, content });
  }, [sendMessageMutation]);

  const sendSupportMessage = useCallback((content: string) => {
    if (!userProfile) return;
    const msg: Msg = {
      id: 'MSG-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderRole: userProfile.role,
      content,
      timestamp: Date.now(),
      isMe: true,
    };
    const updated = [...supportMessages, msg];
    setSupportMessages(updated);
    saveSupportMessages(updated);

    // Auto admin reply
    setTimeout(() => {
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
        isMe: false,
      };
      const all = [...loadSupportMessages(), reply];
      setSupportMessages(all);
      saveSupportMessages(all);
    }, 3000 + Math.random() * 4000);
  }, [userProfile, supportMessages]);

  return {
    orderMessages,
    supportMessages,
    sendOrderMessage,
    sendSupportMessage,
    activeOrderId,
    setActiveOrderId,
    isLoading: orderMessagesQuery.isLoading,
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const data = useChatData();
  return <ChatContext.Provider value={data}>{children}</ChatContext.Provider>;
}
