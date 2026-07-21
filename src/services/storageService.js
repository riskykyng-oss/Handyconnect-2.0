import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload a file to Firebase Storage and return the URL
export const uploadFile = async (file, path) => {
  // Create a reference to 'path/file.name' (e.g., 'avatars/uid/photo.jpg')
  const storageRef = ref(storage, `${path}/${file.name}`);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};