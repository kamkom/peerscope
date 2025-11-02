# API Endpoint Implementation Plan: Create Character

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom tworzenie nowego profilu postaci. Po pomyślnym utworzeniu zwraca pełny obiekt nowo utworzonej postaci.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/characters`
- **Parametry**: Brak parametrów w URL.
- **Ciało żądania**: Wymagany jest obiekt JSON o następującej strukturze:
  ```json
  {
    "name": "string (wymagane)",
    "role": "string (opcjonalne)",
    "description": "string (opcjonalne)",
    "traits": "string[] (opcjonalne)",
    "motivations": "string[] (opcjonalne)",
    "avatar_url": "string (URL, opcjonalne)",
    "is_owner": "boolean (wymagane)"
  }
  ```

## 3. Wykorzystywane typy

- **`CreateCharacterCommand`**: (`src/types.ts`) Używany do definicji struktury i walidacji ciała żądania.
- **`CharacterDto`**: (`src/types.ts`) Używany do definicji struktury obiektu zwracanego w odpowiedzi.

## 4. Szczegóły odpowiedzi

- **Kod sukcesu**: `201 Created`
- **Payload sukcesu**: Obiekt JSON reprezentujący nowo utworzoną postać, zgodny z typem `CharacterDto`.
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "John Smith",
    "role": "Coworker",
    "description": "Met at the new company.",
    "traits": ["Helpful", "Quiet"],
    "motivations": ["Promotion"],
    "avatar_url": "https://...",
    "is_owner": false,
    "last_interacted_at": null,
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "deleted_at": null
  }
  ```
- **Kody błędów**: `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`.

## 5. Przepływ danych

1. Klient wysyła żądanie `POST` na adres `/api/characters` z danymi postaci w ciele żądania.
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token sesji Supabase. Jeśli jest nieprawidłowy, zwraca `401`. W przeciwnym razie dołącza dane użytkownika do `Astro.locals`.
3. Handler API w `src/pages/api/characters.ts` przetwarza żądanie.
4. Ciało żądania jest parsowane i walidowane za pomocą schematu Zod opartego na `CreateCharacterCommand`. W przypadku błędu walidacji zwracany jest status `400`.
5. Z `Astro.locals` pobierany jest identyfikator `user_id` uwierzytelnionego użytkownika.
6. Wywoływana jest metoda `characterService.createCharacter(validatedData, userId)` z nowego serwisu `CharacterService`.
7. `CharacterService` używa klienta Supabase do wstawienia nowego rekordu do tabeli `characters` w bazie danych.
8. Serwis zwraca nowo utworzony obiekt postaci pobrany z bazy danych.
9. Handler API otrzymuje obiekt, tworzy odpowiedź z kodem `201 Created` i zwraca obiekt postaci w formacie JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Każde żądanie musi być uwierzytelnione za pomocą ważnego tokenu sesji Supabase, zweryfikowanego przez middleware.
- **Autoryzacja**: Identyfikator `user_id` dla nowej postaci musi być pobrany z obiektu sesji (`Astro.locals.user.id`), a nie z ciała żądania. Gwarantuje to, że użytkownicy mogą tworzyć postacie tylko na własnym koncie.
- **Walidacja danych wejściowych**: Wszystkie dane wejściowe z ciała żądania muszą być rygorystycznie walidowane przy użyciu Zod, aby zapobiec błędom i atakom (np. XSS, chociaż frameworki frontendowe zapewniają podstawową ochronę). Należy sprawdzić, czy `avatar_url` jest poprawnym formatem URL.

## 7. Obsługa błędów

- **`400 Bad Request`**: Zwracany, gdy ciało żądania ma nieprawidłowy format JSON lub nie przechodzi walidacji Zod. Odpowiedź powinna zawierać szczegóły błędów walidacji.
- **`401 Unauthorized`**: Zwracany, gdy żądanie nie zawiera ważnego tokenu sesji.
- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów serwera, takich jak problemy z połączeniem z bazą danych. Błędy te powinny być logowane po stronie serwera w celu analizy.

## 8. Rozważania dotyczące wydajności

- Operacja jest prostym `INSERT`, więc nie przewiduje się problemów z wydajnością.
- Zapytanie do bazy danych jest pojedyncze i szybkie.
- Należy unikać wykonywania długotrwałych operacji (np. przetwarzanie obrazów, wysyłanie e-maili) synchronicznie w ramach tego żądania. Takie operacje powinny być obsługiwane asynchronicznie przez zadania w tle.

## 9. Etapy wdrożenia

1.  **Stworzenie schematu walidacji**: Utwórz plik `src/lib/schemas/character.schema.ts` i zdefiniuj w nim schemat Zod dla `CreateCharacterCommand`.
2.  **Stworzenie serwisu**: Utwórz plik `src/lib/services/character.service.ts`.
3.  **Implementacja logiki serwisu**: W `CharacterService` zaimplementuj metodę `createCharacter(data: CreateCharacterCommand, userId: string)`. Metoda ta powinna przyjmować zwalidowane dane i `userId`, a następnie używać klienta Supabase do zapisu danych w tabeli `characters`. Metoda powinna zwracać nowo utworzony obiekt `CharacterDto`.
4.  **Stworzenie punktu końcowego API**: Utwórz plik `src/pages/api/characters.ts`.
5.  **Implementacja handlera POST**: W pliku punktu końcowego zaimplementuj handler `POST`.
6.  **Logika handlera**:
    a. Sprawdź, czy użytkownik jest zalogowany, korzystając z `Astro.locals.user`. Jeśli nie, zwróć `401`.
    b. Sparsuj i zwaliduj ciało żądania za pomocą wcześniej utworzonego schematu Zod. W przypadku błędu zwróć `400`.
    c. Wywołaj metodę `characterService.createCharacter` z poprawnymi danymi.
    d. Zaimplementuj blok `try...catch` do obsługi błędów z warstwy serwisowej i bazy danych, zwracając `500` w razie potrzeby.
    e. W przypadku sukcesu, zwróć odpowiedź z kodem `201 Created` i nowo utworzonym obiektem postaci.
7.  **Konfiguracja renderowania**: Dodaj `export const prerender = false;` w pliku API, aby zapewnić, że jest on renderowany dynamicznie po stronie serwera.
