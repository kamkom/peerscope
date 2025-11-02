import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import OnboardingCTA from "./OnboardingCTA";
import CharacterDisplay from "./CharacterDisplay";
import { Button } from "@/components/ui/button";

const DashboardView = () => {
  const { characters, pagination, hasOwnerProfile, isLoading, error, sort, setPage, setSort, retry, refetch } =
    useDashboard();

  if (isLoading && hasOwnerProfile === null) {
    // Initial loading state, before we know if a profile exists
    return <div className="text-center">Wczytywanie...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={retry} className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  // if (!hasOwnerProfile) {
  //   return <OnboardingCTA />;
  // }

  return (
    <CharacterDisplay
      characters={characters}
      pagination={pagination}
      isLoading={isLoading}
      sort={sort}
      onPageChange={setPage}
      onSortChange={setSort}
      onCharacterUpdate={refetch}
    />
  );
};

export default DashboardView;
