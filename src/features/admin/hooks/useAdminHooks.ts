import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/shared/lib/firebase';

export function useUploadImage() {
  const [uploading, setUploading] = useState(false);

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
