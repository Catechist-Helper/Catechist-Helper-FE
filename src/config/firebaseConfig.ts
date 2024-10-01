import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref as refStorage, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCD7t-xjtdG3PG3D4zXHiJvYWON-PE933Q",
  authDomain: "loveconnection-98efb.firebaseapp.com",
  projectId: "loveconnection-98efb",
  storageBucket: "loveconnection-98efb.appspot.com",
  messagingSenderId: "489141281223",
  appId: "1:489141281223:web:4adaa845e6f0eeb22e39e2",
  measurementId: "G-WRQQ2T383V",
  databaseURL: "https://loveconnection-98efb-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth();
export const firebaseStorage = getStorage(app);
const database = getDatabase(app);
export { database, ref, push, onValue, serverTimestamp, uploadBytes, listAll, getDownloadURL, refStorage, deleteObject };
