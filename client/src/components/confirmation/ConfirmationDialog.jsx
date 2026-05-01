// EnYi Hou (261165635)
// Kevin Xu

import "./ConfirmationDialog.css";

export default function ConfirmationDialog({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  onCancel,
  onConfirm,
}) {
  return (
    <div className="confirmation-dialog-backdrop" onClick={onCancel}>
      <div
        className="confirmation-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2>{title}</h2>
          {message && <p>{message}</p>}
        </div>

        <div className="confirmation-dialog__actions">
          <button
            className="confirmation-dialog__button"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`confirmation-dialog__button confirmation-dialog__button--${variant}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
