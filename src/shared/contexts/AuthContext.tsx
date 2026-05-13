import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

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

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      profileUnsub(); // Clean up existing profile listener

      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          
          if (!snap.exists()) {
            const isAdminEmail = firebaseUser.email === 'olexandr.prykhodko@gmail.com';
            let lang = 'uk';
            try {
              const saved = localStorage.getItem('i18nextLng');
              if (saved) lang = saved.split('-')[0];
            } catch (e) {}
            if (!['uk', 'en', 'de'].includes(lang)) lang = 'uk';
            
            const defaultCurrency = lang === 'en' ? 'USD' : lang === 'de' ? 'EUR' : 'UAH';

            await setDoc(userRef, {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email || 'Користувач',
              phone: '',
              role: isAdminEmail ? 'admin' : 'user',
              language: lang,
              preferredCurrency: defaultCurrency,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          // Start listening to the user profile document
          profileUnsub = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setRole(data.role as 'user' | 'admin');
              setProfile(data);
              setLoading(false);
            } else {
              // This case shouldn't really happen now due to the setDoc above,
              // but if it's deleted while the app is running:
              setRole('user');
              setProfile(null);
              setLoading(false);
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            setLoading(false);
          });

        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        }
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
