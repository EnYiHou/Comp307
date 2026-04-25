import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../features/search/components/SearchBar";
import { getOwners } from "../../features/search/services/searchService";
import OwnerGrid from "../../features/owners/components/OwnerGrid";
import OwnerModal from "../../features/owners/components/OwnerModal";
import Notification from "../../components/notification/Notification";
import NewMeetingRequestModal from "./NewMeetingRequestModal";
import LoadingState from "../../components/loading/LoadingState";
import "./OwnersDirectoryPage.css";

export default function OwnersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [requestOwner, setRequestOwner] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOwners = useCallback(async () => {
    try {
      const data = await getOwners(searchTerm);
      setOwners(Array.isArray(data) ? data : []);
      setError("");
    } catch (caughtError) {
      console.error("Book appointments load error:", caughtError);
      setOwners([]);
      setError("Failed to load appointment hosts.");
    }
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadOwners = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getOwners(searchTerm);
        if (isMounted) {
          setOwners(Array.isArray(data) ? data : []);
        }
      } catch (caughtError) {
        console.error("Book appointments search error:", caughtError);
        if (isMounted) {
          setOwners([]);
          setError("Failed to load appointment hosts.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOwners();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  const showNotification = useCallback((message, type = "info") => {
    setNotification({
      id: Date.now(),
      message,
      type,
    });
  }, []);

  return (
    <section className="appointments-page">
      <div className="owners-page-header">
        <div>
          <p>Availability browser</p>
          <h1>Book Appointments</h1>
          <span>
            Find available appointment hosts, view open times, or request a
            custom meeting.
          </span>
        </div>
      </div>
      <SearchBar
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      {error ? (
        <p className="appointments-empty is-error">{error}</p>
      ) : loading ? (
        <div className="appointments-loading">
          <LoadingState label="Loading appointment hosts..." variant="panel" />
        </div>
      ) : owners.length === 0 ? (
        <p className="appointments-empty">No appointment hosts found.</p>
      ) : (
        <OwnerGrid
          owners={owners}
          onSelectOwner={(owner) => setSelectedOwner(owner)}
          onRequestOwner={(owner) => setRequestOwner(owner)}
        />
      )}

      {selectedOwner && (
        <OwnerModal
          owner={selectedOwner}
          onClose={() => setSelectedOwner(null)}
          onNotify={showNotification}
          onBookingSuccess={fetchOwners}
        />
      )}
      {requestOwner && (
        <NewMeetingRequestModal
          initialTeacher={requestOwner}
          lockTeacher
          onClose={() => setRequestOwner(null)}
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
