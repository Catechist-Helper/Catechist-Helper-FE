import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref as refStorage, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { serverTimestamp } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDFzW-MfWBYa74di13FbHq2wf7wV488_Oo",
    authDomain: "catechisthelper-1f8af.firebaseapp.com",
    projectId: "catechisthelper-1f8af",
    storageBucket: "catechisthelper-1f8af.appspot.com",
    messagingSenderId: "1198903541",
    appId: "1:1198903541:web:29013120541cd7d46c35bc",
    measurementId: "G-ER5QQ3P9L1"
//   databaseURL: "https://loveconnection-98efb-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth();
export const firebaseStorage = getStorage(app);
const storage = getStorage(app);

export { storage };
const database = getDatabase(app);
export { database, ref, push, onValue, serverTimestamp, uploadBytes, listAll, getDownloadURL, refStorage, deleteObject };
export default app;