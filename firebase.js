import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w",
  authDomain: "cctv-pits.firebaseapp.com",
  projectId: "cctv-pits",
  storageBucket: "cctv-pits.firebasestorage.app",
  messagingSenderId: "100968247850",
  appId: "1:100968247850:web:b0220780da6b7383390953",
  measurementId: "G-10GGD4106Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
isSupported().then(ok => { if (ok) getAnalytics(app); }).catch(() => {});
