import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | null;
  profile: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  profile: null, 
  loading: true,
  logout: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => signOut(auth);

  useEffect(() => {
    let profileUnsub: () => void = () => {};

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      profileUnsub(); // Clean up existing profile listener

      if (firebaseUser) {
        setUser(firebaseUser);
        // Start listening to the user profile document
        profileUnsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role as 'user' | 'admin');
            setProfile(data);
          } else {
            // Profile doesn't exist yet, but user is logged in
            setRole('user');
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error listening to profile:', err);
          setRole('user');
          setProfile(null);
          setLoading(false);
        });
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
