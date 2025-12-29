import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { submitRatingFirestore, getHostStatsFirestore } from '../firebase/ratings';

// ✅ Align with your existing app roles
export type UserRole = 'HOST' | 'RIDER';

type AuthState = {
  isReady: boolean;
  user: null | { id: string; name?: string };
  role: UserRole | null;
  setRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

export type Country = { code: string; name: string; currency: string; flag?: string } | null;

type AuthExtras = {
  country: Country;
  setCountry: (c: Country) => void;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  submitRating: (hostId: string, rating: number) => Promise<void>;
  getHostStats: (hostId: string) => { avg: number; count: number };
  fetchHostStats: (hostId: string) => Promise<{ avg: number; count: number; items?: any[] }>;
};

type Profile = { name?: string; photo?: string; email?: string; bankAccount?: string } | null;

type AuthExtras2 = {
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const AuthContext = createContext<(AuthState & Partial<AuthExtras> & Partial<AuthExtras2>) | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<AuthState['user']>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [country, setCountryState] = useState<Country>(null);
  const [profile, setProfileState] = useState<Profile>(null);
  const [ratings, setRatings] = useState<Record<string, number[]>>({});

  useEffect(() => {
    // Later: restore auth + role from storage/Firebase.
    // For now, we just mark the app as ready.
    const t = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const signOut = async () => {
    setUser(null);
    setRoleState(null);
  };

  const setCountry = (c: Country) => setCountryState(c);

  const setProfile = (p: Profile) => setProfileState(p);

  const submitRating = async (hostId: string, rating: number) => {
    try {
      await submitRatingFirestore({ hostId, rating });
      setRatings((prev) => {
        const arr = prev[hostId] ? [...prev[hostId], rating] : [rating];
        return { ...prev, [hostId]: arr };
      });
    } catch (err) {
      // fallback to local-only if Firestore fails
      setRatings((prev) => {
        const arr = prev[hostId] ? [...prev[hostId], rating] : [rating];
        return { ...prev, [hostId]: arr };
      });
    }
  };

  const getHostStats = (hostId: string) => {
    const arr = ratings[hostId] || [];
    const count = arr.length;
    const avg = count ? arr.reduce((s, v) => s + v, 0) / count : 0;
    return { avg, count };
  };

  const fetchHostStats = async (hostId: string) => {
    try {
      const stats = await getHostStatsFirestore(hostId);
      // update local ratings cache with fetched items
      if (stats?.items) {
        setRatings((prev) => ({ ...prev, [hostId]: stats.items.map((i: any) => i.rating || 0) }));
      }
      return { avg: stats.avg, count: stats.count, items: stats.items };
    } catch (err) {
      return { avg: 0, count: 0, items: [] };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    // Mock sign in — in real app use OAuth. We set a simple user object.
    setUser({ id: provider + '_user', name: provider === 'apple' ? 'Apple User' : 'Google User' });
  };

  const value = useMemo(
    () => ({ isReady, user, role, setRole, signOut, country, setCountry, signInWithProvider, submitRating, getHostStats, fetchHostStats, profile, setProfile }),
    [isReady, user, role, country, ratings, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
