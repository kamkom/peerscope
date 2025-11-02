import { useState, useEffect, useCallback } from "react";
import type { AiAnalysisDto, EventDto, PaginatedResponseDto, PaginationDto } from "@/types";

type Status = "idle" | "loading" | "success" | "error";
type Sorting = { sortBy: string; order: string };

const PAGE_SIZE = 10;

export function useEvents() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    sortBy: "event_date",
    order: "desc",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("analysis_started")) {
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchAnalyses = async (eventId: string): Promise<AiAnalysisDto[]> => {
    const response = await fetch(`/api/events/${eventId}/analyses`);
    if (!response.ok) {
      // In a real app, you might want more robust error handling
      console.error(`Failed to fetch analysis for event ${eventId}`);
      return [];
    }
    return response.json();
  };

  const fetchData = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const params = new URLSearchParams({
      page: queryParams.page.toString(),
      pageSize: PAGE_SIZE.toString(),
      sortBy: queryParams.sortBy,
      order: queryParams.order,
    });

    try {
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        // Simple error message, can be improved with error details from response body
        throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
      }
      const data: PaginatedResponseDto<EventDto> = await response.json();
      setEvents(data.data);
      setPagination(data.pagination);
      setStatus("success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);
      setStatus("error");
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const pendingEvents = events.filter((e) => e.analysis_status === "pending");
    if (pendingEvents.length === 0) {
      return;
    }

    const intervalId = setInterval(async () => {
      let changed = false;
      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          if (event.analysis_status === "pending") {
            const analyses = await fetchAnalyses(event.id);
            if (analyses.length > 0) {
              changed = true;
              // Assuming the first analysis is the one we're interested in
              // and that its presence means the event is no longer pending.
              // A more robust solution might check the analysis status if it exists.
              return { ...event, analysis_status: "completed" };
            }
          }
          return event;
        })
      );
      if (changed) {
        setEvents(updatedEvents);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [events]);

  const setPage = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const setSorting = (sorting: Sorting) => {
    // Reset to page 1 when sorting changes
    setQueryParams((prev) => ({ ...prev, ...sorting, page: 1 }));
  };

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { events, pagination, status, error, queryParams, setPage, setSorting, retry };
}
