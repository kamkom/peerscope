import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// ============================================================================
// Generic & Pagination Types
// ============================================================================

/**
 * Represents the pagination details for paginated API responses.
 */
export type PaginationDto = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

/**
 * A generic wrapper for API responses that return a paginated list of items.
 * @template T The type of the items in the list.
 */
export type PaginatedResponseDto<T> = {
  data: T[];
  pagination: PaginationDto;
};

// ============================================================================
// Profile Types
// ============================================================================

/**
 * DTO for a user's profile. Directly maps to the `profiles` table.
 */
export type ProfileDto = Tables<"profiles">;

// ============================================================================
// Character Types
// ============================================================================

/**
 * DTO for a character item in a list. Contains a subset of the character's properties.
 */
export type CharacterListItemDto = Pick<
  Tables<"characters">,
  "id" | "name" | "role" | "avatar_url" | "is_owner" | "last_interacted_at"
>;

/**
 * DTO for a single, detailed character view. Maps to the `characters` table.
 */
export type CharacterDto = Tables<"characters">;

/**
 * Command model for creating a new character.
 * Based on `TablesInsert<'characters'>` but omits server-set fields like `user_id`.
 */
export type CreateCharacterCommand = Pick<
  TablesInsert<"characters">,
  "name" | "role" | "description" | "traits" | "motivations" | "avatar_url"
> & { is_owner?: boolean };

/**
 * Command model for updating an existing character.
 * All fields are optional.
 */
export type UpdateCharacterCommand = Partial<CreateCharacterCommand & Pick<Tables<"characters">, "last_interacted_at">>;

// ============================================================================
// Event Types
// ============================================================================

/**
 * DTO for an event, including its participants.
 * Extends the base `events` table type with an array of character list items.
 */
export type EventDto = Tables<"events"> & {
  participants: CharacterListItemDto[];
};

/**
 * Command model for creating a new event.
 * Includes an array of character IDs for participants, which is not in the `events` table.
 */
export type CreateEventCommand = Pick<TablesInsert<"events">, "title" | "event_date" | "description"> & {
  participant_ids: string[];
};

/**
 * Command model for updating an existing event.
 * All fields are optional.
 */
export type UpdateEventCommand = Partial<CreateEventCommand>;

// ============================================================================
// AI Analysis Types
// ============================================================================

/**
 * DTO for an AI analysis result.
 * May include a warning if the underlying character data is outdated.
 */
export type AiAnalysisDto = Tables<"ai_analyses"> & {
  outdated_data_warning?: string;
};

/**
 * Command model for running a 'mediation' analysis on an event.
 */
export type CreateEventAnalysisCommand = {
  analysis_type: "mediation";
};

/**
 * Command model for running a 'gift_suggestion' analysis on a character.
 */
export type CreateCharacterAnalysisCommand = {
  analysis_type: "gift_suggestion";
};

/**
 * Command model for submitting feedback for an AI analysis.
 * Feedback must be either 1 (positive) or -1 (negative).
 */
export type SubmitFeedbackCommand = {
  feedback: 1 | -1;
};

// ============================================================================
// Character Template Types
// ============================================================================

/**
 * DTO for a character description template. This is not a persistent entity.
 */
export type CharacterTemplateDto = {
  template: string;
};

// Propsy dla komponentu opisującego pojedynczą funkcję
export interface FeatureCardProps {
  icon: string; // Ścieżka do ikony SVG lub obrazka
  title: string;
  description: string;
}

// Propsy dla komponentu linku nawigacyjnego
export interface NavLinkProps {
  href: string;
  text: string;
}
