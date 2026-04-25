import { useEffect } from "react";
import "./Notification.css";

export default function Notification({ notification, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, notification, onClose]);

  if (!notification) {
    return null;
  }

  return (
    <div
      className={`notification notification--${notification.type || "info"}`}
      role="status"
      aria-live="polite"
    >
      {notification.message}
    </div>
  );
}
