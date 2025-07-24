// src/utils/checkProfile.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
export const isProfileComplete = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return !!data.username && !!data.bio;
        }
        return false;
    }
    catch (err) {
        console.error('Error checking profile:', err);
        return false;
    }
};
