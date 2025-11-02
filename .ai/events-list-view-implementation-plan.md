# Plan implementacji widoku: Lista Zdarzeń

## 1. Przegląd

Widok "Lista Zdarzeń" ma na celu wyświetlenie użytkownikowi paginowanej i sortowalnej listy wszystkich utworzonych przez niego zdarzeń. Każdy element na liście będzie zawierał kluczowe informacje, takie jak tytuł, data utworzenia oraz awatary uczestników. Kliknięcie w zdarzenie przeniesie użytkownika do widoku szczegółowego.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/dashboard/events`. Odpowiedni plik strony Astro należy utworzyć w lokalizacji `src/pages/dashboard/events.astro`. Należy również zaktualizować link "Zdarzenia" w menu bocznym (`src/components/Dashboard/Sidebar.astro`), aby wskazywał na tę ścieżkę.

## 3. Struktura komponentów

Hierarchia komponentów dla tego widoku będzie następująca:

```
src/pages/dashboard/events.astro
└── src/layouts/DashboardLayout.astro
    └── src/components/Dashboard/EventsView.tsx (client:load)
        ├── src/components/Dashboard/SortDropdown.tsx
        ├── src/components/Dashboard/EventsList.tsx
        │   ├── src/components/ui/Skeleton.tsx (dla stanu ładowania)
        │   └── src/components/Dashboard/EventCard.tsx (dla każdego zdarzenia)
        │       └── src/components/ui/Avatar.tsx (dla każdego uczestnika)
        └── src/components/Dashboard/Pagination.tsx
```

## 4. Szczegóły komponentów

### EventsView.tsx

- **Opis komponentu**: Główny komponent React, który pełni rolę "smart" kontenera. Zarządza stanem widoku, w tym logiką pobierania danych, sortowaniem i paginacją.
- **Główne elementy**: `SortDropdown`, `EventsList`, `Pagination`. Renderuje również stany ładowania, błędu i pusty.
- **Obsługiwane interakcje**:
  - Zmiana sortowania (przekazywana z `SortDropdown`).
  - Zmiana strony (przekazywana z `Pagination`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `PaginatedResponseDto<EventDto>`, `EventDto`.
- **Propsy**: Brak.

### EventsList.tsx

- **Opis komponentu**: Komponent "dumb", odpowiedzialny za renderowanie listy zdarzeń. Otrzymuje dane w formie propsów.
- **Główne elementy**: Wyświetla listę komponentów `EventCard` lub komponenty `Skeleton` w trakcie ładowania. Może też wyświetlić komunikat o braku danych.
- **Obsługiwane interakcje**: Nawigacja do szczegółów zdarzenia po kliknięciu karty.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `EventDto[]`.
- **Propsy**:
  - `events: EventDto[]` - tablica zdarzeń do wyświetlenia.
  - `isLoading: boolean` - informacja, czy dane są w trakcie ładowania.

### EventCard.tsx

- **Opis komponentu**: Reprezentuje pojedynczy element na liście zdarzeń.
- **Główne elementy**: Komponent `Card` (z Shadcn/ui) opakowujący `<a>`. Wewnątrz znajduje się tytuł (`CardHeader`), sformatowana data utworzenia oraz lista komponentów `Avatar` (z Shadcn/ui) dla uczestników (`CardContent`).
- **Obsługiwane interakcje**: Kliknięcie karty powoduje nawigację do `/dashboard/events/{id}`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `EventDto`.
- **Propsy**:
  - `event: EventDto` - obiekt zdarzenia do wyświetlenia.

### SortDropdown.tsx

- **Opis komponentu**: Komponent pozwalający użytkownikowi na wybór kryterium sortowania (`sortBy`) i kierunku (`order`).
- **Główne elementy**: Komponent `Select` lub `DropdownMenu` (z Shadcn/ui) z predefiniowanymi opcjami sortowania.
- **Obsługiwane interakcje**: Wybór nowej opcji sortowania.
- **Obsługiwana walidacja**: Użytkownik może wybrać tylko spośród dostępnych opcji, co zapobiega wysłaniu nieprawidłowych wartości.
- **Typy**: `SortOption`.
- **Propsy**:
  - `onSortChange: (sort: { sortBy: string; order: string }) => void` - funkcja zwrotna wywoływana przy zmianie sortowania.
  - `defaultValue: { sortBy: string; order: string }` - domyślna wartość sortowania.

### Pagination.tsx

- **Opis komponentu**: Komponent do nawigacji między stronami wyników.
- **Główne elementy**: Komponent `Pagination` (z Shadcn/ui).
- **Obsługiwane interakcje**: Kliknięcie na przyciski "Następna", "Poprzednia" lub numer strony.
- **Obsługiwana walidacja**: Przyciski nawigacyjne są wyłączane, gdy użytkownik jest na pierwszej lub ostatniej stronie.
- **Typy**: `PaginationDto`.
- **Propsy**:
  - `pagination: PaginationDto` - dane paginacji z API.
  - `onPageChange: (page: number) => void` - funkcja zwrotna wywoływana przy zmianie strony.

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy z `src/types.ts`. Nie ma potrzeby tworzenia nowych typów.

- **`EventDto`**: Główny obiekt danych dla zdarzenia.
  - `id: string`
  - `title: string`
  - `event_date: string`
  - `created_at: string`
  - `participants: CharacterListItemDto[]`
- **`CharacterListItemDto`**: Używany do wyświetlania awatarów uczestników.
  - `id: string`
  - `name: string`
  - `avatar_url: string | null`
- **`PaginatedResponseDto<EventDto>`**: Struktura odpowiedzi z API.
  - `data: EventDto[]`
  - `pagination: PaginationDto`
- **`PaginationDto`**: Informacje o paginacji.
  - `page: number`
  - `pageSize: number`
  - `totalItems: number`
  - `totalPages: number`

## 6. Zarządzanie stanem

Logika zarządzania stanem zostanie wyizolowana w dedykowanym custom hooku `useEvents.ts` (`src/components/hooks/useEvents.ts`).

- **Cel hooka**: Abstrakcja logiki pobierania danych, obsługi paginacji i sortowania z komponentu `EventsView`.
- **Zarządzany stan**:
  - `events: EventDto[]`
  - `pagination: PaginationDto | null`
  - `status: 'idle' | 'loading' | 'success' | 'error'`
  - `error: string | null`
  - `queryParams: { page: number; sortBy: string; order: string }`
- **Funkcje eksportowane**:
  - `events`, `pagination`, `status`, `error`
  - `setPage(page: number)`
  - `setSorting({ sortBy, order })`
  - `retry()`

## 7. Integracja API

- **Endpoint**: `GET /api/events`
- **Parametry zapytania**:
  - `page: number` (domyślnie 1)
  - `pageSize: number` (domyślnie 10)
  - `sortBy: 'event_date' | 'title' | 'created_at'` (domyślnie 'event_date')
  - `order: 'asc' | 'desc'` (domyślnie 'desc')
- **Typ odpowiedzi**: `PaginatedResponseDto<EventDto>`
- **Proces**: Hook `useEvents` będzie odpowiedzialny za konstruowanie URL z odpowiednimi parametrami i wykonywanie zapytania `fetch`. Po otrzymaniu odpowiedzi stan komponentu zostanie zaktualizowany.

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Użytkownik widzi szkielety (`Skeleton`) listy. Wykonywane jest zapytanie o pierwszą stronę z domyślnym sortowaniem.
- **Zmiana strony**: Użytkownik klika w element paginacji. Wywoływana jest funkcja `setPage` z hooka, co skutkuje nowym zapytaniem API z nowym numerem strony.
- **Zmiana sortowania**: Użytkownik wybiera nową opcję w `SortDropdown`. Wywoływana jest funkcja `setSorting`, co skutkuje nowym zapytaniem API z nowymi parametrami sortowania i resetem strony do 1.
- **Kliknięcie zdarzenia**: Użytkownik klika kartę zdarzenia. Następuje przekierowanie na stronę szczegółów (`/dashboard/events/{id}`).

## 9. Warunki i walidacja

- **Paginacja**: Komponent `Pagination` uniemożliwi nawigację do stron spoza zakresu `1` - `totalPages`.
- **Sortowanie**: Komponent `SortDropdown` pozwoli na wybór tylko z predefiniowanej listy wartości, co gwarantuje poprawność parametrów `sortBy` i `order`.
- **Dostęp**: Widok jest częścią dashboardu i powinien być dostępny tylko dla zalogowanych użytkowników. Logika ta jest obsługiwana na poziomie layoutu (`DashboardLayout.astro`) lub middleware.

## 10. Obsługa błędów

- **Błąd sieci lub serwera**: Jeśli zapytanie API zakończy się niepowodzeniem, hook `useEvents` ustawi stan `status` na `'error'`. Komponent `EventsView` wyświetli komunikat o błędzie (np. przy użyciu komponentu `Alert` z Shadcn/ui) z opcją ponowienia próby.
- **Brak zdarzeń**: Jeśli API zwróci pustą listę (`totalItems: 0`), komponent `EventsView` wyświetli dedykowany komunikat "Nie masz jeszcze żadnych zdarzeń" wraz z przyciskiem CTA (Call To Action) prowadzącym do formularza tworzenia nowego zdarzenia.
- **Brak autoryzacji (401)**: Błąd zostanie przechwycony, ale obsługa (np. przekierowanie na stronę logowania) powinna być realizowana globalnie na poziomie aplikacji.

## 11. Kroki implementacji

1.  Utworzenie pliku strony `src/pages/dashboard/events.astro` i osadzenie w nim `DashboardLayout`.
2.  Zaktualizowanie linku "Zdarzenia" w `src/components/Dashboard/Sidebar.astro`, aby prowadził do `/dashboard/events`.
3.  Stworzenie custom hooka `useEvents` (`src/components/hooks/useEvents.ts`) zawierającego całą logikę stanu i komunikacji z API.
4.  Implementacja komponentu `EventsView.tsx`, który używa hooka `useEvents` i renderuje odpowiednie stany (ładowanie, błąd, pusty, sukces).
5.  Stworzenie komponentów `SortDropdown.tsx` i `Pagination.tsx` (jeśli nie istnieją jako reużywalne).
6.  Implementacja komponentu `EventsList.tsx` do wyświetlania listy zdarzeń lub szkieletów.
7.  Implementacja komponentu `EventCard.tsx` do wyświetlania pojedynczego zdarzenia, w tym formatowania daty i renderowania awatarów uczestników.
8.  Połączenie wszystkich komponentów w `EventsView.tsx` i przekazanie odpowiednich propsów i handlerów.
9.  Stylizacja komponentów przy użyciu Tailwind CSS zgodnie z design systemem aplikacji.
10. Ręczne przetestowanie wszystkich interakcji: ładowanie danych, paginacja, sortowanie, obsługa błędów i pustego stanu.
