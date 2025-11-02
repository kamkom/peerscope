"use client";

import * as React from "react";
import { useEventForm } from "../hooks/useEventForm";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "./MultiSelect";
import type { EventDto } from "../../types";

interface EventFormProps {
  event?: EventDto;
}

export const EventForm: React.FC<EventFormProps> = ({ event }) => {
  const {
    formState,
    errors,
    isLoading,
    isFetching,
    availableParticipants,
    handleFieldChange,
    handleSelectionChange,
    handleSubmit,
  } = useEventForm(event);

  const isReadOnly = event?.analysis_status === "completed";

  const participantOptions = React.useMemo(() => {
    return availableParticipants.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [availableParticipants]);

  if (isFetching) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{event ? "Edytuj zdarzenie" : "Dodaj zdarzenie"}</CardTitle>
        <CardDescription>
          {event
            ? "Zaktualizuj szczegóły swojego zdarzenia."
            : "Wypełnij formularz, aby dodać nowe zdarzenie do swojej osi czasu."}
        </CardDescription>
        {isReadOnly && (
          <Alert variant="default" className="mt-4">
            <AlertTitle>Analiza zakończona</AlertTitle>
            <AlertDescription>
              To zdarzenie zostało już przeanalizowane. Formularz jest zablokowany i nie można go edytować.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <Alert variant="destructive">
              <AlertTitle>Błąd</AlertTitle>
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Tytuł zdarzenia</Label>
            <Input
              id="title"
              placeholder="np. Negocjacje o świcie"
              value={formState.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              required
              disabled={isReadOnly}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_date">Data zdarzenia</Label>
            <DatePicker
              date={formState.event_date}
              setDate={(date) => handleFieldChange("event_date", date)}
              className="w-full"
              disabled={isReadOnly}
              placeholder="Wybierz datę zdarzenia"
            />
            {errors.event_date && <p className="text-sm text-red-500">{errors.event_date}</p>}
          </div>

          <div className="space-y-2">
            <Label>Wybierz uczestników</Label>
            <MultiSelect
              options={participantOptions}
              selected={formState.participant_ids}
              onChange={handleSelectionChange}
              placeholder={isReadOnly ? "" : "Wybierz co najmniej 2 uczestników..."}
              disabled={isReadOnly}
            />
            {errors.participant_ids && <p className="text-sm text-red-500">{errors.participant_ids}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis zdarzenia</Label>
            <Textarea
              id="description"
              placeholder="Opisz kluczowe momenty i rezultaty zdarzenia..."
              value={formState.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              required
              className="min-h-[120px]"
              disabled={isReadOnly}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button asChild variant="outline" disabled={isLoading || isReadOnly}>
              <a
                href="/dashboard/events"
                onClick={(e) => {
                  if (isLoading) {
                    e.preventDefault();
                  }
                }}
              >
                Zamknij
              </a>
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Zapisywanie..." : event ? "Zapisz zmiany" : "Rozpocznij analizę"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
