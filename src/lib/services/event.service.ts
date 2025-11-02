import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type {
  AiAnalysisDto,
  CreateEventCommand,
  EventDto,
  PaginatedResponseDto,
  UpdateEventCommand,
  CharacterDto,
} from "../../types";
import { OpenRouterService } from "./openrouter.service";
import { z } from "zod";
import { CharacterService } from "./character.service";

type GetEventsOptions = {
  page: number;
  pageSize: number;
  sortBy: "event_date" | "title" | "created_at";
  order: "asc" | "desc";
};

/**
 * Custom error type for service layer errors to be handled by the API layer.
 */
export class ServiceError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

const mediationAnalysisSchema = z.object({
  generated_summary: z.string().describe("Obiektywne przedstawienie kontekstu i tła sytuacji (bez ocen)."),
  analysis: z.string().describe("Wskazanie możliwych źródeł konfliktu, nieporozumienia lub napięcia."),
  objective_evaluation: z
    .string()
    .describe("Zrównoważone podsumowanie sytuacji i rekomendacje, jak rozwiązać sytuację w sposób konstruktywny."),
});

export class EventService {
  /**
   * Retrieves a single event by its ID for a specific user.
   *
   * @param supabase - The Supabase client instance.
   * @param eventId - The ID of the event to retrieve.
   * @param userId - The ID of the user who owns the event.
   * @returns A promise that resolves to the event DTO.
   * @throws {ServiceError} If the event is not found or a database error occurs.
   */
  static async getEventById(supabase: SupabaseClient, eventId: string, userId: string): Promise<EventDto> {
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `*,
        participants:event_participants(
          character:characters(id, name, role, avatar_url, is_owner, last_interacted_at, updated_at)
        )`
      )
      .eq("id", eventId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(`Error fetching event by ID ${eventId}:`, error);
      // Assuming 'PGRST116' is the code for 'no rows found'
      if (error.code === "PGRST116") {
        throw new ServiceError("Event not found.", 404);
      }
      throw new ServiceError("An unexpected error occurred while fetching the event.", 500);
    }

    if (!event) {
      throw new ServiceError("Event not found.", 404);
    }

    const { participants, ...rest } = event as any;
    return {
      ...rest,
      participants: (participants ?? []).map((p: any) => p.character).filter(Boolean) || [],
    } as any;
  }

  /**
   * Creates a new event and associates participants with it using an atomic RPC function.
   *
   * @param supabase - The Supabase client instance.
   * @param cmd - The command object containing event details and participant IDs.
   * @param userId - The ID of the user creating the event.
   * @returns A promise that resolves to the newly created event DTO.
   * @throws {ServiceError} If validation fails or a database error occurs.
   */
  static async createEvent(supabase: SupabaseClient, cmd: CreateEventCommand, userId: string): Promise<EventDto> {
    const { error, data: newEventId } = await supabase.rpc("create_event_with_participants", {
      p_user_id: userId,
      p_title: cmd.title,
      p_description: (cmd.description ?? null) as unknown as string,
      p_event_date: (cmd.event_date ?? null) as unknown as string,
      p_participant_ids: cmd.participant_ids,
    });

    if (error) {
      console.error("Error calling create_event_with_participants RPC:", error);
      // The custom error message from the PG function is in `error.message`.
      if (error.message.includes("One or more participants not found")) {
        throw new ServiceError("One or more participants not found or do not belong to the user.", 404);
      }
      throw new ServiceError("An unexpected error occurred while creating the event.", 500);
    }

    if (!newEventId) {
      throw new ServiceError("Failed to create the event in the database (RPC returned no ID).", 500);
    }

    const newEvent = await this.getEventById(supabase, newEventId, userId);

    // Trigger analysis in the background (fire-and-forget)
    this._triggerMediationAnalysis(supabase, newEvent, userId).catch((error) => {
      console.error(`[EventService] Background mediation analysis failed for event ${newEventId}:`, error);
    });

    return newEvent;
  }

  private static async _triggerMediationAnalysis(
    supabase: SupabaseClient,
    event: EventDto,
    userId: string
  ): Promise<void> {
    try {
      const participantIds = event.participants.map((p) => p.id);
      const characters = await CharacterService.getCharactersByIds(supabase, participantIds, userId);

      if (characters.length < 2) {
        console.warn(`[MediationAnalysis] Event ${event.id} has fewer than 2 participants. Skipping analysis.`);
        return;
      }

      const situationDescription = event.description;
      const characterDetails = characters
        .map(
          (char, index) =>
            `#### Postać ${String.fromCharCode(65 + index)}
- **Imię:** ${char.name}
- **Rola:** ${char.role}
- **Opis:** ${char.description}
- **Cechy:** ${(char.traits ?? []).join(", ")}
- **Motywacje:** ${(char.motivations ?? []).join(", ")}`
        )
        .join("\n\n");

      const systemPrompt = `# Rola mediatora

Jesteś doświadczonym i bezstronnym mediatorem. Twoim zadaniem jest:
- przeanalizować opisaną sytuację,
- przedstawić obiektywnie perspektywę każdej osoby,
- wskazać źródła konfliktu lub napięcia,
- zaproponować możliwe rozwiązania w duchu zrozumienia i współpracy.
---
## 🧩 Dane wejściowe
### 🧱 Opis sytuacji
${situationDescription}
---
### 👥 Postacie
${characterDetails}
---
## 🧠 Instrukcje dla mediatora
Na podstawie powyższych informacji wykonaj następujące kroki:
1. **Opis sytuacji:**
   Obiektywnie przedstaw kontekst i tło sytuacji (bez ocen).
2. **Perspektywy postaci:**
   Dla każdej postaci:
   - Opisz, jak postrzega sytuację.
   - Jakie emocje i potrzeby mogą za tym stać.
   - Jakie cele lub przekonania kierują jej działaniem.
3. **Analiza mediatora:**
   - Wskaż możliwe źródła konfliktu, nieporozumienia lub napięcia.
   - Zidentyfikuj różnice w komunikacji, wartościach lub potrzebach.
4. **Ocena obiektywna:**
   - Zrównoważone podsumowanie sytuacji.
   - Co każda ze stron mogłaby zrozumieć lepiej.
   - Jakie działania mogą pomóc w rozwiązaniu sytuacji w sposób konstruktywny.
---
## 🎯 Format odpowiedzi
### 🧾 Opis sytuacji
{{generated_summary}}
### 🔍 Perspektywa postaci A
{{perspective_A}}
### 🔍 Perspektywa postaci B
{{perspective_B}}
### ⚖️ Analiza mediatora
{{analysis}}
### 🕊️ Ocena obiektywna i rekomendacje
{{objective_evaluation}}
---
**Styl odpowiedzi:**
- Ton: neutralny, empatyczny, profesjonalny.
- Forma: rzeczowa, uporządkowana.
- Nie oceniaj osób – analizuj zachowania i komunikację.`;

      const openRouterService = new OpenRouterService();
      const analysisResult = await openRouterService.getChatCompletion({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: systemPrompt }],
        responseSchema: mediationAnalysisSchema,
      });

      const { error: insertError } = await supabase.from("ai_analyses").insert({
        user_id: userId,
        event_id: event.id,
        analysis_type: "mediation",
        result: analysisResult as any,
      });

      if (insertError) {
        console.error(`[MediationAnalysis] Failed to save analysis for event ${event.id}:`, insertError);
        // Update status to 'failed'
        await supabase.from("events").update({ analysis_status: "failed" }).eq("id", event.id);
      } else {
        console.log(`[MediationAnalysis] Successfully completed and saved analysis for event ${event.id}.`);
        // Update status to 'completed'
        await supabase.from("events").update({ analysis_status: "completed" }).eq("id", event.id);
      }
    } catch (error) {
      console.error(`[MediationAnalysis] An unexpected error occurred for event ${event.id}:`, error);
      // Update status to 'failed' on unexpected error
      await supabase.from("events").update({ analysis_status: "failed" }).eq("id", event.id);
    }
  }

  /**
   * Retrieves all AI analyses for a given event, checking for data staleness.
   *
   * @param supabase - The Supabase client instance.
   * @param eventId - The ID of the event.
   * @param userId - The ID of the user requesting the analyses.
   * @returns A promise that resolves to an array of AI analysis DTOs.
   * @throws {ServiceError} If the event is not found or a database error occurs.
   */
  static async getEventAnalyses(supabase: SupabaseClient, eventId: string, userId: string): Promise<AiAnalysisDto[]> {
    // 1. Verify event existence and ownership. Throws ServiceError if not found.
    const event = await this.getEventById(supabase, eventId, userId);

    // 2. Fetch all analyses for the event.
    const { data: analyses, error: analysesError } = await supabase
      .from("ai_analyses")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", {
        ascending: false,
      });

    if (analysesError) {
      console.error(`Error fetching analyses for event ${eventId}:`, analysesError);
      throw new ServiceError("An unexpected error occurred while fetching event analyses.", 500);
    }

    if (!analyses || analyses.length === 0) {
      return [];
    }

    // 3. Determine the most recent update timestamp among the event and its participants.
    const participantIds = event.participants.map((p) => p.id);
    const characters = await CharacterService.getCharactersByIds(supabase, participantIds, userId);

    const lastEventUpdate = new Date(event.updated_at).getTime();
    const lastCharacterUpdate = Math.max(...characters.map((c) => new Date(c.updated_at).getTime()), 0);
    const lastDataUpdate = new Date(Math.max(lastEventUpdate, lastCharacterUpdate));

    // 4. Add outdated data warning if necessary.
    const analysesWithWarnings: AiAnalysisDto[] = analyses.map((analysis) => {
      const analysisDate = new Date(analysis.created_at);
      let outdated_data_warning: string | undefined = undefined;

      if (analysisDate < lastDataUpdate) {
        outdated_data_warning =
          "Dane zdarzenia lub uczestników zostały zaktualizowane po wygenerowaniu tej analizy. Wyniki mogą być nieaktualne.";
      }

      return {
        ...analysis,
        outdated_data_warning,
      };
    });

    return analysesWithWarnings;
  }

  /**
   * Updates an existing event and its participants using an atomic RPC function.
   *
   * @param supabase - The Supabase client instance.
   * @param eventId - The ID of the event to update.
   * @param cmd - The command object containing the fields to update.
   * @param userId - The ID of the user updating the event.
   * @returns A promise that resolves to the updated event DTO.
   * @throws {ServiceError} If the event is not found, validation fails, or a database error occurs.
   */
  static async updateEvent(
    supabase: SupabaseClient,
    eventId: string,
    cmd: UpdateEventCommand,
    userId: string
  ): Promise<EventDto> {
    // First, fetch the current state of the event to fill in any missing fields in the command.
    const currentEvent = await this.getEventById(supabase, eventId, userId);

    if (currentEvent.analysis_status === "completed") {
      throw new ServiceError("Cannot update an event that has already been analyzed.", 403);
    }

    // Merge the current event data with the update command.
    const mergedData = {
      title: cmd.title ?? currentEvent.title,
      description: cmd.description ?? currentEvent.description,
      event_date: cmd.event_date ?? currentEvent.event_date,
      participant_ids: cmd.participant_ids ?? currentEvent.participants.map((p) => p.id),
    };

    const { error } = await supabase.rpc("update_event_with_participants", {
      p_event_id: eventId,
      p_user_id: userId,
      p_title: mergedData.title,
      p_description: (mergedData.description ?? null) as unknown as string,
      p_event_date: (mergedData.event_date ?? null) as unknown as string,
      p_participant_ids: mergedData.participant_ids,
    });

    if (error) {
      console.error(`Error calling update_event_with_participants RPC for event ${eventId}:`, error);
      if (error.message.includes("Event not found")) {
        throw new ServiceError("Event not found.", 404);
      }
      if (error.message.includes("User is not authorized")) {
        throw new ServiceError("User is not authorized to update this event.", 403);
      }
      if (error.message.includes("One or more participants not found")) {
        throw new ServiceError("One or more participants not found or do not belong to the user.", 404);
      }
      throw new ServiceError("An unexpected error occurred while updating the event.", 500);
    }

    return this.getEventById(supabase, eventId, userId);
  }

  /**
   * Deletes an event by its ID.
   *
   * @param supabase - The Supabase client instance.
   * @param eventId - The ID of the event to delete.
   * @param userId - The ID of the user attempting to delete the event.
   * @throws {ServiceError} If the event is not found, the user is not the owner, or a database error occurs.
   */
  static async deleteEvent(supabase: SupabaseClient, eventId: string, userId: string): Promise<void> {
    // 1. Fetch the event to verify ownership
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("user_id")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new ServiceError("Event not found.", 404);
      }
      console.error(`Error fetching event ${eventId} for deletion:`, fetchError);
      throw new ServiceError("Could not fetch event to delete.", 500);
    }

    // 2. Check for ownership
    if (event.user_id !== userId) {
      throw new ServiceError("User is not authorized to delete this event.", 403);
    }

    // 3. Delete the event
    const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId);

    if (deleteError) {
      console.error(`Error deleting event ${eventId}:`, deleteError);
      throw new ServiceError("Could not delete the event.", 500);
    }
  }

  static async getEvents(
    supabase: SupabaseClient,
    userId: string,
    options: GetEventsOptions
  ): Promise<PaginatedResponseDto<EventDto>> {
    const { page, pageSize, sortBy, order } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Renamed 'characters' to 'participants' for clarity in the query result.
    const { data, error } = await supabase
      .from("events")
      .select(
        `*,
        participants:event_participants(
          character:characters(id, name, role, avatar_url, is_owner, last_interacted_at, updated_at)
        )`
      )
      .eq("user_id", userId)
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching events:", error);
      throw new ServiceError("Failed to fetch events.", 500);
    }

    const { count, error: countError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting events:", countError);
      throw new ServiceError("Failed to count events.", 500);
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const events =
      data?.map((row: any) => {
        const { participants, ...event } = row;
        return {
          ...event,
          participants: (participants ?? []).map((p: any) => p.character).filter(Boolean) || [],
        };
      }) ?? [];

    return {
      data: events as EventDto[],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
}

export const getEvents = async (
  supabase: SupabaseClient,
  userId: string,
  options: GetEventsOptions
): Promise<PaginatedResponseDto<EventDto>> => {
  const { page, pageSize, sortBy, order } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("events")
    .select("*, characters(id, name, role, avatar_url, is_owner, last_interacted_at)")
    .eq("user_id", userId)
    .order(sortBy, { ascending: order === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events.");
  }

  const { count, error: countError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.error("Error counting events:", countError);
    throw new Error("Failed to count events.");
  }

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const events =
    data?.map((row: any) => {
      const { participants, ...event } = row;
      return {
        ...event,
        participants: participants || [],
      };
    }) ?? [];

  return {
    data: events as EventDto[],
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};
