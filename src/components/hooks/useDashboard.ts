import { useState, useEffect, useCallback } from "react";
import type { CharacterListItemDto, PaginatedResponseDto, PaginationDto } from "../../types";

export type SortState = {
  sortBy: "name" | "last_interacted_at";
  order: "asc" | "desc";
};

export function useDashboard() {
  const [hasOwnerProfile, setHasOwnerProfile] = useState<boolean | null>(null);
  const [characters, setCharacters] = useState<CharacterListItemDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({
    sortBy: "last_interacted_at",
    order: "desc",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch user profile. The existence of a user is handled by middleware.
      await fetch("/api/profile");

      // Step 2: Check if an owner-character profile exists for the user.
      const ownerProfileResponse = await fetch("/api/characters?is_owner=true&pageSize=1");
      if (!ownerProfileResponse.ok) {
        throw new Error("Failed to check for owner profile.");
      }
      const ownerProfileResult: PaginatedResponseDto<CharacterListItemDto> = await ownerProfileResponse.json();
      const hasProfile = ownerProfileResult.pagination.totalItems > 0;
      setHasOwnerProfile(hasProfile);

      // Step 3: If a profile exists, fetch the list of all characters for that user.
      if (hasProfile) {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: "12",
          sortBy: sort.sortBy,
          order: sort.order,
        });

        const charactersResponse = await fetch(`/api/characters?${params.toString()}`);
        if (!charactersResponse.ok) {
          throw new Error("Failed to fetch characters.");
        }
        const charactersResult: PaginatedResponseDto<CharacterListItemDto> = await charactersResponse.json();

        setCharacters(charactersResult.data);
        setPagination(charactersResult.pagination);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetSort = (newSort: SortState) => {
    setSort(newSort);
    setPage(1);
  };

  const retry = () => {
    fetchData();
  };

  const refetch = () => {
    fetchData();
  };

  return {
    characters,
    pagination,
    hasOwnerProfile: hasOwnerProfile ?? false,
    isLoading: isLoading || hasOwnerProfile === null,
    error,
    page,
    sort,
    setPage,
    setSort: handleSetSort,
    retry,
    refetch,
  };
}
