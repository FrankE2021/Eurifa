// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB45sFSt-pFQJqinjJubfQCicQcmAguaQQ",
  authDomain: "eurifa-aacd2.firebaseapp.com",
  projectId: "eurifa-aacd2",
  storageBucket: "eurifa-aacd2.appspot.com",
  messagingSenderId: "87924258984",
  appId: "1:87924258984:web:bf2a461cb2591f3eb76a9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
