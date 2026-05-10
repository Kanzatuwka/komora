import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/shared/lib/firebase';
import { useToast } from '@/shared/contexts/ToastContext';

export function useAuthActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const redirectAfterLogin = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectAfterLogin();
      showToast({ message: 'Вітаємо з поверненням!', type: 'success' });
    } catch (err) {
      console.error(err);
      throw new Error('Невірний email або пароль');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Якщо це новий користувач — створити документ у /users
      const userRef = doc(db, 'users', result.user.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        const isAdmin = result.user.email === 'olexandr.prykhodko@gmail.com';
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName || '',
          phone: '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: serverTimestamp(),
        });
      } else {
        // Ensure admin role for this specific email if document already exists
        if (result.user.email === 'olexandr.prykhodko@gmail.com') {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
        }
      }
      
      redirectAfterLogin();
      showToast({ message: 'Успішний вхід через Google', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: 'Помилка входу через Google', type: 'error' });
    }
  };

  const register = async ({ name, email, password }: any) => {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        phone: '',
        role: 'user',
        createdAt: serverTimestamp(),
      });
      
      navigate('/', { replace: true });
      showToast({ message: 'Вітаємо в Коморі!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Цей email вже використовується');
      }
      throw new Error('Помилка реєстрації. Спробуйте ще раз.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      showToast({ message: 'Ви вийшли з акаунта', type: 'info' });
    } catch (err) {
      console.error(err);
    }
  };

  return { loginWithEmail, loginWithGoogle, register, logout };
}
