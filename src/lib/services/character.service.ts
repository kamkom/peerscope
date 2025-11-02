import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CharacterDto,
  CreateCharacterCommand,
  UpdateCharacterCommand,
  PaginatedResponseDto,
  CharacterListItemDto,
} from "../../types";

type GetCharactersParams = {
  supabase: SupabaseClient;
  userId: string;
  page: number;
  pageSize: number;
  sortBy: "name" | "last_interacted_at";
  order: "asc" | "desc";
};

export class CharacterService {
  /**
   * Creates a new character for a given user.
   *
   * @param supabase - The Supabase client instance.
   * @param data - The validated data for the new character.
   * @param userId - The ID of the user creating the character.
   * @returns A promise that resolves to the newly created character DTO.
   * @throws Will throw an error if the database operation fails.
   */
  static async createCharacter(
    supabase: SupabaseClient,
    data: CreateCharacterCommand,
    userId: string
  ): Promise<CharacterDto> {
    const characterData = {
      ...data,
      user_id: userId,
    };

    const { data: newCharacter, error } = await supabase.from("characters").insert(characterData).select().single();

    if (error) {
      // TODO: Add logging for the error
      console.error("Error creating character:", error);
      throw new Error("Failed to create character in the database.");
    }

    if (!newCharacter) {
      throw new Error("Database did not return the created character.");
    }

    return newCharacter;
  }

  static async getProfileByUserId(supabase: SupabaseClient, userId: string): Promise<CharacterDto | null> {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", userId)
      .eq("is_owner", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Failed to fetch profile from the database.");
    }

    return data;
  }

  static async upsertProfile(
    supabase: SupabaseClient,
    userId: string,
    profileData: CreateCharacterCommand
  ): Promise<CharacterDto> {
    const characterData = {
      ...profileData,
      user_id: userId,
      is_owner: true,
    };

    const existingProfile = await this.getProfileByUserId(supabase, userId);

    if (existingProfile) {
      // Update existing profile
      return this.updateCharacter(supabase, existingProfile.id, characterData, userId);
    } else {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from("characters")
        .insert(characterData)
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        throw new Error("Failed to create profile in the database.");
      }

      if (!newProfile) {
        throw new Error("Database did not return the created profile.");
      }

      return newProfile;
    }
  }

  static async getCharacters({
    supabase,
    userId,
    page,
    pageSize,
    sortBy,
    order,
  }: GetCharactersParams): Promise<PaginatedResponseDto<CharacterListItemDto>> {
    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;
    const { count, error: countError } = await supabase
      .from("characters")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (countError) {
      console.error("Error fetching character count:", countError);
      throw new Error("Failed to fetch character count.");
    }

    const totalItems = count ?? 0;
    if (totalItems === 0) {
      return {
        data: [],
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    const totalPages = Math.ceil(totalItems / pageSize);

    const { data, error: dataError } = await supabase
      .from("characters")
      .select("id, name, role, avatar_url, is_owner, last_interacted_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (dataError) {
      console.error("Error fetching characters:", dataError);
      throw new Error("Failed to fetch characters.");
    }

    return {
      data: data as CharacterListItemDto[],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Gets a single character by ID for a given user.
   *
   * @param supabase - The Supabase client instance.
   * @param characterId - The ID of the character to fetch.
   * @param userId - The ID of the user who owns the character.
   * @returns A promise that resolves to the character DTO.
   * @throws Will throw an error if the character is not found or database operation fails.
   */
  static async getCharacterById(supabase: SupabaseClient, characterId: string, userId: string): Promise<CharacterDto> {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching character:", error);
      throw new Error("Failed to fetch character from the database.");
    }

    if (!data) {
      throw new Error("Character not found.");
    }

    return data;
  }

  /**
   * Gets multiple characters by their IDs for a given user.
   *
   * @param supabase - The Supabase client instance.
   * @param characterIds - An array of character IDs to fetch.
   * @param userId - The ID of the user who owns the characters.
   * @returns A promise that resolves to an array of character DTOs.
   * @throws Will throw an error if the database operation fails.
   */
  static async getCharactersByIds(
    supabase: SupabaseClient,
    characterIds: string[],
    userId: string
  ): Promise<CharacterDto[]> {
    if (!characterIds || characterIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .in("id", characterIds)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching characters by IDs:", error);
      throw new Error("Failed to fetch characters from the database.");
    }

    return data || [];
  }

  /**
   * Updates an existing character.
   *
   * @param supabase - The Supabase client instance.
   * @param characterId - The ID of the character to update.
   * @param data - The validated data for updating the character.
   * @param userId - The ID of the user who owns the character.
   * @returns A promise that resolves to the updated character DTO.
   * @throws Will throw an error if the database operation fails.
   */
  static async updateCharacter(
    supabase: SupabaseClient,
    characterId: string,
    data: UpdateCharacterCommand,
    userId: string
  ): Promise<CharacterDto> {
    const { data: updatedCharacter, error } = await supabase
      .from("characters")
      .update(data)
      .eq("id", characterId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      console.error("Error updating character:", error);
      throw new Error("Failed to update character in the database.");
    }

    if (!updatedCharacter) {
      throw new Error("Database did not return the updated character.");
    }

    return updatedCharacter;
  }

  /**
   * Soft-deletes a character by setting the 'deleted_at' timestamp.
   *
   * @param supabase The Supabase client instance.
   * @param characterId The ID of the character to delete.
   * @param userId The ID of the user performing the action.
   * @returns A promise that resolves to an object indicating success or failure.
   */
  static async deleteCharacter(
    supabase: SupabaseClient,
    characterId: string,
    // userId is no longer needed here as the check is done in the RLS policy and the RPC function.
    // However, we keep it in the function signature if other parts of the app expect it,
    // but it won't be used in the RPC call itself.
    userId: string
  ): Promise<{ success: boolean; error?: { status: 404 | 500; message: string } }> {
    const { error } = await supabase.rpc("soft_delete_character", { p_character_id: characterId });

    if (error) {
      console.error("Error soft-deleting character:", error);
      // Check if the error indicates the character was not found.
      // A custom error code or message from the function would be ideal.
      // For now, we'll assume a generic server error. A 404 would be better if we can infer it.
      if (error.code === "PGRST116") {
        // Not found
        return {
          success: false,
          error: { status: 404, message: "Character not found or you don't have permission to delete it." },
        };
      }
      return {
        success: false,
        error: { status: 500, message: "An unexpected error occurred while deleting the character." },
      };
    }

    return { success: true };
  }
}
