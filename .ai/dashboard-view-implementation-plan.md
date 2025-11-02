# Plan implementacji widoku Dashboard

## 1. Przegląd

Widok Dashboard (`/dashboard`) jest centralnym punktem aplikacji dla zalogowanego użytkownika. Jego głównym celem jest umożliwienie przeglądania i zarządzania listą stworzonych "Postaci". Widok ten obsługuje dwa główne stany: stan "onboarding" dla nowych użytkowników, którzy nie stworzyli jeszcze swojego profilu, oraz główny widok z siatką Postaci dla powracających użytkowników.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/dashboard`. Dostęp do tej ścieżki powinien być chroniony i wymagać aktywnej sesji użytkownika. Niezalogowani użytkownicy próbujący uzyskać dostęp do tego adresu URL powinni zostać przekierowani na stronę logowania.

## 3. Struktura komponentów

Hierarchia komponentów zostanie zorganizowana w następujący sposób, aby oddzielić logikę, stan i prezentację:

```
- DashboardPage.astro (Strona, logika serwerowa, ochrona trasy)
  - Layout.astro (Główny layout z Header, Footer, Menu boczne)
    - DashboardView.tsx (Główny komponent kliencki React)
      - [Logika warunkowa na podstawie stanu `hasOwnerProfile`]
        - OnboardingCTA.tsx (Komponent dla nowych użytkowników)
          - Button (z Shadcn/ui)
        - CharacterDisplay.tsx (Główny widok dla powracających użytkowników)
          - DashboardControls.tsx (Kontrolki: przyciski akcji i sortowanie)
            - Button ("Dodaj Postać")
            - Button ("Dodaj Zdarzenie")
            - SortDropdown.tsx (Dropdown do sortowania)
          - CharacterCardGrid.tsx (Siatka kart postaci)
            - [Logika warunkowa na podstawie stanu `isLoading`]
              - SkeletonCard.tsx (Szkielety ładowania)
              - CharacterCard.tsx (Karta pojedynczej postaci)
          - Pagination.tsx (Komponent paginacji)
```

## 4. Szczegóły komponentów

### `DashboardView.tsx`

- **Opis komponentu**: Główny komponent React renderowany po stronie klienta. Odpowiada za zarządzanie stanem całego widoku, w tym za pobieranie danych, obsługę ładowania i błędów oraz warunkowe renderowanie widoku `OnboardingCTA` lub `CharacterDisplay`.
- **Główne elementy**: Wykorzystuje customowy hook `useDashboard` do zarządzania logiką. Renderuje `OnboardingCTA` lub `CharacterDisplay`.
- **Obsługiwane interakcje**: Inicjuje pobieranie danych przy pierwszym renderowaniu.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DashboardViewModel`.
- **Propsy**: Brak.

### `OnboardingCTA.tsx`

- **Opis komponentu**: Prosty komponent wyświetlany, gdy użytkownik nie ma jeszcze stworzonego profilu własnego (`is_owner: true`). Zawiera tekst zachęcający do akcji oraz przycisk.
- **Główne elementy**: `div` z tekstem (`h2`, `p`), komponent `Button` z Shadcn/ui.
- **Obsługiwane interakcje**: Kliknięcie przycisku "Stwórz swój profil" przekierowuje użytkownika na stronę `/characters/new`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `CharacterDisplay.tsx`

- **Opis komponentu**: Komponent agregujący kontrolki pulpitu, siatkę postaci oraz paginację.
- **Główne elementy**: `DashboardControls`, `CharacterCardGrid`, `Pagination`.
- **Obsługiwane interakcje**: Przekazuje zdarzenia zmiany sortowania i strony do komponentu nadrzędnego (`DashboardView`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `CharacterListItemDto[]`, `PaginationDto`.
- **Propsy**:
  - `characters: CharacterListItemDto[]`
  - `pagination: PaginationDto`
  - `isLoading: boolean`
  - `sort: { sortBy: string; order: 'asc' | 'desc' }`
  - `onPageChange: (page: number) => void`
  - `onSortChange: (sort: { sortBy: string; order: 'asc' | 'desc' }) => void`

### `CharacterCardGrid.tsx`

- **Opis komponentu**: Odpowiada za renderowanie responsywnej siatki kart Postaci. W trakcie ładowania danych (`isLoading: true`) wyświetla komponenty `SkeletonCard`.
- **Główne elementy**: Responsywny `div` (grid), który mapuje tablicę `characters` i renderuje komponenty `CharacterCard`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `CharacterListItemDto`.
- **Propsy**:
  - `characters: CharacterListItemDto[]`
  - `isLoading: boolean`

### `CharacterCard.tsx`

- **Opis komponentu**: Wyświetla informacje o pojedynczej Postaci (awatar, imię). Karta jest klikalna i prowadzi do strony szczegółów danej Postaci.
- **Główne elementy**: `a` (link) lub `Link` (z react-router/astro), `img` dla awatara, `span` dla imienia.
- **Obsługiwane interakcje**: Kliknięcie na kartę nawiguje do `/characters/[id]`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `CharacterListItemDto`.
- **Propsy**:
  - `character: CharacterListItemDto`

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy DTO. Dodatkowo, zdefiniowany zostanie wewnętrzny `ViewModel` do zarządzania stanem widoku.

- **`CharacterListItemDto`** (istniejący): Obiekt reprezentujący pojedynczą postać na liście.
  ```typescript
  export type CharacterListItemDto = Pick<
    Tables<"characters">,
    "id" | "name" | "role" | "avatar_url" | "is_owner" | "last_interacted_at"
  >;
  ```
- **`PaginatedResponseDto<T>`** (istniejący): Generyczny typ dla odpowiedzi API z paginacją.
- **`DashboardViewModel`** (nowy, wewnętrzny): Obiekt stanu dla hooka `useDashboard`.
  - `characters: CharacterListItemDto[]`: Lista postaci do wyświetlenia.
  - `pagination: PaginationDto | null`: Dane paginacji z API.
  - `hasOwnerProfile: boolean`: Flaga określająca, czy użytkownik ma już swój profil.
  - `isLoading: boolean`: Wskazuje, czy trwa proces ładowania danych.
  - `error: string | null`: Przechowuje komunikaty o błędach z API.
  - `sort: { sortBy: 'name' | 'last_interacted_at'; order: 'asc' | 'desc' }`: Aktualny stan sortowania.
  - `page: number`: Aktualny numer strony.

## 6. Zarządzanie stanem

Logika zarządzania stanem, pobierania danych i obsługi akcji użytkownika zostanie zamknięta w customowym hooku `useDashboard`.

- **`useDashboard()`**:
  - **Cel**: Centralizacja logiki stanu dla `DashboardView`.
  - **Zarządzany stan**: Wszystkie pola z `DashboardViewModel`.
  - **Funkcjonalność**:
    1.  Przy pierwszym renderowaniu wykonuje dwa wywołania API:
        - `GET /api/characters?is_owner=true&pageSize=1` w celu sprawdzenia, czy istnieje profil właściciela i ustawienia flagi `hasOwnerProfile`.
        - `GET /api/characters` z domyślnymi parametrami strony i sortowania, aby pobrać pierwszą partię danych.
    2.  Używa `useEffect` do ponownego pobierania danych, gdy zmienią się zależności `page` lub `sort`.
    3.  Udostępnia funkcje do modyfikacji stanu: `setPage(newPage)` i `setSort(newSort)`.
    4.  Zarządza stanami `isLoading` i `error` na podstawie cyklu życia żądania API.

## 7. Integracja API

Integracja będzie opierać się na punkcie końcowym `GET /api/characters`.

- **Endpoint**: `GET /api/characters`
- **Typ żądania (Query Params)**:
  ```typescript
  interface GetCharactersParams {
    page?: number;
    pageSize?: number;
    sortBy?: "name" | "last_interacted_at";
    order?: "asc" | "desc";
    is_owner?: boolean;
  }
  ```
- **Typ odpowiedzi (Success)**: `PaginatedResponseDto<CharacterListItemDto>`
- **Obsługa**: Funkcja `fetchCharacters(params)` wewnątrz hooka `useDashboard` będzie odpowiedzialna za wykonanie żądania `fetch`, obsługę odpowiedzi i aktualizację stanu.

## 8. Interakcje użytkownika

- **Wyświetlenie widoku**: Użytkownik nawiguje do `/dashboard`. System sprawdza istnienie profilu właściciela. Jeśli go nie ma, wyświetla się `OnboardingCTA`. W przeciwnym razie, pobierane są dane i wyświetlana jest siatka postaci.
- **Zmiana sortowania**: Użytkownik wybiera nową opcję w `SortDropdown`. Wywoływana jest funkcja `setSort`, co aktualizuje stan i uruchamia ponowne pobranie danych z API z nowymi parametrami sortowania.
- **Zmiana strony**: Użytkownik klika na numer strony w komponencie `Pagination`. Wywoływana jest funkcja `setPage`, co aktualizuje stan i pobiera dane dla nowej strony.
- **Tworzenie postaci**: Kliknięcie przycisku "Dodaj Postać" lub "Stwórz swój profil" przenosi użytkownika do formularza tworzenia nowej postaci pod adresem `/characters/new`.

## 9. Warunki i walidacja

- **Ochrona trasy**: Middleware w Astro (`src/middleware/index.ts`) weryfikuje, czy użytkownik jest zalogowany. Jeśli nie, następuje przekierowanie.
- **Stan Onboarding**: Komponent `DashboardView` weryfikuje stan `hasOwnerProfile` (ustawiany przez `useDashboard`) i na tej podstawie renderuje odpowiedni widok.
- **Parametry API**: Hook `useDashboard` zarządza parametrami (`page`, `sort`), zapewniając, że do API wysyłane są tylko poprawne wartości.

## 10. Obsługa błędów

- **Błąd serwera (np. 500)**: Hook `useDashboard` przechwyci błąd, ustawi stan `error` na odpowiedni komunikat. Komponent `DashboardView` wyświetli ten komunikat użytkownikowi (np. "Nie udało się wczytać postaci. Spróbuj ponownie.") oraz przycisk do ponowienia próby.
- **Błąd autoryzacji (401)**: Globalny mechanizm obsługi zapytań API powinien przechwycić ten błąd, wylogować użytkownika i przekierować go na stronę logowania.
- **Brak połączenia sieciowego**: Błąd zostanie obsłużony analogicznie do błędu serwera, z odpowiednim komunikatem.

## 11. Kroki implementacji

1.  **Struktura plików**: Utworzenie nowych plików i katalogów:
    - `src/pages/dashboard/index.astro`
    - `src/components/Dashboard/DashboardView.tsx`
    - `src/components/Dashboard/OnboardingCTA.tsx`
    - `src/components/Dashboard/CharacterDisplay.tsx`
    - `src/components/Character/CharacterCardGrid.tsx`
    - `src/components/Character/CharacterCard.tsx`
    - `src/components/Character/SkeletonCard.tsx`
    - `src/hooks/useDashboard.ts` (jeśli zdecydujemy się na hook)
2.  **Strona Astro**: Implementacja `DashboardPage.astro`, która będzie zawierać podstawowy layout i logikę ochrony trasy po stronie serwera.
3.  **Hook `useDashboard`**: Zaimplementowanie całej logiki zarządzania stanem i komunikacji z API w customowym hooku.
4.  **Komponenty UI**: Stworzenie poszczególnych komponentów React, zaczynając od najbardziej zagnieżdżonych (`CharacterCard`, `SkeletonCard`), a kończąc na komponencie głównym (`DashboardView`).
5.  **Styling**: Ostylowanie wszystkich komponentów za pomocą Tailwind CSS, zapewniając responsywność siatki.
6.  **Routing**: Upewnienie się, że przyciski CTA ("Dodaj Postać", "Stwórz swój profil") poprawnie nawigują do odpowiednich stron.
7.  **Testowanie**: Ręczne przetestowanie wszystkich interakcji użytkownika, obsługi stanów ładowania i błędów oraz responsywności widoku.
