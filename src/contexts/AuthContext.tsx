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
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
            // Check if this is the bootstrapped admin
            const isAdminUser = user.email === 'aswinjoel04@gmail.com';
            
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              role: isAdminUser ? 'admin' : 'consumer',
              // Admins and Consumers start verified, Farmers need verification later
              isVerified: isAdminUser ? true : true, // Set to true for consumer/admin by default
              createdAt: new Date().toISOString()
            };
          
          // Actually, let's make the role choice explicit in a real setup.
          // For this demo, let's keep it as is but ensure isVerified logic hits correctly if they choose farmer later.
          // I will modify the profile creation to default to consumer, and farmers will be updated via a settings page.
          
          await setDoc(userDocRef, newProfile);
          
          if (isAdminUser) {
            await setDoc(doc(db, 'admins', user.uid), { active: true });
          }
          
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
