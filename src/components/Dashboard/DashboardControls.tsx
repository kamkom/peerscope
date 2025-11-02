import React from "react";
import { Button } from "@/components/ui/button";
import { SortDropdown, type SortOption } from "./SortDropdown";
import type { SortState } from "../hooks/useDashboard";

interface DashboardControlsProps {
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  onAddCharacter: () => void;
}

const characterSortOptions: SortOption[] = [
  { value: "last_interacted_at-desc", label: "Ostatnia interakcja (od najnowszej)" },
  { value: "last_interacted_at-asc", label: "Ostatnia interakcja (od najstarszej)" },
  { value: "name-asc", label: "Nazwa (A-Z)" },
  { value: "name-desc", label: "Nazwa (Z-A)" },
];

const DashboardControls = ({ sort, onSortChange, onAddCharacter }: DashboardControlsProps) => {
  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split("-") as [SortState["sortBy"], SortState["order"]];
    onSortChange({ sortBy, order });
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Twoje Postacie</h1>
      <div className="flex items-center gap-4">
        <SortDropdown
          options={characterSortOptions}
          value={`${sort.sortBy}-${sort.order}`}
          onValueChange={handleSortChange}
          className="w-[240px]"
        />
        <Button onClick={onAddCharacter}>Dodaj Postać</Button>
      </div>
    </div>
  );
};

export default DashboardControls;
