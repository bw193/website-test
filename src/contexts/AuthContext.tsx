import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const masterAdmin = currentUser.email === 'wubanglun@gmail.com';
        setIsMasterAdmin(masterAdmin);
        
        if (masterAdmin) {
          setIsAdmin(true);
          setIsPending(false);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setIsAdmin(data.status === 'approved');
              setIsPending(data.status === 'pending');
            } else {
              setIsAdmin(false);
              setIsPending(false);
            }
          } catch (err) {
            console.error("Error fetching user role:", err);
            setIsAdmin(false);
            setIsPending(false);
          }
        }
      } else {
        setIsAdmin(false);
        setIsMasterAdmin(false);
        setIsPending(false);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        status: 'pending',
        role: 'employee',
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
