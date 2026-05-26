import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

/**
 * Params for creating system or administrative notifications.
 */
interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'order' | 'subscriber' | 'system';
  link?: string;
}

/**
 * Hook providing capabilities to generate real-time notifications inside the admin panel.
 */
export function useNotifications() {
  const createNotification = async ({ title, message, type, link }: CreateNotificationParams) => {
    try {
      console.log('Creating notification:', { title, type });
      const docRef = await addDoc(collection(db, 'notifications'), {
        title,
        message,
        type,
        ...(link && { link }),
        read: false,
        createdAt: serverTimestamp()
      });
      console.log('Notification created with ID:', docRef.id);
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  return { createNotification };
}
