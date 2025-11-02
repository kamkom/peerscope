import React from "react";
import type { CharacterListItemDto } from "../../types";
import CharacterCard from "./CharacterCard";
import SkeletonCard from "./SkeletonCard";
import { Button } from "@/components/ui/button";

interface CharacterCardGridProps {
  characters: CharacterListItemDto[];
  isLoading: boolean;
  onEditCharacter?: (characterId: string) => void;
  onDeleteCharacter?: (characterId: string) => void;
  onAddCharacter?: () => void;
}

const CharacterCardGrid = ({
  characters,
  isLoading,
  onEditCharacter,
  onDeleteCharacter,
  onAddCharacter,
}: CharacterCardGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <h3 className="text-2xl font-bold tracking-tight">Nie masz jeszcze żadnych postaci</h3>
        <p className="text-sm text-muted-foreground">Utwórz nową postać, aby rozpocząć.</p>
        {onAddCharacter && (
          <Button onClick={onAddCharacter} className="mt-4">
            Utwórz postać
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} onEdit={onEditCharacter} onDelete={onDeleteCharacter} />
      ))}
    </div>
  );
};

export default CharacterCardGrid;
