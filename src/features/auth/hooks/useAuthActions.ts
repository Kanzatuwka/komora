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

  /**
   * Helper to redirect user to their original route or home page after login.
   */
  const redirectAfterLogin = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  /**
   * Handles user sign-in using email and password.
   */
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

  /**
   * Handles user sign-in via Google OAuth popup.
   */
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      redirectAfterLogin();
      showToast({ message: t('auth:login.googleSuccessToast'), type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: t('auth:login.errorGeneric'), type: 'error' });
    }
  };

  /**
   * Registers a new user with their email coordinates and stores customized user profiles in Firestore.
   */
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

  /**
   * Logs out the current user and redirects to home page.
   */
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
