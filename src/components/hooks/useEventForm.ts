import { useEffect, useState } from "react";
import { z } from "zod";
import type { CharacterListItemDto, EventDto, PaginatedResponseDto } from "../../types";

export interface EventFormState {
  title: string;
  event_date: Date | undefined;
  description: string;
  participant_ids: string[];
}

// A single Zod schema for the entire form
const eventFormSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  event_date: z.date({ required_error: "Data zdarzenia jest wymagana" }),
  description: z.string().min(1, "Opis jest wymagany"),
  participant_ids: z.array(z.string()).min(2, "Wymagani są co najmniej dwóch uczestników"),
});

export const useEventForm = (event?: EventDto) => {
  const [formState, setFormState] = useState<EventFormState>({
    title: event?.title ?? "",
    event_date: event?.event_date ? new Date(event.event_date) : undefined,
    description: event?.description ?? "",
    participant_ids: event?.participants?.map((p) => p.id) ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<CharacterListItemDto[]>([]);

  // Fetch available participants on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch("/api/characters?pageSize=100"); // Fetch all for simplicity
        if (!response.ok) throw new Error("Nie udało się pobrać uczestników");
        const data: PaginatedResponseDto<CharacterListItemDto> = await response.json();
        setAvailableParticipants(data.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
        // TODO: Handle error in UI
      }
    };

    fetchParticipants();
  }, []);

  // Fetch event data if in edit mode
  useEffect(() => {
    if (event) {
      setFormState({
        title: event.title,
        event_date: new Date(event.event_date!),
        description: event.description!,
        participant_ids: event.participants.map((p: CharacterListItemDto) => p.id),
      });
    }
  }, [event]);

  const handleFieldChange = (field: keyof EventFormState, value: string | Date | undefined | string[]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectionChange = (ids: string[]) => {
    setFormState((prev) => ({ ...prev, participant_ids: ids }));
    if (errors.participant_ids) {
      setErrors((prev) => ({ ...prev, participant_ids: undefined }));
    }
  };

  const validateForm = () => {
    const result = eventFormSchema.safeParse(formState);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = Object.entries(fieldErrors).reduce(
        (acc, [key, value]) => {
          if (value && value.length > 0) {
            acc[key] = value[0];
          }
          return acc;
        },
        {} as Record<string, string>
      );
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    const command = {
      ...formState,
      event_date: formState.event_date?.toISOString(),
    };

    try {
      const response = await fetch(event ? `/api/events/${event.id}` : "/api/events", {
        method: event ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Coś poszło nie tak");
      }

      if (response.ok && !event) {
        // Only for new events
        window.location.assign("/dashboard/events?analysis_started=true");
      } else {
        window.location.assign("/dashboard/events");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof Error) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: "Wystąpił nieoczekiwany błąd." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState,
    errors,
    isLoading,
    isFetching,
    availableParticipants,
    handleFieldChange,
    handleSelectionChange,
    handleSubmit,
  };
};
