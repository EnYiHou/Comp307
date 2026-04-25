import { useCallback, useMemo, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

export default function useConfirmationDialog() {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    dialog?.resolve(false);
    setDialog(null);
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    dialog?.resolve(true);
    setDialog(null);
  }, [dialog]);

  const confirmationDialog = useMemo(
    () => (
      <ConfirmationDialog
        cancelLabel={dialog?.cancelLabel}
        confirmLabel={dialog?.confirmLabel}
        message={dialog?.message}
        open={Boolean(dialog)}
        title={dialog?.title}
        variant={dialog?.variant}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    ),
    [dialog, handleCancel, handleConfirm],
  );

  return { confirm, confirmationDialog };
}
