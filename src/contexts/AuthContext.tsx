import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  role: string | null;
  isPending: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_EMAIL = 'wubanglun@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with a timeout to prevent infinite loading if URL is invalid
    const fetchSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Supabase getSession timeout")), 10000)
        );
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        handleUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
        handleUser(null); // Fallback to unauthenticated state
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (currentUser: User | null) => {
    setUser(currentUser);
    
    if (currentUser) {
      const masterAdmin = currentUser.email === MASTER_ADMIN_EMAIL;
      setIsMasterAdmin(masterAdmin);
      
      if (masterAdmin) {
        setIsAdmin(true);
        setRole('admin');
        setIsPending(false);
      } else {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setIsAdmin(false);
            setRole(null);
            setIsPending(true); // Default to pending if error
            setLoading(false);
            return;
          }

          if (profile) {
            setIsAdmin(profile.role === 'admin' || profile.role === 'employee');
            setRole(profile.role);
            setIsPending(profile.role === 'pending');
          } else {
            setIsAdmin(false);
            setRole(null);
            setIsPending(true);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setIsAdmin(false);
          setRole(null);
          setIsPending(true);
        }
      }
    } else {
      setIsAdmin(false);
      setIsMasterAdmin(false);
      setRole(null);
      setIsPending(false);
    }
    
    setLoading(false);
  };

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/admin'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
      });
      if (error) throw error;

      if (data.user) {
        // Create profile entry
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role: 'pending'
        });
        // Ignore duplicate key error (23505) in case a Postgres trigger already created the profile
        if (profileError && profileError.code !== '23505') {
          console.error("Profile creation error:", profileError);
        }
        
        // Sign out immediately after registration so they don't stay logged in as a pending user
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isMasterAdmin, role, isPending, loading, login, logout, loginWithEmail, registerWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
