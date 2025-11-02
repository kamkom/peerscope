import React, { useState } from "react";
import type { CharacterListItemDto, PaginationDto } from "../../types";
import type { SortState } from "../hooks/useDashboard";
import DashboardControls from "./DashboardControls";
import CharacterCardGrid from "../Character/CharacterCardGrid";
import { Pagination } from "./Pagination";
import CharacterFormModal from "../Character/CharacterFormModal";
import DeleteConfirmationDialog from "../Character/DeleteConfirmationDialog";
import { toast } from "sonner";

interface CharacterDisplayProps {
  characters: CharacterListItemDto[];
  pagination: PaginationDto | null;
  isLoading: boolean;
  sort: SortState;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SortState) => void;
  onCharacterUpdate: () => void;
}

const CharacterDisplay = ({
  characters,
  pagination,
  isLoading,
  sort,
  onPageChange,
  onSortChange,
  onCharacterUpdate,
}: CharacterDisplayProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<CharacterListItemDto | null>(null);

  const otherCharacters = characters.filter((character) => !character.is_owner);

  const handleAddCharacter = () => {
    setSelectedCharacterId(null);
    setIsModalOpen(true);
  };

  const handleEditCharacter = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setIsModalOpen(true);
  };

  const handleDeleteCharacter = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    if (character) {
      setCharacterToDelete(character);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCharacterId(null);
  };

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;

    try {
      const response = await fetch(`/api/characters/${characterToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć postaci.");
      }

      toast.success("Postać została usunięta.");
      onCharacterUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił nieznany błąd.");
    } finally {
      setCharacterToDelete(null);
    }
  };

  const handleSuccess = () => {
    onCharacterUpdate();
  };

  return (
    <div className="space-y-6">
      <DashboardControls sort={sort} onSortChange={onSortChange} onAddCharacter={handleAddCharacter} />
      <CharacterCardGrid
        characters={otherCharacters}
        isLoading={isLoading}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onAddCharacter={handleAddCharacter}
      />
      {pagination && pagination.totalPages > 1 && <Pagination pagination={pagination} onPageChange={onPageChange} />}
      <CharacterFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        characterId={selectedCharacterId}
        onSuccess={handleSuccess}
      />
      <DeleteConfirmationDialog
        isOpen={!!characterToDelete}
        onClose={() => setCharacterToDelete(null)}
        onConfirm={handleConfirmDelete}
        characterName={characterToDelete?.name}
      />
    </div>
  );
};

export default CharacterDisplay;
