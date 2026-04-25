export default function OwnerModal({ owner, onClose }) {
  return (
    <div className="owner-modal-backdrop" onClick={onClose}>
      <section
        className="owner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="owner-modal_header">
          <button
            className="owner-modal_close-button"
            aria-label="Close owner details"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <h2 id="owner-modal-title">{owner.name}</h2>
        <p>{owner.email}</p>

        <div className="owner-modal_content">
          <h3>Available slots</h3>
          <p>Slot details can be loaded here.</p>
        </div>
      </section>
    </div>
  );
}
