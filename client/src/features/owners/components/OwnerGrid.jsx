import OwnerCard from "./OwnerCard";
import "./owner.css";

export default function OwnerGrid({ owners = [], onSelectOwner }) {
  if (owners.length === 0) {
    return <p>No owners found.</p>;
  }

  return (
    <div className="owner-grid">
      {owners.map((owner) => (
        <OwnerCard key={owner._id} owner={owner} onSelect={onSelectOwner} />
      ))}
    </div>
  );
}
