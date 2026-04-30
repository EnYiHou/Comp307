import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Notification from "../../components/notification/Notification";
import OwnerPanel from "../../features/owners/components/OwnerPanel";
import { getOwner } from "../../features/search/services/searchService";
import NewMeetingRequestModal from "./NewMeetingRequestModal";
import "./OwnersDirectoryPage.css";

export default function OwnerProfilePage() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [requestOwner, setRequestOwner] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOwner(ownerId).then(setOwner).catch(() => setError("Owner not found."));
  }, [ownerId]);

  const notify = (message, type = "info") => {
    setNotification({ id: Date.now(), message, type });
  };

  return (
    <section className="appointments-page owner-profile-page">
      {error ? (
        <p className="appointments-empty is-error">{error}</p>
      ) : owner ? (
        <OwnerPanel
          inline
          owner={owner}
          onClose={() => navigate("/owners")}
          onNotify={notify}
          onRequest={() => setRequestOwner(owner)}
        />
      ) : (
        <div className="appointments-loading">
          <p>Loading owner...</p>
        </div>
      )}

      {requestOwner && (
        <NewMeetingRequestModal
          initialTeacher={requestOwner}
          lockTeacher
          onClose={() => setRequestOwner(null)}
          onSuccess={notify}
        />
      )}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </section>
  );
}
