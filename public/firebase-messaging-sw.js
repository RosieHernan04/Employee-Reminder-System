// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB3GixrKToHs6_rOn2nnYhz5Ucuq7SG1e4",
  authDomain: "task-reminder-system-236c0.firebaseapp.com",
  projectId: "task-reminder-system-236c0",
  messagingSenderId: "326199277443",
  appId: "1:326199277443:web:af60e13429dcbfa876e8b6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("📦 Received background message ", payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = notification.title || data.title || "📌 Reminder";
  const notificationOptions = {
    body: notification.body || data.body || "You have a new reminder.",
    icon: "/adecmpc-logo.jpg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});