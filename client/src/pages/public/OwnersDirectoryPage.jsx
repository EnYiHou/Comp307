import { useEffect, useState } from "react";
import SearchBar from "../../features/search/components/SearchBar";
import { getOwners } from "../../features/search/services/searchService";

function OwnerTable({ owners = [] }) {
  return (
    <ul className="owners-list">
      {owners.map((owner) => (
        <li key={owner.id} className="owner-list-item">
          <div className="owner-name">{owner.name}</div>
          <div className="owner-email">{owner.email}</div>
        </li>
      ))}
    </ul>
  );
}

export default function OwnersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    console.log("Fetching owners with search term:", searchTerm);
    let isMounted = true;

    const fetchOwners = async () => {
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

    fetchOwners();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  return (
    <section className="page-stack">
      <h2>Owners Directory</h2>
      <SearchBar
        placeholder="Search for owners..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      {owners.length === 0 ? (
        <p>No owners found.</p>
      ) : (
        <OwnerTable owners={owners} />
      )}
    </section>
  );
}
