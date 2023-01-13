// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const auth = getAuth();
export const db = getFirestore(app);