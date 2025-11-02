import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = { value: string; label: string };

type SortDropdownProps = {
  options: SortOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SortDropdown({
  options,
  value,
  onValueChange,
  placeholder = "Sortuj według...",
  className = "w-[280px]",
}: SortDropdownProps) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
