import React from "react";
import type { EventDto } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import EventListItem from "@/components/Dashboard/EventListItem";
import { Button } from "@/components/ui/button";

type EventsListProps = {
  events: EventDto[];
  isLoading: boolean;
  onDelete?: (eventId: string) => void;
};

const SKELETON_COUNT = 6;

function EventsList({ events, isLoading, onDelete }: EventsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <h3 className="text-2xl font-bold tracking-tight">Nie masz jeszcze żadnych zdarzeń</h3>
        <p className="text-sm text-muted-foreground">Dodaj nowe zdarzenie, aby rozpocząć.</p>
        <Button asChild className="mt-4">
          <a href="/dashboard/events/new">Utwórz zdarzenie</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="hidden rounded-lg bg-muted/50 p-4 sm:grid sm:grid-cols-4 sm:gap-4">
        <div className="font-semibold">Tytuł</div>
        <div className="font-semibold">Uczestnicy</div>
        <div className="text-right font-semibold">Data zdarzenia</div>
        <div className="text-right font-semibold">Akcje</div>
      </div>
      {events.map((event) => (
        <EventListItem key={event.id} event={event} onDelete={onDelete} />
      ))}
    </div>
  );
}
export default EventsList;
