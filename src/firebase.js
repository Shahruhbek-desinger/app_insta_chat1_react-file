import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBHkgYqI2sQtDb_U2T7i23_2ZcTAaE71qE",
  authDomain: "app-insta-chat.firebaseapp.com",
  projectId: "app-insta-chat",
  messagingSenderId: "343872548804",
  appId: "G-PH8ZRFXWN9",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
