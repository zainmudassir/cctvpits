import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const HOME = "index.html"; // where to go after login
const form = document.getElementById("auth-form");
const msg = document.getElementById("msg");
const btn = form.querySelector("button.primary");
const page = document.body.dataset.page;

const show = (text, type) => { msg.textContent = text; msg.className = "msg " + type; };

const errors = {
  "auth/email-already-in-use": "This email is already registered. Log in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "No connection. Check your internet and try again."
};
const friendly = e => errors[e.code] || "Something went wrong. Please try again.";

// Already signed in? Skip the form.
onAuthStateChanged(auth, u => { if (u && !form.dataset.busy) location.replace(HOME); });

form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.className = "msg";
  const v = Object.fromEntries(new FormData(form));
  form.dataset.busy = "1";
  btn.disabled = true;
  try {
    if (page === "register") {
      if (v.password !== v.confirm) throw { code: "custom", message: "Passwords do not match." };
      const cred = await createUserWithEmailAndPassword(auth, v.email.trim(), v.password);
      await updateProfile(cred.user, { displayName: v.name.trim() });
      await setDoc(doc(db, "users", cred.user.uid), {
        name: v.name.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        role: "customer",
        createdAt: serverTimestamp()
      });
      show("Account created. Taking you to the store...", "ok");
    } else {
      await signInWithEmailAndPassword(auth, v.email.trim(), v.password);
      show("Logged in. Taking you to the store...", "ok");
    }
    setTimeout(() => location.replace(HOME), 700);
  } catch (err) {
    show(err.code === "custom" ? err.message : friendly(err), "err");
    btn.disabled = false;
    delete form.dataset.busy;
  }
});

const reset = document.getElementById("reset");
if (reset) reset.addEventListener("click", async () => {
  const email = form.email.value.trim();
  if (!email) return show("Enter your email above, then tap Reset password.", "err");
  try {
    await sendPasswordResetEmail(auth, email);
    show("Reset link sent. Check your inbox.", "ok");
  } catch (err) { show(friendly(err), "err"); }
});
