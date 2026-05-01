// EnYi Hou (261165635)

import OwnerCard from "./OwnerCard";
import "./owner.css";

export default function OwnerGrid({ owners = [] }) {
  if (owners.length === 0) {
    return <p>No appointment hosts found.</p>;
  }

  return (
    <div className="owner-grid">
      {owners.map((owner) => (
        <OwnerCard key={owner._id} owner={owner} />
      ))}
    </div>
  );
}
