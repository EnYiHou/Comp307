import "./owner.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function OwnerCard({ owner, onSelect, onRequest }) {
  return (
    <article className="owner-card">
      <div className="owner-card__avatar">{getInitials(owner.name)}</div>

      <div className="owner-card__body">
        <h3>{owner.name}</h3>
        <p>{owner.email}</p>
      </div>

      <div className="owner-card__actions">
        <button
          className="owner-card__action owner-card__action--secondary"
          type="button"
          onClick={() => onSelect(owner)}
        >
          View slots
        </button>
        <button
          className="owner-card__action owner-card__action--primary"
          type="button"
          onClick={() => onRequest(owner)}
        >
          Make a request
        </button>
      </div>
    </article>
  );
}
