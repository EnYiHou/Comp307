import { useEffect, useState } from "react";
import SearchBar from "../../features/search/components/SearchBar";
import { getOwners } from "../../features/search/services/searchService";
import OwnerGrid from "../../features/owners/components/OwnerGrid";
import OwnerModal from "../../features/owners/components/OwnerModal";

export default function OwnersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);

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
        <OwnerGrid
          owners={owners}
          onSelectOwner={(owner) => setSelectedOwner(owner)}
        />
      )}

      {selectedOwner && (
        <OwnerModal
          owner={selectedOwner}
          onClose={() => setSelectedOwner(null)}
        />
      )}
    </section>
  );
}
