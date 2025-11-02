# Plan implementacji widoku: Tworzenie / Edycja Zdarzenia

## 1. Przegląd

Celem tego widoku jest umożliwienie użytkownikom tworzenia nowych oraz edytowania istniejących "Zdarzeń". Widok zostanie zaimplementowany jako wieloetapowy formularz (wizard), aby zmniejszyć obciążenie poznawcze użytkownika i prowadzić go krok po kroku przez proces wprowadzania danych. Formularz będzie obsługiwał walidację po stronie klienta oraz komunikację z API w celu zapisu danych.

## 2. Routing widoku

Widok będzie dostępny pod następującymi ścieżkami w ramach głównego layoutu aplikacji (`DashboardLayout.astro`):

- **Tworzenie nowego zdarzenia**: `/dashboard/events/new`
- **Edycja istniejącego zdarzenia**: `/dashboard/events/[id]/edit`

Strony te będą renderować komponent React `EventForm`, który obsłuży całą logikę formularza.

## 3. Struktura komponentów

Hierarchia komponentów React, które zbudują widok formularza, będzie wyglądać następująco:

```
EventForm (Komponent kontenerowy)
├── StepIndicator (Wskaźnik kroku, np. "Krok 1 z 2")
├── Step1_EventDetails (Komponent kroku 1)
│   ├── Input (shadcn/ui - dla tytułu)
│   ├── DatePicker (custom - dla daty zdarzenia)
│   └── Textarea (shadcn/ui - dla opisu)
├── Step2_SelectParticipants (Komponent kroku 2)
│   └── MultiSelect (custom - do wyboru uczestników)
└── NavigationButtons
    ├── Button (Wstecz)
    └── Button (Dalej / Zapisz)
```

## 4. Szczegóły komponentów

### `EventForm` (React, client-side)

- **Opis komponentu:** Główny komponent zarządzający stanem całego formularza, logiką przełączania kroków, walidacją oraz komunikacją z API. W zależności od trybu (tworzenie/edycja), będzie inicjalizował pusty stan lub pobierał dane istniejącego zdarzenia.
- **Główne elementy:** Renderuje komponenty poszczególnych kroków (`Step1_EventDetails`, `Step2_SelectParticipants`) oraz przyciski nawigacyjne.
- **Obsługiwane interakcje:** Przejście do następnego/poprzedniego kroku, finalne zatwierdzenie formularza.
- **Obsługiwana walidacja:** Uruchamia walidację dla całego formularza przed wysłaniem danych do API.
- **Typy:** `EventFormState`, `CharacterListItemDto[]`, `EventDto` (dla trybu edycji).
- **Propsy:** `eventId?: string` (opcjonalny identyfikator zdarzenia do edycji).

### `Step1_EventDetails`

- **Opis komponentu:** Pierwszy krok formularza, zbierający podstawowe informacje o zdarzeniu.
- **Główne elementy:** `Input` dla tytułu, `DatePicker` dla daty i `Textarea` dla opisu.
- **Obsługiwane interakcje:** Aktualizacja stanu nadrzędnego komponentu `EventForm` przy każdej zmianie w polach.
- **Obsługiwana walidacja:**
  - `title`: Pole wymagane, niepusty ciąg znaków.
  - `event_date`: Pole wymagane, musi być wybraną datą.
  - `description`: Pole wymagane, niepusty ciąg znaków.
- **Typy:** `EventFormState` (fragment).
- **Propsy:** `formData: EventFormState`, `onFieldChange: (field, value) => void`, `errors: Record<string, string>`.

### `Step2_SelectParticipants`

- **Opis komponentu:** Drugi krok formularza, umożliwiający wybór uczestników zdarzenia spośród istniejących "Postaci".
- **Główne elementy:** Niestandardowy komponent `MultiSelect`.
- **Obsługiwane interakcje:** Wybór/usunięcie uczestnika z listy, co aktualizuje stan w `EventForm`.
- **Obsługiwana walidacja:**
  - `participant_ids`: Musi być wybranych co najmniej 2 uczestników.
- **Typy:** `CharacterListItemDto[]`, `string[]`.
- **Propsy:** `availableParticipants: CharacterListItemDto[]`, `selectedIds: string[]`, `onSelectionChange: (ids) => void`, `error: string`.

### `MultiSelect`

- **Opis komponentu:** Generyczny, reużywalny komponent do wyboru wielu opcji z listy, zbudowany z prymitywów `shadcn/ui` (np. `Popover`, `Command`, `Badge`). Powinien wspierać wyszukiwanie i wyświetlanie wybranych opcji jako tagi.
- **Główne elementy:** Pole tekstowe wyzwalające `Popover` z listą opcji do wyszukania i zaznaczenia.
- **Obsługiwane interakcje:** Otwieranie/zamykanie listy, filtrowanie opcji, zaznaczanie/odznaczanie.
- **Typy:** `T[]` (dla opcji i wybranych wartości).
- **Propsy:** `options: T[]`, `selected: T[]`, `onChange: (selected) => void`, `placeholder?: string`.

## 5. Typy

Oprócz istniejących typów DTO (`CreateEventCommand`, `CharacterListItemDto`), widok będzie korzystał z wewnętrznych typów (ViewModeli) do zarządzania stanem.

- **`EventFormState`**: Reprezentuje stan danych w całym formularzu.

  ```typescript
  interface EventFormState {
    title: string;
    event_date: Date | undefined; // Obiekt Date dla komponentu DatePicker
    description: string;
    participant_ids: string[];
  }
  ```

- **`ParticipantOption`**: Struktura danych dla opcji w komponencie `MultiSelect`.
  ```typescript
  interface ParticipantOption {
    id: string; // Wartość (value)
    name: string; // Etykieta (label)
    avatar_url: string | null;
  }
  ```

## 6. Zarządzanie stanem

Cała logika stanu formularza, w tym obsługa kroków, walidacja i interakcje z API, zostanie zamknięta w niestandardowym hooku `useEventForm`.

- **`useEventForm(eventId?: string)`**:
  - **Cel:** Centralizacja logiki i odseparowanie jej od warstwy prezentacji.
  - **Zarządzany stan:**
    - `formState: EventFormState`: Aktualne dane formularza.
    - `errors: FormErrors`: Obiekt z błędami walidacji.
    - `currentStep: number`: Bieżący krok formularza.
    - `isLoading: boolean`: Status ładowania (np. podczas wysyłania danych).
    - `availableParticipants: CharacterListItemDto[]`: Lista postaci do wyboru.
  - **Zwracane funkcje:**
    - `handleInputChange`: Aktualizuje stan formularza.
    - `nextStep`: Waliduje bieżący krok i przechodzi do następnego.
    - `prevStep`: Wraca do poprzedniego kroku.
    - `handleSubmit`: Waliduje i wysyła cały formularz.

## 7. Integracja API

Formularz będzie komunikował się z następującymi punktami końcowymi API:

1.  **Pobranie listy postaci (uczestników):**
    - **Endpoint:** `GET /api/characters`
    - **Cel:** Wypełnienie komponentu `MultiSelect` w drugim kroku formularza.
    - **Typ odpowiedzi:** `PaginatedResponseDto<CharacterListItemDto>`

2.  **Utworzenie nowego zdarzenia:**
    - **Endpoint:** `POST /api/events`
    - **Cel:** Zapis nowego zdarzenia.
    - **Typ żądania:** `CreateEventCommand`
    - **Typ odpowiedzi:** `EventDto`

3.  **Pobranie danych zdarzenia do edycji (NOWY ENDPOINT):**
    - **Endpoint:** `GET /api/events/[id]`
    - **Cel:** Wypełnienie formularza danymi istniejącego zdarzenia.
    - **Typ odpowiedzi:** `EventDto`

4.  **Aktualizacja istniejącego zdarzenia (NOWY ENDPOINT):**
    - **Endpoint:** `PUT /api/events/[id]`
    - **Cel:** Zapis zmian w edytowanym zdarzeniu.
    - **Typ żądania:** `UpdateEventCommand`
    - **Typ odpowiedzi:** `EventDto`

## 8. Interakcje użytkownika

- **Wypełnianie pól:** Użytkownik wprowadza dane w kroku 1. Stan jest aktualizowany na bieżąco.
- **Nawigacja:** Użytkownik klika "Dalej", aby przejść do kroku 2, lub "Wstecz", aby wrócić do kroku 1. Przejście do przodu jest możliwe tylko po poprawnej walidacji bieżącego kroku.
- **Wybór uczestników:** W kroku 2 użytkownik wyszukuje i wybiera co najmniej dwie postacie.
- **Zatwierdzenie:** Użytkownik klika "Zapisz" na ostatnim kroku. Aplikacja wyświetla wskaźnik ładowania, wysyła dane do API. Po sukcesie użytkownik jest przekierowywany na listę zdarzeń. W razie błędu wyświetlany jest komunikat.

## 9. Warunki i walidacja

Walidacja będzie realizowana na poziomie hooka `useEventForm` przy próbie przejścia do następnego kroku lub przy finalnym zapisie.

- **`title`**: Wymagane. Przycisk "Dalej" w kroku 1 jest nieaktywny, dopóki pole nie zostanie wypełnione.
- **`event_date`**: Wymagane. Jak wyżej.
- **`description`**: Wymagane. Jak wyżej.
- **`participant_ids`**: Wymagane co najmniej 2 osoby. Przycisk "Zapisz" w kroku 2 jest nieaktywny, dopóki warunek nie zostanie spełniony. Komunikat o błędzie jest wyświetlany, jeśli użytkownik spróbuje zapisać z mniejszą liczbą uczestników.

## 10. Obsługa błędów

- **Błędy walidacji klienta:** Wyświetlanie komunikatów o błędach bezpośrednio pod odpowiednimi polami formularza.
- **Błąd pobierania listy postaci:** Wyświetlenie komunikatu wewnątrz kroku 2 z informacją o problemie i ewentualnym przyciskiem "Spróbuj ponownie".
- **Błąd API przy zapisie (`400 Bad Request`):** Wyświetlenie globalnego komunikatu (np. toast) z informacją "Sprawdź poprawność wprowadzonych danych".
- **Błąd autoryzacji (`401 Unauthorized`):** Automatyczne przekierowanie użytkownika do strony logowania.
- **Błąd serwera (`500+`) lub błąd sieci:** Wyświetlenie globalnego komunikatu "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."

## 11. Kroki implementacji

1.  **Utworzenie nowych endpointów API:** Zaimplementowanie `GET /api/events/[id].ts` oraz `PUT /api/events/[id].ts` na wzór istniejących endpointów.
2.  **Struktura plików:** Stworzenie plików dla komponentów React: `EventForm.tsx`, `Step1_EventDetails.tsx`, `Step2_SelectParticipants.tsx` oraz `MultiSelect.tsx` w katalogu `src/components/`.
3.  **Implementacja `MultiSelect`:** Zbudowanie reużywalnego komponentu `MultiSelect` przy użyciu `shadcn/ui`.
4.  **Implementacja komponentów kroków:** Stworzenie komponentów `Step1_EventDetails` i `Step2_SelectParticipants` jako komponentów czysto prezentacyjnych, przyjmujących dane i funkcje zwrotne przez propsy.
5.  **Implementacja hooka `useEventForm`:** Zawarcie w nim całej logiki zarządzania stanem, walidacji, obsługi kroków i komunikacji z API.
6.  **Implementacja komponentu `EventForm`:** Połączenie wszystkich elementów w całość przy użyciu hooka `useEventForm`.
7.  **Utworzenie stron Astro:** Stworzenie plików `src/pages/dashboard/events/new.astro` i `src/pages/dashboard/events/[id]/edit.astro`, które będą renderować komponent `EventForm`. Zabezpieczenie stron przed dostępem nieuwierzytelnionych użytkowników.
8.  **Styling i UX:** Dopracowanie stylów za pomocą Tailwind CSS, dodanie obsługi stanów ładowania (loading spinners) i komunikatów o błędach (toasts).
9.  **Testowanie:** Ręczne przetestowanie obu ścieżek (tworzenie i edycja) oraz wszystkich przypadków brzegowych i scenariuszy błędów.
