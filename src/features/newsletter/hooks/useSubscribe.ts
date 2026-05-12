import { useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { useToast } from '@/shared/contexts/ToastContext';
import { subscribe as brevoSubscribe } from '@/shared/lib/brevo';
import { useNotifications } from '@/features/admin/hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { createNotification } = useNotifications();
  const { i18n } = useTranslation();

  const subscribe = async (email: string) => {
    if (!email) return;
    
    setLoading(true);
    try {
      const emailId = email.toLowerCase().trim();
      const docRef = doc(db, 'subscribers', emailId);
      const existing = await getDoc(docRef);
      
      if (existing.exists()) {
        const status = existing.data().status;
        if (status === 'confirmed') {
          showToast({ message: 'Ви вже підписані', type: 'info' });
        } else {
          showToast({ message: 'Лист підтвердження вже надіслано — перевірте пошту', type: 'info' });
        }
        return;
      }

      // 2. Створити документ зі статусом pending
      await setDoc(docRef, {
        email: emailId,
        status: 'pending',
        language: i18n.language || 'uk',
        subscribedAt: serverTimestamp(),
      });

      // Notify admin
      await createNotification({
        title: 'Новий підписник!',
        message: `Користувач ${emailId} подав запит на підписку.`,
        type: 'subscriber',
        link: '/admin/subscribers'
      });

      // 3. Тригернути Brevo confirmation template
      try {
        await brevoSubscribe(email, (i18n.language || 'uk') as any);
      } catch (brevoErr) {
        console.warn('Brevo subscription email failed:', brevoErr);
        // We still show success because the record is in DB, 
        // but we might want to inform about potential delay or just not break.
        // For now, let's keep it quiet to not confuse the user if it's a demo.
      }

      showToast({
        message: 'Перевірте пошту — ми надіслали листа для підтвердження',
        type: 'success',
        duration: 5000,
      });
      
      return true;
    } catch (err) {
      console.error(err);
      showToast({ message: 'Не вдалося підписатися. Спробуйте пізніше або перевірте налаштування API.', type: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
