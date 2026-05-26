import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/shared/lib/firebase';

/**
 * Hook to manage media uploads and deletions in Firebase Storage.
 */
export function useUploadImage() {
  const [uploading, setUploading] = useState(false);

  /**
   * Uploads a file target to Firebase Storage and returns its public URL link.
   * Generates a unique UUID file name to avoid collisions.
   */
  const uploadImage = async (file: File, folder: string = 'products') => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${crypto.randomUUID()}.${ext}`;
      const storageRef = ref(storage, `${folder}/${filename}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Deletes an image from Firebase Storage by passing its storage reference URL.
   */
  const deleteImage = async (url: string) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  return { uploadImage, deleteImage, uploading };
}
