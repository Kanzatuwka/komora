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
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export function useAuthActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { t } = useTranslation(['auth', 'common']);
  const { language: currentLanguage } = useLanguage();

  const redirectAfterLogin = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectAfterLogin();
      showToast({ message: t('auth:login.successToast'), type: 'success' });
    } catch (err) {
      console.error(err);
      throw new Error(t('auth:login.errorInvalid'));
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
        const defaultCurrency = currentLanguage === 'en' ? 'USD' : currentLanguage === 'de' ? 'EUR' : 'UAH';
        
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName || '',
          phone: '',
          role: isAdmin ? 'admin' : 'user',
          language: currentLanguage,
          preferredCurrency: defaultCurrency,
          createdAt: serverTimestamp(),
        });
      } else {
        // Ensure admin role for this specific email if document already exists
        if (result.user.email === 'olexandr.prykhodko@gmail.com') {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
        }
      }
      
      redirectAfterLogin();
      showToast({ message: t('auth:login.googleSuccessToast'), type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: t('auth:login.errorGeneric'), type: 'error' });
    }
  };

  const register = async ({ name, email, password, language }: any) => {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const regLang = language || currentLanguage;
      const defaultCurrency = regLang === 'en' ? 'USD' : regLang === 'de' ? 'EUR' : 'UAH';

      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        phone: '',
        role: 'user',
        language: regLang,
        preferredCurrency: defaultCurrency,
        createdAt: serverTimestamp(),
      });
      
      navigate('/', { replace: true });
      showToast({ message: t('auth:register.welcomeToast'), type: 'success' });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error(t('auth:register.errorEmailInUse'));
      }
      throw new Error(t('auth:register.errorGeneric'));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      showToast({ message: t('auth:logout.successToast'), type: 'info' });
    } catch (err) {
      console.error(err);
    }
  };

  return { loginWithEmail, loginWithGoogle, register, logout };
}
