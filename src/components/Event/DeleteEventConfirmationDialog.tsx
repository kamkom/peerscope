import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteEventConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
}

const DeleteEventConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  eventName,
}: DeleteEventConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć zdarzenie?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej akcji nie można cofnąć. Spowoduje to trwałe usunięcie zdarzenia <strong>{eventName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Usuń</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventConfirmationDialog;
