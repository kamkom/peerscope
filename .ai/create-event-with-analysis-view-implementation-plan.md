# Plan implementacji widoku: Tworzenie i Analiza Zdarzenia

## 1. Przegląd

Celem tego widoku jest umożliwienie użytkownikowi stworzenia nowego "Zdarzenia" poprzez wieloetapowy formularz. Po pomyślnym utworzeniu zdarzenia, system automatycznie uruchomi analizę AI, a interfejs użytkownika dynamicznie się zaktualizuje, wyświetlając formularz z danymi po lewej stronie i wynik analizy po prawej. Widok ten połączy proces wprowadzania danych z natychmiastową informacją zwrotną od AI, realizując kluczową funkcjonalność aplikacji.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- `/dashboard/events/new`

Po pomyślnym utworzeniu zdarzenia, URL zostanie zaktualizowany po stronie klienta na `/dashboard/events/[id]/edit`, gdzie `[id]` to identyfikator nowo utworzonego zdarzenia, aby umożliwić odświeżenie strony bez utraty kontekstu.

## 3. Struktura komponentów

Widok będzie zaimplementowany jako strona Astro, która renderuje jeden główny, interaktywny komponent React.

```
/src/pages/dashboard/events/new.astro
└── /src/components/Event/EventForm.tsx (client:load)
    ├── /src/components/Event/MultiSelect.tsx
    ├── /src/components/ui/input.tsx
    ├── /src/components/ui/date-picker.tsx
    ├── /src/components/ui/textarea.tsx
    ├── /src/components/Event/NavigationButtons.tsx
    └── /src/components/Event/AnalysisResult.tsx
```

## 4. Szczegóły komponentów

### `AnalysisResult.tsx`

- **Opis komponentu:** Wyświetla wynik analizy AI lub jej stan ładowania/błędu.
- **Główne elementy:**
  - Warunkowe renderowanie: `Skeleton` (ładowanie), komunikat o błędzie lub sformatowany wynik analizy wewnątrz `textarea` (tylko do odczytu).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `AiAnalysisDto`.
- **Propsy:**
  - `status: 'idle' | 'loading' | 'success' | 'error'`: Status procesu analizy.
  - `analysis?: AiAnalysisDto | null`: Dane analizy.
  - `error?: string | null`: Komunikat błędu.

## 5. Typy

### `EventFormViewModel` (nowy typ)

Będzie to główny obiekt stanu zarządzany w hooku `useEventForm`.

```typescript
type EventFormViewModel = {
  step: number; // 1: Uczestnicy, 2: Detale
  title: string;
  eventDate?: Date;
  description: string;
  participantIds: string[];

  // Statusy procesów
  formStatus: "idle" | "submitting" | "success" | "error";
  analysisStatus: "idle" | "loading" | "success" | "error";

  // Przechowywane dane z API
  eventData: EventDto | null;
  analysisData: AiAnalysisDto | null;

  // Komunikaty błędów
  apiError: string | null;
  validationErrors: Record<string, string>; // np. { participants: 'Wybierz co najmniej 2 osoby' }
};
```

## 6. Zarządzanie stanem

Cała logika i stan widoku zostaną zamknięte w customowym hooku `useEventForm.ts`.

- **Cel:** Abstrahuje logikę formularza, walidację, wywołania API i zarządzanie statusami (ładowanie, błędy) od komponentu `EventForm.tsx`, czyniąc go czysto prezentacyjnym.
- **Struktura:**
  - Będzie używał `useReducer` do zarządzania złożonym stanem `EventFormViewModel`.
  - Zawierał będzie funkcje do obsługi zmian w formularzu (`handleTitleChange`, `handleParticipantsChange`, itd.).
  - Eksportował będzie funkcje do nawigacji (`nextStep`, `prevStep`) oraz główną funkcję `handleSubmit`.
  - `handleSubmit` będzie odpowiedzialny za walidację, wywołanie `POST /api/events`, a w przypadku sukcesu, za uruchomienie analizy przez wywołanie `POST /api/events/[id]/analysis`.
  - `useEffect` wewnątrz hooka będzie odpowiedzialny za pobranie listy postaci przy pierwszym załadowaniu.

## 7. Integracja API

1.  **Pobranie postaci do wyboru**
    - **Endpoint:** `GET /api/characters`
    - **Akcja:** Wywoływane przy pierwszym renderowaniu `EventForm.tsx`.
    - **Typ odpowiedzi:** `PaginatedResponseDto<CharacterListItemDto>`

2.  **Utworzenie nowego zdarzenia**
    - **Endpoint:** `POST /api/events`
    - **Akcja:** Wywoływane po kliknięciu "Zapisz Zdarzenie" i pomyślnej walidacji.
    - **Typ żądania:** `CreateEventCommand`
    - **Typ odpowiedzi:** `EventDto`

3.  **Uruchomienie analizy AI**
    - **Endpoint:** `POST /api/events/[id]/analysis` (wymaga stworzenia na backendzie)
    - **Akcja:** Wywoływane automatycznie po pomyślnym utworzeniu zdarzenia.
    - **Typ żądania:** `CreateEventAnalysisCommand`
    - **Typ odpowiedzi:** `AiAnalysisDto`

## 8. Interakcje użytkownika

- **Krok 1 (Uczestnicy):** Użytkownik wybiera co najmniej dwie postacie z listy. Przycisk "Dalej" jest nieaktywny, dopóki warunek nie zostanie spełniony.
- **Krok 2 (Detale):** Użytkownik wypełnia tytuł, datę i opis. Przycisk "Zapisz Zdarzenie" jest nieaktywny, dopóki wszystkie pola nie zostaną wypełnione.
- **Zapis:** Po kliknięciu "Zapisz Zdarzenie", formularz zostaje zablokowany, a przycisk pokazuje stan ładowania.
- **Sukces:** Formularz pozostaje widoczny (ale zablokowany), a obok pojawia się sekcja analizy w stanie ładowania. URL przeglądarki zostaje zaktualizowany.
- **Zakończenie analizy:** Wynik pojawia się w dedykowanym polu tekstowym.

## 9. Warunki i walidacja

- **Uczestnicy:** `participantIds.length >= 2`
  - Weryfikowane w komponencie `EventForm.tsx` przed przejściem do kroku 2. Wpływa na atrybut `disabled` przycisku "Dalej".
- **Tytuł:** Wymagany, `string.length > 0`.
  - Weryfikowane w `EventForm.tsx`. Wpływa na atrybut `disabled` przycisku "Zapisz".
- **Data:** Wymagana.
  - Weryfikowane w `EventForm.tsx`. Wpływa na atrybut `disabled` przycisku "Zapisz".
- **Opis:** Wymagany, `string.length > 0`.
  - Weryfikowane w `EventForm.tsx`. Wpływa na atrybut `disabled` przycisku "Zapisz".

Walidacja po stronie klienta będzie odzwierciedlać schemat Zod używany na backendzie (`createEventSchema`).

## 10. Obsługa błędów

- **Błąd pobierania postaci:** W miejscu komponentu `MultiSelect` zostanie wyświetlony komunikat o błędzie z przyciskiem "Spróbuj ponownie".
- **Błąd walidacji API (400):** Pod odpowiednimi polami formularza zostaną wyświetlone komunikaty o błędach zwrócone przez serwer.
- **Błąd serwera (500) / Błąd sieci:** Pod przyciskiem "Zapisz" zostanie wyświetlony ogólny komunikat o błędzie (np. "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.").
- **Przekroczony limit analiz (429):** W sekcji analizy zostanie wyświetlony komunikat: "Wykorzystano dzienny limit analiz. Spróbuj ponownie jutro."
- **Błąd analizy AI:** W sekcji analizy zostanie wyświetlony komunikat o błędzie z opcją ponowienia próby.

## 11. Kroki implementacji

1.  Utworzenie pliku strony `/src/pages/dashboard/events/new.astro`.
2.  Stworzenie szkieletu komponentu `/src/components/Event/EventForm.tsx`.
3.  Implementacja customowego hooka `/src/components/hooks/useEventForm.ts` z logiką zarządzania stanem (`useReducer`).
4.  Zaimplementowanie w `useEventForm` logiki pobierania listy postaci (`GET /api/characters`).
5.  Stworzenie lub dostosowanie komponentu `/src/components/Event/MultiSelect.tsx` i integracja z `EventForm`.
6.  Zbudowanie interfejsu użytkownika formularza w `EventForm.tsx` z wykorzystaniem komponentów Shadcn/ui (`Input`, `DatePicker`, `Textarea`).
7.  Implementacja logiki wieloetapowej przy użyciu stanu `step` z `useEventForm`.
8.  Dodanie logiki `handleSubmit` w `useEventForm`, która wywołuje `POST /api/events`.
9.  Dodanie logiki wyzwalającej analizę AI (`POST /api/events/[id]/analysis`) po pomyślnym utworzeniu zdarzenia.
10. Stworzenie komponentu `/src/components/Event/AnalysisResult.tsx` do wyświetlania stanu ładowania, błędu i wyniku analizy.
11. Implementacja dynamicznej zmiany layoutu z jedno- na dwukolumnowy w `EventForm.tsx` w zależności od stanu analizy.
12. Pełna obsługa wszystkich scenariuszy błędów z wyświetlaniem przyjaznych komunikatów dla użytkownika.
13. Stylowanie komponentów za pomocą Tailwind CSS zgodnie z projektem.
14. Zapewnienie, że formularz jest w pełni responsywny.
