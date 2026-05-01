// EnYi Hou (261165635)

import { useEffect, useState } from "react";
import SearchBar from "../../features/search/components/SearchBar";
import { getOwners } from "../../features/search/services/searchService";
import OwnerGrid from "../../features/owners/components/OwnerGrid";
import "./OwnersDirectoryPage.css";

export default function OwnersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section className="appointments-page">
      <div className="owners-page-header">
        <div>
          <p>Staff directory</p>
          <h1>Book Appointments</h1>
          <span>
            Find appointment hosts, view open times, or request a custom
            meeting.
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
          <p>Loading appointment hosts...</p>
        </div>
      ) : owners.length === 0 ? (
        <p className="appointments-empty">No appointment hosts found.</p>
      ) : (
        <OwnerGrid owners={owners} />
      )}
    </section>
  );
}
