import React, { useState } from "react";
import { useEvents } from "@/components/hooks/useEvents";
import { SortDropdown, type SortOption } from "@/components/Dashboard/SortDropdown";
import { Pagination } from "@/components/Dashboard/Pagination";
import EventsList from "@/components/Dashboard/EventsList";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EventDto } from "@/types";
import DeleteEventConfirmationDialog from "@/components/Event/DeleteEventConfirmationDialog";

const eventSortOptions: SortOption[] = [
  { value: "event_date-desc", label: "Data zdarzenia (od najnowszych)" },
  { value: "event_date-asc", label: "Data zdarzenia (od najstarszych)" },
  { value: "title-asc", label: "Tytuł (A-Z)" },
  { value: "title-desc", label: "Tytuł (Z-A)" },
  { value: "created_at-desc", label: "Data utworzenia (od najnowszych)" },
  { value: "created_at-asc", label: "Data utworzenia (od najstarszych)" },
];

function EventsView() {
  const { events, pagination, status, error, queryParams, setPage, setSorting, retry } = useEvents();
  const [eventToDelete, setEventToDelete] = useState<EventDto | null>(null);

  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split("-");
    setSorting({ sortBy, order });
  };

  const openDeleteModal = (eventId: string) => {
    const event = events?.find((e) => e.id === eventId);
    if (event) {
      setEventToDelete(event);
    }
  };

  const handleDelete = async () => {
    if (eventToDelete) {
      try {
        const response = await fetch(`/api/events/${eventToDelete.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        retry(); // Refetch events
        setEventToDelete(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Twoje Zdarzenia</h1>
        <Button asChild>
          <a href="/dashboard/events/new">Dodaj zdarzenie</a>
        </Button>
      </div>

      <div className="flex items-center justify-end">
        <SortDropdown
          options={eventSortOptions}
          value={`${queryParams.sortBy}-${queryParams.order}`}
          onValueChange={handleSortChange}
        />
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>
            {error || "Nie udało się wczytać zdarzeń."}
            <Button onClick={retry} variant="link" className="ml-2">
              Spróbuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <EventsList events={events} isLoading={status === "loading" || status === "idle"} onDelete={openDeleteModal} />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
      <DeleteEventConfirmationDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDelete}
        eventName={eventToDelete?.title || ""}
      />
    </div>
  );
}

export default EventsView;
