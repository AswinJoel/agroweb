import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  role: 'farmer' | 'consumer' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (intendedRole?: 'farmer' | 'consumer') => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      try {
        setUser(authenticatedUser);
        if (authenticatedUser) {
          console.log("AuthProvider: User authenticated, fetching profile for:", authenticatedUser.uid);
          const userDocRef = doc(db, 'users', authenticatedUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              console.log("AuthProvider: Profile loaded:", data.role);
              setProfile(data);
            } else {
              console.log("AuthProvider: No profile found in Firestore for UID:", authenticatedUser.uid);
              setProfile(null);
            }
          } catch (getErr: any) {
            const isOffline = !navigator.onLine || getErr.code === 'unavailable' || getErr.message?.includes('offline');
            if (isOffline) {
              console.warn("AuthProvider: Offline - Profile fetch impossible right now.");
            } else {
              console.warn("AuthProvider: Profile fetch deferred or denied. Likely permission error or network.", getErr);
            }
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (intendedRole: 'farmer' | 'consumer' = 'consumer'): Promise<UserProfile> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const isAdminUser = user.email === 'aswinjoel04@gmail.com';
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: isAdminUser ? 'admin' : intendedRole,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        
        if (isAdminUser) {
          await setDoc(doc(db, 'admins', user.uid), { active: true });
        }
        
        setProfile(newProfile);
        return newProfile;
      } else {
        const existingProfile = userDoc.data() as UserProfile;
        setProfile(existingProfile);
        return existingProfile;
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Auth: A previous login request was already in progress.");
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
