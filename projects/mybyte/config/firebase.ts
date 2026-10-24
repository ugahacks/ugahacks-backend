// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5AzDY-mtx31NwF8Ckj1DiTG9A07dieYQ",
  authDomain: "ugahacks-core-infra.firebaseapp.com",
  projectId: "ugahacks-core-infra",
  storageBucket: "ugahacks-core-infra.appspot.com",
  messagingSenderId: "436222925278",
  appId: "1:436222925278:web:aeb5b0acd7830b8aee654f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Not getAuth(): its popup/redirect resolver loads apis.google.com and an
// authDomain iframe on page load in Safari/iOS, and a stalled request (e.g.
// under iCloud Private Relay) blocks the first auth state. The resolver is
// passed to signInWithPopup instead.
export const auth = initializeAuth(app, {
  persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
  ],
});
export const db = getFirestore(app);