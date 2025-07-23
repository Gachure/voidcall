// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAjE64WuLw1stdD7UHghJaJ6fd9xdGQmN4",
  authDomain: "voidcall-59675.firebaseapp.com",
  projectId: "voidcall-59675",
  storageBucket: "voidcall-59675.appspot.com",
  messagingSenderId: "22116046546",
  appId: "1:22116046546:web:6dd85c7c110fc16de8bf0b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // ✅ export db
