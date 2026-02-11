// app/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- เอาค่า Config จาก Firebase Console มาใส่ตรงนี้ ---
const firebaseConfig = {
  apiKey: "AIzaSyBn92n3tFAXjSle2m5k8Uty5OLibtURN0k",
  authDomain: "my-grade-site.firebaseapp.com",
  projectId: "my-grade-site",
  storageBucket: "my-grade-site.firebasestorage.app",
  messagingSenderId: "819387558522",
  appId: "1:819387558522:web:a358a29c0043e22ea8a9c3"
};
// ---------------------------------------------------

const app = initializeApp(firebaseConfig);

// *** สำคัญมาก! ต้องมีบรรทัดนี้ และต้องมีคำว่า export ***
export const db = getFirestore(app);