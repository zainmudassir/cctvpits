// Light Firebase setup for public pages (app + auth + firestore only; no storage or analytics).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
const app = initializeApp({
  apiKey: "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w", authDomain: "cctv-pits.firebaseapp.com", projectId: "cctv-pits",
  storageBucket: "cctv-pits.firebasestorage.app", messagingSenderId: "100968247850", appId: "1:100968247850:web:b0220780da6b7383390953"
});
export const auth = getAuth(app), db = getFirestore(app);
