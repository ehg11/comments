
import { ENV } from "./env.js"
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, query, getDocs, collection, where, addDoc} from "firebase/firestore"

const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: "custom-comments-e5724.firebaseapp.com",
  projectId: "custom-comments-e5724",
  storageBucket: "custom-comments-e5724.appspot.com",
  messagingSenderId: "674298953405",
  appId: "1:674298953405:web:9fc89eb3ae281871ad01d4",
  measurementId: "G-YJXGQPKHEX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export async function googleSignIn() {
    try {
        const user = await signInWithPopup(auth, googleProvider).user;
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email
            });
        }
        return true;
    } 
    catch (error) {
        console.log(error);
        return false;
    }
}

export function logout() {
    signOut(auth);
}