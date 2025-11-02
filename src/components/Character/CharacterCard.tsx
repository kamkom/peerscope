import React from "react";
import type { CharacterListItemDto } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CharacterCardProps {
  character: CharacterListItemDto;
  onEdit?: (characterId: string) => void;
  onDelete?: (characterId: string) => void;
}

const CharacterCard = ({ character, onEdit, onDelete }: CharacterCardProps) => {
  const handleCardClick = () => {
    if (onEdit) {
      onEdit(character.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(character.id);
    }
  };

  return (
    <div className="group relative block h-full cursor-pointer" onClick={handleCardClick}>
      <div className="block h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all group-hover:shadow-md">
          <div className="h-40 w-full overflow-hidden">
            {character.avatar_url ? (
              <img
                src={character.avatar_url}
                alt={character.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-5xl font-bold text-muted-foreground">
                  {character.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="text-lg font-semibold tracking-tight">{character.name}</h3>
            <p className="text-sm text-muted-foreground">{character.role}</p>
            {character.is_owner && (
              <Badge variant="secondary" className="mt-auto w-fit">
                Twój Profil
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="absolute right-2 top-2 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
        {onDelete && (
          <Button variant="destructive" size="sm" className="w-9 px-0" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CharacterCard;
