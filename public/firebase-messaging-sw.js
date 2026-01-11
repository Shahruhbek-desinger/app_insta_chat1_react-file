importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBHkgYqI2sQtDb_U2T7i23_2ZcTAaE71qE",
  authDomain: "app-insta-chat.firebaseapp.com",
  messagingSenderId: "343872548804",
  appId: "1:343872548804:web:22c8534360863ee790be91",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png",
  });
});
