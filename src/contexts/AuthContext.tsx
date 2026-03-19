import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
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
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user ?? null);
    });

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
            setIsPending(true); // Default to pending if error
            setLoading(false);
            return;
          }

          if (profile) {
            setIsAdmin(profile.role === 'admin' || profile.role === 'employee');
            setIsPending(profile.role === 'pending');
          } else {
            setIsAdmin(false);
            setIsPending(true);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setIsAdmin(false);
          setIsPending(true);
        }
      }
    } else {
      setIsAdmin(false);
      setIsMasterAdmin(false);
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
    // Hardcoded Master Admin Bypass
    const isMaster = (email === 'wubanglun@gmail.com' || email === 'wubanglun@163.com') && pass === '12345678';
    
    if (isMaster) {
      console.log("Master Admin Bypass Activated for:", email);
      setUser({ 
        id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        email: email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User);
      setIsAdmin(true);
      setIsMasterAdmin(true);
      setIsPending(false);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    // Hardcoded Master Admin Bypass for Registration
    const isMaster = (email === 'wubanglun@gmail.com' || email === 'wubanglun@163.com') && pass === '12345678';
    
    if (isMaster) {
      console.log("Master Admin Registration Bypass Activated for:", email);
      setUser({ 
        id: '00000000-0000-0000-0000-000000000000', 
        email: email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User);
      setIsAdmin(true);
      setIsMasterAdmin(true);
      setIsPending(false);
      setLoading(false);
      return;
    }

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
        if (profileError) throw profileError;
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
    <AuthContext.Provider value={{ user, isAdmin, isMasterAdmin, isPending, loading, login, logout, loginWithEmail, registerWithEmail }}>
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
