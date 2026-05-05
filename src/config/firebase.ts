
// firebase auth -- only used for phone OTP login.
// dont forget to add the deployed domain in firebase console -> auth
// -> authorised domains, otherwise reCAPTCHA breaks silently.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
auth.languageCode = 'en';


// keep one verifier instance, otherwise the recaptcha widget complains
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function getRecaptchaVerifier(containerId = 'recaptcha-container'): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        recaptchaVerifier = null;
      },
    });
  }
  return recaptchaVerifier;
}

// nuke the verifier when the otp flow restarts
export function resetRecaptcha(): void {
  try {
    recaptchaVerifier?.clear();
  } catch (e) {
    // sometimes throws if already cleared, dont care
  }
  recaptchaVerifier = null;
}


// send the otp
export async function sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}
