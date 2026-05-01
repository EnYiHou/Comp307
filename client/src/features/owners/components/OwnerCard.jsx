// EnYi Hou (261165635)

import "./owner.css";
import { Link } from "react-router-dom";


function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function OwnerCard({ owner }) {
  return (
    <article className="owner-card">
      <div className="owner-card__avatar">{getInitials(owner.name)}</div>

      <div className="owner-card__body">
        <h3>{owner.name}</h3>
        <p>{owner.email}</p>
      </div>

      <div className="owner-card__actions">
        <Link className="owner-card__action owner-card__action--primary" to={`/owners/${owner._id}`}>
          Check Out
        </Link>
      </div>
    </article>
  );
}
