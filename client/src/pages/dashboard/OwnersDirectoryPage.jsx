import { useCallback, useEffect, useState } from "react";
import SearchBar from "../../features/search/components/SearchBar";
import { getOwners } from "../../features/search/services/searchService";
import OwnerGrid from "../../features/owners/components/OwnerGrid";
import OwnerModal from "../../features/owners/components/OwnerModal";
import Notification from "../../components/notification/Notification";
import NewMeetingRequestModal from "./NewMeetingRequestModal";
import "./OwnersDirectoryPage.css";

export default function OwnersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [requestOwner, setRequestOwner] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchOwners = useCallback(async () => {
    try {
      const data = await getOwners(searchTerm);
      setOwners(Array.isArray(data) ? data : []);
    } catch {
      setOwners([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadOwners = async () => {
      try {
        const data = await getOwners(searchTerm);
        if (isMounted) {
          setOwners(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setOwners([]);
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
    <section className="page-stack">
      <div className="owners-page-header">
        <h2>Teachers Directory</h2>
      </div>
      <SearchBar
        placeholder="Search for teachers..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      {owners.length === 0 ? (
        <p>No teachers found.</p>
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
