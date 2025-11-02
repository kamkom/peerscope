# API Endpoint Implementation Plan: List analyses for an event

## 1. Przegląd punktu końcowego

Ten punkt końcowy (`GET /api/events/{id}/analyses`) umożliwia pobranie listy wszystkich analiz AI powiązanych z konkretnym wydarzeniem. Dostęp jest ograniczony do uwierzytelnionych użytkowników, którzy są właścicielami danego wydarzenia. Każdy element na liście będzie zawierał szczegóły analizy, takie jak jej typ, wynik oraz opcjonalne ostrzeżenie o nieaktualnych danych.

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/events/{id}/analyses`
- **Parametry**:
  - **Wymagane**:
    - `id` (w ścieżce URL): Identyfikator UUID wydarzenia.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak (dla metody `GET`).

## 3. Wykorzystywane typy

Do strukturyzowania danych odpowiedzi zostanie użyty następujący typ DTO z pliku `src/types.ts`:

```typescript
export type AiAnalysisDto = Tables<"ai_analyses"> & {
  outdated_data_warning?: string;
};
```

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`200 OK`)**:
  - **Content-Type**: `application/json`
  - **Body**: Tablica obiektów typu `AiAnalysisDto`.
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "user_id": "user-uuid-goes-here",
      "event_id": "event-uuid-goes-here",
      "character_id": null,
      "analysis_type": "mediation",
      "result": {
        "summary": "A brief summary of the mediation analysis.",
        "suggestions": ["Suggestion 1 for mediation.", "Suggestion 2 for mediation."]
      },
      "feedback": null,
      "created_at": "2025-10-26T10:00:00Z",
      "updated_at": "2025-10-26T10:00:00Z",
      "outdated_data_warning": "Participant data may be outdated."
    }
  ]
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowy format `id` wydarzenia.
  - `401 Unauthorized`: Brak uwierzytelnienia użytkownika.
  - `404 Not Found`: Wydarzenie o podanym `id` nie istnieje lub nie należy do zalogowanego użytkownika.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych

1.  Klient wysyła żądanie `GET` na adres `/api/events/{id}/analyses`.
2.  Middleware Astro weryfikuje sesję użytkownika na podstawie tokena i dołącza obiekt `user` oraz klienta `supabase` do `context.locals`.
3.  Handler API w pliku `src/pages/api/events/[id]/analyses.ts` jest wywoływany.
4.  Handler sprawdza, czy `context.locals.user` istnieje. Jeśli nie, zwraca `401 Unauthorized`.
5.  Handler używa Zod do walidacji parametru `id` z URL. Jeśli jest nieprawidłowy, zwraca `400 Bad Request`.
6.  Handler wywołuje metodę serwisową `EventService.getEventAnalyses(supabase, eventId, userId)`.
7.  Metoda serwisowa wykonuje zapytanie do tabeli `ai_analyses` w bazie danych Supabase, filtrując wyniki po `event_id` oraz `user_id`, aby zapewnić, że użytkownik ma dostęp tylko do swoich danych.
8.  Serwis przetwarza wyniki, potencjalnie dodając `outdated_data_warning`, i zwraca je do handlera API.
9.  Handler API tworzy odpowiedź `200 OK` z danymi w formacie JSON i odsyła ją do klienta.
10. W przypadku błędu na którymkolwiek etapie, proces jest przerywany i zwracany jest odpowiedni kod statusu błędu.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Każde żądanie musi być uwierzytelnione. Middleware jest odpowiedzialne za weryfikację tokena sesji. Endpoint musi bezwzględnie odrzucać żądania bez prawidłowej sesji.
- **Autoryzacja**: Logika w warstwie serwisowej musi zapewnić, że zapytanie do bazy danych jest ściśle powiązane z ID zalogowanego użytkownika (`user_id`). Uniemożliwi to dostęp do analiz wydarzeń należących do innych użytkowników (ochrona przed atakami IDOR).
- **Walidacja danych wejściowych**: Parametr `id` musi być walidowany jako UUID, aby zapobiec błędom zapytań do bazy danych.

## 7. Rozważania dotyczące wydajności

- **Indeksowanie bazy danych**: Aby zapewnić szybkie wyszukiwanie, należy upewnić się, że w tabeli `ai_analyses` istnieje złożony indeks na kolumnach `(event_id, user_id)`.
- **Paginacja**: Obecna specyfikacja nie wymaga paginacji. Jeśli jednak liczba analiz dla jednego wydarzenia może być duża, należy w przyszłości rozważyć jej implementację.

## 8. Etapy wdrożenia

1.  **Baza danych**:
    - Sprawdzić, czy w tabeli `ai_analyses` istnieje indeks na `(event_id, user_id)`. Jeśli nie, dodać odpowiednią migrację.

2.  **Warstwa serwisowa (`src/lib/services/event.service.ts`)**:
    - Dodać nową, asynchroniczną metodę `getEventAnalyses(supabase: SupabaseClient, eventId: string, userId: string): Promise<AiAnalysisDto[]>`.
    - Wewnątrz metody zaimplementować zapytanie do Supabase w celu pobrania analiz, filtrując po `event_id` i `user_id`.
    - Dodać logikę sprawdzającą, czy dane uczestników wydarzenia nie były aktualizowane po utworzeniu analizy i w razie potrzeby dodać `outdated_data_warning`.
    - Obsłużyć przypadki, gdy wydarzenie nie zostanie znalezione dla danego użytkownika (np. rzucając dedykowany błąd lub zwracając `null`).

3.  **Warstwa API (`src/pages/api/events/[id]/analyses.ts`)**:
    - Utworzyć nowy plik dla endpointu.
    - Dodać `export const prerender = false;`.
    - Zaimplementować handler `GET({ params, locals })`.
    - Sprawdzić istnienie `locals.user`. Jeśli brak, zwrócić `401`.
    - Zwalidować `params.id` przy użyciu `z.string().uuid()`. W razie błędu zwrócić `400`.
    - Wywołać metodę `EventService.getEventAnalyses` z klientem Supabase z `locals.supabase` oraz danymi użytkownika i wydarzenia.
    - Obsłużyć błędy z warstwy serwisowej (np. jeśli wydarzenie nie istnieje, zwrócić `404`).
    - W przypadku sukcesu, zwrócić odpowiedź JSON z kodem `200` i listą analiz.
    - Dodać blok `try...catch` do obsługi nieoczekiwanych błędów serwera i zwracania `500`.
