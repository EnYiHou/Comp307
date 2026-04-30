// EnYi Hou (261165635)

import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

export default function useConfirmationDialog() {
  const [dialog, setDialog] = useState(null);

  function confirm(options) {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        resolve,
      });
    });
  }

  function handleCancel() {
    dialog?.resolve(false);
    setDialog(null);
  }

  function handleConfirm() {
    dialog?.resolve(true);
    setDialog(null);
  }

  const confirmationDialog = dialog && (
    <ConfirmationDialog
      confirmLabel={dialog.confirmLabel}
      message={dialog.message}
      title={dialog.title}
      variant={dialog.variant}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, confirmationDialog };
}
