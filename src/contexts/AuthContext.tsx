import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { trpc } from '@/providers/trpc';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  userProfile: UserProfile | null;
  allUsers: UserProfile[];
  isLoading: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  isCustomer: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, role: UserRole, extra?: Partial<UserProfile>) => Promise<void>;
  signOut: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

const SESSION_KEY = 'boh_session';

function loadSession(): UserProfile | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function saveSession(profile: UserProfile | null) {
  try {
    if (profile) localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const utils = trpc.useUtils();

  // tRPC auth
  const { data: serverUser, isLoading: serverLoading } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setUserProfile(null);
      saveSession(null);
      utils.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // After registration, auto-login by setting token cookie
      if (data.token) {
        document.cookie = `kimi_sid=${data.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
        const mapped: UserProfile = {
          uid: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as UserRole,
          phone: data.user.phone || '',
          rating: 5.0,
          totalRatings: 0,
          isOnline: true,
          createdAt: Date.now(),
        };
        setUserProfile(mapped);
        saveSession(mapped);
        utils.invalidate();
      }
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      const mapped: UserProfile = {
        uid: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as UserRole,
        phone: data.user.phone || '',
        rating: 5.0,
        totalRatings: 0,
        isOnline: true,
        createdAt: Date.now(),
      };
      setUserProfile(mapped);
      saveSession(mapped);
      utils.invalidate();
    },
  });

  const isAdmin = userProfile?.role === 'admin';
  const isWorker = userProfile?.role === 'worker';
  const isCustomer = userProfile?.role === 'customer';

  // Load local session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUserProfile(session);
    }
    setIsLoading(false);
  }, []);

  // Sync server user to local state
  useEffect(() => {
    if (serverUser) {
      const mapped: UserProfile = {
        uid: String(serverUser.id),
        name: serverUser.name || 'User',
        email: serverUser.email || '',
        role: (serverUser.role === 'admin' ? 'admin' : serverUser.role === 'worker' ? 'worker' : 'customer') as UserRole,
        phone: serverUser.phone || '',
        rating: parseFloat(serverUser.rating || '5.0'),
        totalRatings: serverUser.totalRatings || 0,
        isOnline: serverUser.isOnline || false,
        createdAt: serverUser.createdAt ? new Date(serverUser.createdAt).getTime() : Date.now(),
      };
      setUserProfile(mapped);
      saveSession(mapped);
    }
  }, [serverUser]);

  // Email/password login via backend
  const signIn = useCallback(async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  }, [loginMutation]);

  // Kimi OAuth login — redirect to Kimi OAuth page
  const signInWithGoogle = useCallback(async () => {
    // Redirect to Kimi OAuth for real authentication
    window.location.href = getOAuthUrl();
  }, []);

  // Register via backend
  const signUp = useCallback(async (email: string, password: string, name: string, phone: string, role: UserRole, extra?: Partial<UserProfile>) => {
    await registerMutation.mutateAsync({
      name,
      email,
      password,
      phone,
      role: role as 'customer' | 'worker',
    });
  }, [registerMutation]);

  const signOut = useCallback(() => {
    logoutMutation.mutate();
    setUserProfile(null);
    saveSession(null);
  }, [logoutMutation]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      saveSession(updated);
      return updated;
    });
  }, []);

  // tRPC users list for admin
  const { data: serverUsers } = trpc.auth.listUsers.useQuery(undefined, {
    enabled: isAdmin,
  });

  const allUsers: UserProfile[] = serverUsers?.map(u => ({
    uid: String(u.id),
    name: u.name || '',
    email: u.email || '',
    role: (u.role === 'admin' ? 'admin' : u.role === 'worker' ? 'worker' : 'customer') as UserRole,
    phone: u.phone || '',
    rating: parseFloat(u.rating || '5.0'),
    totalRatings: u.totalRatings || 0,
    isOnline: u.isOnline || false,
    createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
  })) || [];

  const value: AuthContextType = {
    userProfile,
    allUsers,
    isLoading: isLoading || serverLoading || registerMutation.isPending || loginMutation.isPending,
    isAdmin,
    isWorker,
    isCustomer,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
