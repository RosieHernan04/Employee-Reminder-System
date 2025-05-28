import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/globals.css"; // Your custom styles

import { useEffect } from "react";
import { UserProvider } from "../dataconnect/context/UserContext";
import { messaging } from "../lib/firebase";
import { onMessage } from "firebase/messaging";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("❌ Service Worker registration failed:", err);
        });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && messaging) {
      console.log("✅ messaging is available:", messaging);

      onMessage(messaging, (payload) => {
        console.log("🔔 Foreground push notification received:", payload);

        if (Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/adecmpc-logo.jpg",
          });
        }
      });
    } else {
      console.warn("❌ messaging is NOT available");
    }
  }, []);

  return (
    <UserProvider>
      <div className="container-fluid p-0">
        <Component {...pageProps} />
      </div>
    </UserProvider>
  );
}
