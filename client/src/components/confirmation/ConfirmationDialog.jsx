import { useEffect } from "react";
import "./ConfirmationDialog.css";

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirmation-dialog-backdrop" onClick={onCancel}>
      <div
        aria-labelledby="confirmation-dialog-title"
        aria-modal="true"
        className="confirmation-dialog"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2 id="confirmation-dialog-title">{title}</h2>
          {message && <p>{message}</p>}
        </div>

        <div className="confirmation-dialog__actions">
          <button
            className="confirmation-dialog__button"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
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
