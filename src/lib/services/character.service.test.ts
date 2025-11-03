import { describe, it, expect, beforeEach, vi, type MockedFunction } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CharacterService } from "./character.service";
import type {
  CharacterDto,
  CreateCharacterCommand,
  UpdateCharacterCommand,
  PaginatedResponseDto,
  CharacterListItemDto,
} from "../../types";

// Mock types for Supabase query builder chain
type MockSupabaseQueryBuilder = {
  select: MockedFunction<any>;
  insert: MockedFunction<any>;
  update: MockedFunction<any>;
  delete: MockedFunction<any>;
  eq: MockedFunction<any>;
  in: MockedFunction<any>;
  is: MockedFunction<any>;
  order: MockedFunction<any>;
  range: MockedFunction<any>;
  single: MockedFunction<any>;
  maybeSingle: MockedFunction<any>;
};

type MockSupabaseClient = {
  from: MockedFunction<any>;
  rpc: MockedFunction<any>;
} & Partial<SupabaseClient>;

// Mock data factories
const createMockCharacter = (overrides?: Partial<CharacterDto>): CharacterDto => {
  const now = new Date().toISOString();
  return {
    id: "char-123",
    name: "Test Character",
    role: "Test Role",
    description: "Test Description",
    traits: ["trait1", "trait2"],
    motivations: ["motivation1"],
    avatar_url: "https://example.com/avatar.jpg",
    is_owner: false,
    created_at: now,
    updated_at: now,
    last_interacted_at: null,
    user_id: "user-123",
    deleted_at: null,
    ...overrides,
  };
};

const createMockCharacterListItem = (overrides?: Partial<CharacterListItemDto>): CharacterListItemDto => {
  const now = new Date().toISOString();
  return {
    id: "char-123",
    name: "Test Character",
    role: "Test Role",
    avatar_url: "https://example.com/avatar.jpg",
    is_owner: false,
    last_interacted_at: now,
    ...overrides,
  };
};

const createMockCreateCharacterCommand = (overrides?: Partial<CreateCharacterCommand>): CreateCharacterCommand => {
  return {
    name: "New Character",
    role: "New Role",
    description: "New Description",
    traits: ["trait1"],
    motivations: ["motivation1"],
    avatar_url: "https://example.com/avatar.jpg",
    ...overrides,
  };
};

const createMockUpdateCharacterCommand = (overrides?: Partial<UpdateCharacterCommand>): UpdateCharacterCommand => {
  return {
    name: "Updated Character",
    ...overrides,
  };
};

// Helper to create a query builder with chainable methods
const createQueryBuilder = () => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: null, error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return builder;
};

// Mock Supabase client builder
// This creates a flexible mock that allows for chaining query builder methods
const createMockSupabaseClient = (): MockSupabaseClient => {
  const rpcMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const fromMock = vi.fn().mockImplementation(() => createQueryBuilder());

  return {
    from: fromMock,
    rpc: rpcMock,
  } as MockSupabaseClient;
};

describe("CharacterService", () => {
  let mockSupabase: MockSupabaseClient;
  const testUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
  });

  describe("createCharacter", () => {
    it("powinien utworzyć postać z powodzeniem z wszystkimi wymaganymi polami", async () => {
      // Arrange
      const characterData = createMockCreateCharacterCommand();
      const mockCharacter = createMockCharacter();
      const queryBuilder = createQueryBuilder();
      queryBuilder.insert.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: mockCharacter, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.createCharacter(mockSupabase as any, characterData, testUserId);

      // Assert
      expect(result).toEqual(mockCharacter);
      expect(mockSupabase.from).toHaveBeenCalledWith("characters");
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        ...characterData,
        user_id: testUserId,
      });
      expect(queryBuilder.select).toHaveBeenCalled();
      expect(queryBuilder.single).toHaveBeenCalled();
    });

    it("powinien rzucić błąd gdy operacja na bazie danych nie powiedzie się", async () => {
      // Arrange
      const characterData = createMockCreateCharacterCommand();
      const dbError = { message: "Database error", code: "23505" };
      const queryBuilder = createQueryBuilder();
      queryBuilder.insert.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: dbError });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.createCharacter(mockSupabase as any, characterData, testUserId)).rejects.toThrow(
        "Failed to create character in the database."
      );
    });

    it("powinien rzucić błąd gdy baza danych nie zwraca utworzonej postaci", async () => {
      // Arrange
      const characterData = createMockCreateCharacterCommand();
      const queryBuilder = createQueryBuilder();
      queryBuilder.insert.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.createCharacter(mockSupabase as any, characterData, testUserId)).rejects.toThrow(
        "Database did not return the created character."
      );
    });

    it("powinien zawierać user_id w danych postaci", async () => {
      // Arrange
      const characterData = createMockCreateCharacterCommand();
      const mockCharacter = createMockCharacter();
      const queryBuilder = createQueryBuilder();
      queryBuilder.insert.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: mockCharacter, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      await CharacterService.createCharacter(mockSupabase as any, characterData, testUserId);

      // Assert
      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: testUserId,
        })
      );
    });
  });

  describe("getProfileByUserId", () => {
    it("powinien zwrócić profil gdy istnieje", async () => {
      // Arrange
      const mockProfile = createMockCharacter({ is_owner: true });
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.maybeSingle.mockResolvedValue({ data: mockProfile, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.getProfileByUserId(mockSupabase as any, testUserId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("characters");
      expect(queryBuilder.select).toHaveBeenCalledWith("*");
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", testUserId);
      expect(queryBuilder.eq).toHaveBeenCalledWith("is_owner", true);
      expect(queryBuilder.is).toHaveBeenCalledWith("deleted_at", null);
      expect(queryBuilder.maybeSingle).toHaveBeenCalled();
    });

    it("powinien zwrócić null gdy profil nie istnieje", async () => {
      // Arrange
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.getProfileByUserId(mockSupabase as any, testUserId);

      // Assert
      expect(result).toBeNull();
    });

    it("powinien rzucić błąd gdy operacja na bazie danych nie powiedzie się", async () => {
      // Arrange
      const dbError = { message: "Database error", code: "PGRST301" };
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.maybeSingle.mockResolvedValue({ data: null, error: dbError });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.getProfileByUserId(mockSupabase as any, testUserId)).rejects.toThrow(
        "Failed to fetch profile from the database."
      );
    });
  });

  describe("upsertProfile", () => {
    it("powinien utworzyć nowy profil gdy profil nie istnieje", async () => {
      // Arrange
      const profileData = createMockCreateCharacterCommand();
      const newProfile = createMockCharacter({ is_owner: true });
      const getProfileQueryBuilder = createQueryBuilder();
      getProfileQueryBuilder.select.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.eq.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.is.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });

      const insertQueryBuilder = createQueryBuilder();
      insertQueryBuilder.insert.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.select.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.single.mockResolvedValue({ data: newProfile, error: null });

      mockSupabase.from.mockReturnValueOnce(getProfileQueryBuilder).mockReturnValueOnce(insertQueryBuilder);

      // Act
      const result = await CharacterService.upsertProfile(mockSupabase as any, testUserId, profileData);

      // Assert
      expect(result).toEqual(newProfile);
      expect(insertQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...profileData,
          user_id: testUserId,
          is_owner: true,
        })
      );
    });

    it("powinien zaktualizować istniejący profil gdy profil istnieje", async () => {
      // Arrange
      const profileData = createMockCreateCharacterCommand({ name: "Updated Profile" });
      const existingProfile = createMockCharacter({ id: "profile-123", is_owner: true });
      const updatedProfile = createMockCharacter({ id: "profile-123", name: "Updated Profile", is_owner: true });

      const getProfileQueryBuilder = createQueryBuilder();
      getProfileQueryBuilder.select.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.eq.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.is.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.maybeSingle.mockResolvedValue({ data: existingProfile, error: null });

      const updateQueryBuilder = createQueryBuilder();
      updateQueryBuilder.update.mockReturnValue(updateQueryBuilder);
      updateQueryBuilder.select.mockReturnValue(updateQueryBuilder);
      updateQueryBuilder.eq.mockReturnValue(updateQueryBuilder);
      updateQueryBuilder.is.mockReturnValue(updateQueryBuilder);
      updateQueryBuilder.single.mockResolvedValue({ data: updatedProfile, error: null });

      mockSupabase.from.mockReturnValueOnce(getProfileQueryBuilder).mockReturnValueOnce(updateQueryBuilder);

      // Act
      const result = await CharacterService.upsertProfile(mockSupabase as any, testUserId, profileData);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(updateQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...profileData,
          user_id: testUserId,
          is_owner: true,
        })
      );
      expect(updateQueryBuilder.eq).toHaveBeenCalledWith("id", existingProfile.id);
    });

    it("powinien rzucić błąd gdy tworzenie profilu nie powiedzie się", async () => {
      // Arrange
      const profileData = createMockCreateCharacterCommand();
      const dbError = { message: "Database error", code: "23505" };

      const getProfileQueryBuilder = createQueryBuilder();
      getProfileQueryBuilder.select.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.eq.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.is.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });

      const insertQueryBuilder = createQueryBuilder();
      insertQueryBuilder.insert.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.select.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.single.mockResolvedValue({ data: null, error: dbError });

      mockSupabase.from.mockReturnValueOnce(getProfileQueryBuilder).mockReturnValueOnce(insertQueryBuilder);

      // Act & Assert
      await expect(CharacterService.upsertProfile(mockSupabase as any, testUserId, profileData)).rejects.toThrow(
        "Failed to create profile in the database."
      );
    });

    it("powinien rzucić błąd gdy baza danych nie zwraca utworzonego profilu", async () => {
      // Arrange
      const profileData = createMockCreateCharacterCommand();

      const getProfileQueryBuilder = createQueryBuilder();
      getProfileQueryBuilder.select.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.eq.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.is.mockReturnValue(getProfileQueryBuilder);
      getProfileQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });

      const insertQueryBuilder = createQueryBuilder();
      insertQueryBuilder.insert.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.select.mockReturnValue(insertQueryBuilder);
      insertQueryBuilder.single.mockResolvedValue({ data: null, error: null });

      mockSupabase.from.mockReturnValueOnce(getProfileQueryBuilder).mockReturnValueOnce(insertQueryBuilder);

      // Act & Assert
      await expect(CharacterService.upsertProfile(mockSupabase as any, testUserId, profileData)).rejects.toThrow(
        "Database did not return the created profile."
      );
    });
  });

  describe("getCharacters", () => {
    it("powinien zwrócić postaci z paginacją z poprawną strukturą", async () => {
      // Arrange
      const page = 1;
      const pageSize = 10;
      const sortBy = "name" as const;
      const order = "asc" as const;
      const totalItems = 25;
      const mockCharacters = Array.from({ length: 10 }, (_, i) =>
        createMockCharacterListItem({ id: `char-${i}`, name: `Character ${i}` })
      );

      // Mock count query - first call to from() for count
      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: totalItems, error: null });

      // Mock data query - second call to from() for data
      const dataQueryBuilder = createQueryBuilder();
      dataQueryBuilder.select.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.eq.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.is.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.order.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.range.mockResolvedValue({ data: mockCharacters, error: null });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder).mockReturnValueOnce(dataQueryBuilder);

      // Act
      const result = await CharacterService.getCharacters({
        supabase: mockSupabase as any,
        userId: testUserId,
        page,
        pageSize,
        sortBy,
        order,
      });

      // Assert
      expect(result.data).toEqual(mockCharacters);
      expect(result.pagination.page).toBe(page);
      expect(result.pagination.pageSize).toBe(pageSize);
      expect(result.pagination.totalItems).toBe(totalItems);
      expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10) = 3
      expect(dataQueryBuilder.range).toHaveBeenCalledWith(0, 9); // (page-1)*pageSize to page*pageSize-1
    });

    it("powinien zwrócić pustą tablicę gdy nie ma postaci", async () => {
      // Arrange
      const page = 1;
      const pageSize = 10;
      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: 0, error: null });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder);

      // Act
      const result = await CharacterService.getCharacters({
        supabase: mockSupabase as any,
        userId: testUserId,
        page,
        pageSize,
        sortBy: "name",
        order: "asc",
      });

      // Assert
      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("powinien obsłużyć paginację dla różnych stron", async () => {
      // Arrange
      const page = 2;
      const pageSize = 10;
      const totalItems = 25;
      const mockCharacters = Array.from({ length: 10 }, (_, i) =>
        createMockCharacterListItem({ id: `char-${i + 10}` })
      );

      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: totalItems, error: null });

      const dataQueryBuilder = createQueryBuilder();
      dataQueryBuilder.select.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.eq.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.is.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.order.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.range.mockResolvedValue({ data: mockCharacters, error: null });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder).mockReturnValueOnce(dataQueryBuilder);

      // Act
      const result = await CharacterService.getCharacters({
        supabase: mockSupabase as any,
        userId: testUserId,
        page,
        pageSize,
        sortBy: "name",
        order: "asc",
      });

      // Assert
      expect(result.data).toEqual(mockCharacters);
      expect(result.pagination.page).toBe(page);
      expect(dataQueryBuilder.range).toHaveBeenCalledWith(10, 19); // (2-1)*10 to 2*10-1
    });

    it("powinien obsłużyć sortowanie po nazwie rosnąco", async () => {
      // Arrange
      const sortBy = "name" as const;
      const order = "asc" as const;

      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: 10, error: null });

      const dataQueryBuilder = createQueryBuilder();
      dataQueryBuilder.select.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.eq.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.is.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.order.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.range.mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder).mockReturnValueOnce(dataQueryBuilder);

      // Act
      await CharacterService.getCharacters({
        supabase: mockSupabase as any,
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortBy,
        order,
      });

      // Assert
      expect(dataQueryBuilder.order).toHaveBeenCalledWith("name", { ascending: true });
    });

    it("powinien obsłużyć sortowanie po last_interacted_at malejąco", async () => {
      // Arrange
      const sortBy = "last_interacted_at" as const;
      const order = "desc" as const;

      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: 10, error: null });

      const dataQueryBuilder = createQueryBuilder();
      dataQueryBuilder.select.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.eq.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.is.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.order.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.range.mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder).mockReturnValueOnce(dataQueryBuilder);

      // Act
      await CharacterService.getCharacters({
        supabase: mockSupabase as any,
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortBy,
        order,
      });

      // Assert
      expect(dataQueryBuilder.order).toHaveBeenCalledWith("last_interacted_at", { ascending: false });
    });

    it("powinien rzucić błąd gdy zapytanie o liczbę nie powiedzie się", async () => {
      // Arrange
      const countError = { message: "Count error", code: "PGRST301" };
      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: null, error: countError });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder);

      // Act & Assert
      await expect(
        CharacterService.getCharacters({
          supabase: mockSupabase as any,
          userId: testUserId,
          page: 1,
          pageSize: 10,
          sortBy: "name",
          order: "asc",
        })
      ).rejects.toThrow("Failed to fetch character count.");
    });

    it("powinien rzucić błąd gdy zapytanie o dane nie powiedzie się", async () => {
      // Arrange
      const dataError = { message: "Data error", code: "PGRST301" };

      const countQueryBuilder = createQueryBuilder();
      countQueryBuilder.select.mockReturnValue(countQueryBuilder);
      countQueryBuilder.eq.mockReturnValue(countQueryBuilder);
      countQueryBuilder.is.mockResolvedValue({ count: 10, error: null });

      const dataQueryBuilder = createQueryBuilder();
      dataQueryBuilder.select.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.eq.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.is.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.order.mockReturnValue(dataQueryBuilder);
      dataQueryBuilder.range.mockResolvedValue({ data: null, error: dataError });

      mockSupabase.from.mockReturnValueOnce(countQueryBuilder).mockReturnValueOnce(dataQueryBuilder);

      // Act & Assert
      await expect(
        CharacterService.getCharacters({
          supabase: mockSupabase as any,
          userId: testUserId,
          page: 1,
          pageSize: 10,
          sortBy: "name",
          order: "asc",
        })
      ).rejects.toThrow("Failed to fetch characters.");
    });
  });

  describe("getCharacterById", () => {
    it("powinien zwrócić postać gdy istnieje", async () => {
      // Arrange
      const characterId = "char-123";
      const mockCharacter = createMockCharacter({ id: characterId });
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: mockCharacter, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.getCharacterById(mockSupabase as any, characterId, testUserId);

      // Assert
      expect(result).toEqual(mockCharacter);
      expect(mockSupabase.from).toHaveBeenCalledWith("characters");
      expect(queryBuilder.select).toHaveBeenCalledWith("*");
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", characterId);
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", testUserId);
      expect(queryBuilder.is).toHaveBeenCalledWith("deleted_at", null);
      expect(queryBuilder.single).toHaveBeenCalled();
    });

    it("powinien rzucić błąd gdy postać nie istnieje", async () => {
      // Arrange
      const characterId = "char-999";
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.getCharacterById(mockSupabase as any, characterId, testUserId)).rejects.toThrow(
        "Character not found."
      );
    });

    it("powinien rzucić błąd gdy operacja na bazie danych nie powiedzie się", async () => {
      // Arrange
      const characterId = "char-123";
      const dbError = { message: "Database error", code: "PGRST116" };
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: dbError });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.getCharacterById(mockSupabase as any, characterId, testUserId)).rejects.toThrow(
        "Failed to fetch character from the database."
      );
    });
  });

  describe("getCharactersByIds", () => {
    it("powinien zwrócić postaci gdy istnieją", async () => {
      // Arrange
      const characterIds = ["char-1", "char-2", "char-3"];
      const mockCharacters = characterIds.map((id) => createMockCharacter({ id }));
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.in.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      // .is() is the last method in the chain, so it should return a Promise
      queryBuilder.is.mockResolvedValue({ data: mockCharacters, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.getCharactersByIds(mockSupabase as any, characterIds, testUserId);

      // Assert
      expect(result).toEqual(mockCharacters);
      expect(mockSupabase.from).toHaveBeenCalledWith("characters");
      expect(queryBuilder.select).toHaveBeenCalledWith("*");
      expect(queryBuilder.in).toHaveBeenCalledWith("id", characterIds);
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", testUserId);
      expect(queryBuilder.is).toHaveBeenCalledWith("deleted_at", null);
    });

    it("powinien zwrócić pustą tablicę gdy podano pustą tablicę ID", async () => {
      // Act
      const result = await CharacterService.getCharactersByIds(mockSupabase as any, [], testUserId);

      // Assert
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("powinien zwrócić pustą tablicę gdy characterIds jest null", async () => {
      // Act
      const result = await CharacterService.getCharactersByIds(mockSupabase as any, null as any, testUserId);

      // Assert
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("powinien zwrócić pustą tablicę gdy characterIds jest undefined", async () => {
      // Act
      const result = await CharacterService.getCharactersByIds(mockSupabase as any, undefined as any, testUserId);

      // Assert
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("powinien zwrócić pustą tablicę gdy baza danych zwraca null", async () => {
      // Arrange
      const characterIds = ["char-1"];
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.in.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.getCharactersByIds(mockSupabase as any, characterIds, testUserId);

      // Assert
      expect(result).toEqual([]);
    });

    it("powinien rzucić błąd gdy operacja na bazie danych nie powiedzie się", async () => {
      // Arrange
      const characterIds = ["char-1", "char-2"];
      const dbError = { message: "Database error", code: "PGRST301" };
      const queryBuilder = createQueryBuilder();
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.in.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockResolvedValue({ data: null, error: dbError });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(CharacterService.getCharactersByIds(mockSupabase as any, characterIds, testUserId)).rejects.toThrow(
        "Failed to fetch characters from the database."
      );
    });
  });

  describe("updateCharacter", () => {
    it("powinien zaktualizować postać z powodzeniem", async () => {
      // Arrange
      const characterId = "char-123";
      const updateData = createMockUpdateCharacterCommand({ name: "Updated Name" });
      const updatedCharacter = createMockCharacter({ id: characterId, name: "Updated Name" });
      const queryBuilder = createQueryBuilder();
      queryBuilder.update.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: updatedCharacter, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act
      const result = await CharacterService.updateCharacter(mockSupabase as any, characterId, updateData, testUserId);

      // Assert
      expect(result).toEqual(updatedCharacter);
      expect(mockSupabase.from).toHaveBeenCalledWith("characters");
      expect(queryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", characterId);
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", testUserId);
      expect(queryBuilder.is).toHaveBeenCalledWith("deleted_at", null);
      expect(queryBuilder.select).toHaveBeenCalled();
      expect(queryBuilder.single).toHaveBeenCalled();
    });

    it("powinien rzucić błąd gdy operacja na bazie danych nie powiedzie się", async () => {
      // Arrange
      const characterId = "char-123";
      const updateData = createMockUpdateCharacterCommand();
      const dbError = { message: "Database error", code: "PGRST301" };
      const queryBuilder = createQueryBuilder();
      queryBuilder.update.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: dbError });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(
        CharacterService.updateCharacter(mockSupabase as any, characterId, updateData, testUserId)
      ).rejects.toThrow("Failed to update character in the database.");
    });

    it("powinien rzucić błąd gdy baza danych nie zwraca zaktualizowanej postaci", async () => {
      // Arrange
      const characterId = "char-123";
      const updateData = createMockUpdateCharacterCommand();
      const queryBuilder = createQueryBuilder();
      queryBuilder.update.mockReturnValue(queryBuilder);
      queryBuilder.select.mockReturnValue(queryBuilder);
      queryBuilder.eq.mockReturnValue(queryBuilder);
      queryBuilder.is.mockReturnValue(queryBuilder);
      queryBuilder.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValueOnce(queryBuilder);

      // Act & Assert
      await expect(
        CharacterService.updateCharacter(mockSupabase as any, characterId, updateData, testUserId)
      ).rejects.toThrow("Database did not return the updated character.");
    });
  });

  describe("deleteCharacter", () => {
    it("powinien usunąć postać z powodzeniem", async () => {
      // Arrange
      const characterId = "char-123";
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await CharacterService.deleteCharacter(mockSupabase as any, characterId, testUserId);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockSupabase.rpc).toHaveBeenCalledWith("soft_delete_character", {
        p_character_id: characterId,
      });
    });

    it("powinien zwrócić błąd 404 gdy postać nie została znaleziona (PGRST116)", async () => {
      // Arrange
      const characterId = "char-999";
      const notFoundError = { message: "Not found", code: "PGRST116" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: notFoundError });

      // Act
      const result = await CharacterService.deleteCharacter(mockSupabase as any, characterId, testUserId);

      // Assert
      expect(result).toEqual({
        success: false,
        error: {
          status: 404,
          message: "Character not found or you don't have permission to delete it.",
        },
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith("soft_delete_character", {
        p_character_id: characterId,
      });
    });

    it("powinien zwrócić błąd 500 gdy wystąpi nieoczekiwany błąd", async () => {
      // Arrange
      const characterId = "char-123";
      const unexpectedError = { message: "Unexpected error", code: "PGRST301" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: unexpectedError });

      // Act
      const result = await CharacterService.deleteCharacter(mockSupabase as any, characterId, testUserId);

      // Assert
      expect(result).toEqual({
        success: false,
        error: {
          status: 500,
          message: "An unexpected error occurred while deleting the character.",
        },
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith("soft_delete_character", {
        p_character_id: characterId,
      });
    });
  });
});
