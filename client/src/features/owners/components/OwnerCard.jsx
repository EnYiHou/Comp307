import "./owner.css";
export default function OwnerCard({ owner, onSelect }) {
  return (
    <button
      className="owner-card"
      type="button"
      onClick={() => onSelect(owner)}
    >
      <div className="owner-card__avatar">{owner.name}</div>

      <div className="owner-card__body">
        <p>{owner.email}</p>
      </div>

      <span className="owner-card__action">View slots</span>
    </button>
  );
}
