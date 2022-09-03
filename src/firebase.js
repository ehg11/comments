
import { ENV } from "./env.js"
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"

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
        await signInWithPopup(auth, googleProvider).user;
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

export async function pushCards(cards) {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
        return;
    }
    try {
        await setDoc(doc(db, "cards", uid), {cards: cards});
    }
    catch (error) {
        console.log(error);
    }
}

export async function pullCards(uid) {
    const cardSnapshot = await getDoc(doc(db, "cards", uid));
    if (cardSnapshot.exists()) {
        return cardSnapshot.data().cards;
    }
    else {
        // console.log("no data");
        return null;
    }
}

export async function pushPrefs(prefs) {
    const uid = auth?.currentUser?.uid;
    console.log(`pushing to ${uid}`);
    if (!uid) {
        return;
    }
    try {
        await setDoc(doc(db, "prefs", uid), {prefs: prefs});
    }
    catch (error) {
        console.log(error);
    }
}

export async function pullPrefs(uid) {
    console.log("getting preferences");
    const prefSnapshot = await getDoc(doc(db, "prefs", uid));
    if (prefSnapshot.exists()) {
        console.log("preferences pulled: ", prefSnapshot.data().prefs);
        return prefSnapshot.data().prefs;
    }
    else {
        console.log("no preferences found");
        return null;
    }
}
