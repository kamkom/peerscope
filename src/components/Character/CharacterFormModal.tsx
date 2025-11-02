import React, { useState, useEffect } from "react";
import type { CharacterDto, CreateCharacterCommand } from "@/types";
import CharacterForm from "../CharacterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CharacterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId?: string | null;
  isOwnerProfile?: boolean;
  onSuccess?: () => void;
}

const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  isOpen,
  onClose,
  characterId,
  isOwnerProfile,
  onSuccess,
}) => {
  const [character, setCharacter] = useState<CharacterDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && characterId) {
      // Fetch character data for editing
      setIsLoading(true);
      setError(null);

      fetch(`/api/characters/${characterId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Nie udało się pobrać postaci");
          }
          return response.json();
        })
        .then((data) => {
          setCharacter(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się załadować danych postaci");
          setIsLoading(false);
        });
    } else {
      // Reset for new character
      setCharacter(null);
      setError(null);
    }
  }, [isOpen, characterId]);

  const handleSubmit = async (values: CreateCharacterCommand) => {
    setIsSubmitting(true);
    try {
      const isEditMode = !!characterId;
      const url = isEditMode ? `/api/characters/${characterId}` : "/api/characters";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać postaci.");
      }

      toast.success(isEditMode ? "Postać zaktualizowana!" : "Postać utworzona!");

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił błąd podczas zapisywania postaci.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{characterId ? "Edytuj Postać" : "Dodaj Nową Postać"}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Wczytywanie...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <CharacterForm
            initialData={character}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CharacterFormModal;
