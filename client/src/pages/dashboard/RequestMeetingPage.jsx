import { useState } from "react";
import Notification from "../../components/notification/Notification";
import NewMeetingRequestModal from "./NewMeetingRequestModal";

export default function RequestMeetingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  function showNotification(message, type = "info") {
    setNotification({
      id: Date.now(),
      message,
      type,
    });
  }

  return (
    <section className="page-stack">
      <h1>Request a Time</h1>
      <p>
        Send a custom meeting request to a professor or TA when none of their
        public slots work for you.
      </p>

      <button className="button" type="button" onClick={() => setModalOpen(true)}>
        Start meeting request
      </button>

      {modalOpen && (
        <NewMeetingRequestModal
          onClose={() => setModalOpen(false)}
          onSuccess={showNotification}
        />
      )}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </section>
  );
}
