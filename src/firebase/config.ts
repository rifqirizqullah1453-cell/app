import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBOHizvCmyrxkEhpXlx1MYRVCXyyz9e8d0",
  authDomain: "boh-hizmet.firebaseapp.com",
  projectId: "boh-hizmet",
  storageBucket: "boh-hizmet.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  databaseURL: "https://boh-hizmet-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
