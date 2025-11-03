Zaczynam od analizy projektu, aby stworzyć kompleksowy plan testów. W pierwszej kolejności zapoznam się ze strukturą projektu, aby zidentyfikować kluczowe komponenty i zrozumieć architekturę aplikacji. Następnie przeanalizuję stos technologiczny, aby dostosować strategię testowania do użytych narzędzi. Na podstawie zebranych informacji zidentyfikuję priorytety testowe oraz potencjalne obszary ryzyka. Po zakończeniu analizy, przygotuję szczegółowy plan testów w języku polskim, w formacie Markdown, który będzie zawierał wszystkie wymagane sekcje, od wprowadzenia i celów, po procedury raportowania błędów.

[2 tools called]

Okay, I've reviewed the project structure and dependencies. Now I'll proceed with a deeper analysis to create the test plan. I will start by examining the API endpoints, then the core services, authentication components, and finally the database schema. This will give me a solid foundation for building the test plan.

First, I'll list the files in the key directories to understand the application's core functionalities.

[19 tools called]

# Plan Testów Aplikacji Peerscope

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji Peerscope, narzędzia służącego do analizy i mediacji interakcji międzyludzkich. Aplikacja oparta jest o stos technologiczny Astro, React, TypeScript i Supabase, a jej kluczową funkcjonalnością jest analiza zdarzeń z udziałem zdefiniowanych przez użytkownika postaci, przy wykorzystaniu modeli językowych udostępnianych przez OpenRouter.

### 1.2. Cele testowania

Głównym celem procesu testowania jest zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji Peerscope przed jej wdrożeniem.

Cele szczegółowe:

- **Weryfikacja funkcjonalna:** Upewnienie się, że wszystkie funkcjonalności aplikacji działają zgodnie ze specyfikacją.
- **Zapewnienie jakości UI/UX:** Sprawdzenie, czy interfejs użytkownika jest intuicyjny, spójny i responsywny.
- **Identyfikacja i eliminacja błędów:** Wykrycie, zaraportowanie i naprawa błędów w oprogramowaniu.
- **Weryfikacja bezpieczeństwa:** Upewnienie się, że dane użytkowników są chronione, a aplikacja jest odporna na podstawowe ataki.
- **Ocena wydajności:** Sprawdzenie, jak aplikacja zachowuje się pod obciążeniem i czy czasy odpowiedzi są akceptowalne.
- **Weryfikacja integracji:** Potwierdzenie poprawnej komunikacji pomiędzy frontendem, backendem (Supabase) oraz usługami zewnętrznymi (OpenRouter).

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- **Moduł uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, obsługa sesji.
- **Zarządzanie profilami postaci:** Tworzenie, edycja, usuwanie i listowanie postaci, w tym profilu właściciela.
- **Zarządzanie zdarzeniami:** Tworzenie, edycja, usuwanie i listowanie zdarzeń z udziałem postaci.
- **Analiza AI:** Inicjowanie analizy mediacyjnej dla zdarzeń, obsługa statusów analizy, wyświetlanie wyników.
- **Dashboard użytkownika:** Nawigacja, wyświetlanie danych, paginacja, sortowanie.
- **API Backendowe:** Testowanie wszystkich endpointów API pod kątem poprawności działania, walidacji danych wejściowych i obsługi błędów.

### 2.2. Funkcjonalności wyłączone z testów

- Bezpośrednie testy infrastruktury Supabase (zakładamy jej niezawodność).
- Bezpośrednie testy jakościowe modeli językowych dostarczanych przez OpenRouter (skupiamy się na integracji i obsłudze odpowiedzi).

## 3. Typy testów do przeprowadzenia

### 3.1. Testy jednostkowe (Unit Tests)

- **Cel:** Weryfikacja poprawności działania pojedynczych komponentów React, funkcji pomocniczych i logiki biznesowej w serwisach.
- **Narzędzia:** Vitest, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`.
- **Zakres:**
  - Komponenty UI (np. `CharacterForm`, `EventForm`): renderowanie, walidacja pól, obsługa interakcji.
  - Logika w serwisach (`CharacterService`, `EventService`): testowanie metod z zaślepionym klientem Supabase.
  - Customowe hooki React (np. `useDashboard`).
  - Schematy walidacji Zod.
  - Testy snapshot dla komponentów (wykrywanie niezamierzonych zmian w UI).
  - Podstawowe testy dostępności zintegrowane z testami komponentów.

### 3.2. Testy integracyjne (Integration Tests)

- **Cel:** Sprawdzenie poprawności współpracy pomiędzy różnymi częściami systemu.
- **Narzędzia:** Vitest, React Testing Library, Fetch API (natywny Web API dla testowania Astro endpoints).
- **Zakres:**
  - **Frontend-API:** Weryfikacja, czy komponenty React poprawnie komunikują się z endpointami API Astro (np. formularz logowania wysyłający dane do `/api/auth/signin`).
  - **API-Baza danych:** Sprawdzenie, czy endpointy API poprawnie wykonują operacje na bazie danych Supabase (z użyciem testowej bazy danych). Testy wykorzystują uruchomioną instancję Astro w trybie testowym.
  - **Serwis-Serwis:** Weryfikacja interakcji między serwisami (np. `EventService` wywołujący `CharacterService`).
  - **Mockowanie:** Użycie `msw` (Mock Service Worker) do mockowania zewnętrznych API (np. OpenRouter) w testach integracyjnych.

### 3.3. Testy End-to-End (E2E)

- **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego.
- **Narzędzia:** Playwright.
- **Zakres:**
  - Pełne ścieżki użytkownika, np. rejestracja -> logowanie -> stworzenie postaci -> stworzenie zdarzenia -> uruchomienie analizy.
  - Weryfikacja przepływu danych i stanu w całej aplikacji.

### 3.4. Testy API

- **Cel:** Bezpośrednie testowanie endpointów API w izolacji od frontendu.
- **Narzędzia:**
  - **Manualne:** Postman, Insomnia, Bruno (open-source), Thunder Client (VS Code extension).
  - **Automatyczne:** Vitest z użyciem Fetch API (Astro endpoints są dostępne jako standardowe HTTP endpoints, które można testować przez `fetch`).
- **Zakres:**
  - Wysyłanie zapytań `GET`, `POST`, `PUT`, `DELETE` do wszystkich endpointów w `src/pages/api`.
  - Testowanie scenariuszy pozytywnych (poprawne dane) i negatywnych (niepoprawne dane, brak autoryzacji).
  - Weryfikacja kodów statusu HTTP, formatu odpowiedzi i obsługi błędów.
  - Testy wymagają uruchomionej instancji Astro (dev lub preview mode) do wykonywania zapytań HTTP.

### 3.5. Testy manualne

- **Cel:** Eksploracyjne testowanie aplikacji w celu znalezienia błędów, które mogły zostać pominięte w testach automatycznych. Weryfikacja UX/UI.
- **Zakres:**
  - Testowanie na różnych przeglądarkach (Chrome, Firefox, Safari).
  - Testowanie responsywności na różnych rozmiarach ekranu.
  - Weryfikacja spójności wizualnej i użyteczności interfejsu.
  - Testy dostępności (a11y) - weryfikacja zgodności z WCAG 2.1.

### 3.6. Testy dostępności (Accessibility Tests)

- **Cel:** Zapewnienie dostępności aplikacji dla użytkowników z niepełnosprawnościami.
- **Narzędzia:** `@testing-library/jest-dom`, `@axe-core/react`, `@testing-library/user-event`.
- **Zakres:**
  - Automatyczne wykrywanie problemów dostępności w komponentach React.
  - Weryfikacja nawigacji klawiaturą.
  - Testy semantycznego HTML i atrybutów ARIA.
  - Integracja z testami jednostkowymi i integracyjnymi.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Uwierzytelnianie

| ID      | Opis Scenariusza                                                                     | Oczekiwany Rezultat                                                                                                                                                                       | Priorytet |
| :------ | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| AUTH-01 | Rejestracja nowego użytkownika z poprawnymi danymi.                                  | Użytkownik zostaje pomyślnie zarejestrowany i przekierowany na stronę `/dashboard`. W bazie danych (`auth.users` i `public.profiles`) pojawia się nowy wpis.                              | Krytyczny |
| AUTH-02 | Próba rejestracji z istniejącym adresem e-mail.                                      | Formularz wyświetla komunikat błędu informujący, że użytkownik o podanym adresie e-mail już istnieje.                                                                                     | Wysoki    |
| AUTH-03 | Próba rejestracji z hasłami, które nie są identyczne.                                | Formularz wyświetla błąd walidacji przy polu "Potwierdź hasło".                                                                                                                           | Wysoki    |
| AUTH-04 | Logowanie z poprawnymi danymi uwierzytelniającymi.                                   | Użytkownik zostaje pomyślnie zalogowany i przekierowany na stronę `/dashboard`.                                                                                                           | Krytyczny |
| AUTH-05 | Próba logowania z niepoprawnym hasłem.                                               | Formularz wyświetla komunikat o niepoprawnych danych logowania.                                                                                                                           | Wysoki    |
| AUTH-06 | Wylogowanie zalogowanego użytkownika.                                                | Sesja użytkownika zostaje zakończona, a użytkownik jest przekierowywany na stronę główną (`/`). Dostęp do stron chronionych (np. `/dashboard`) jest niemożliwy bez ponownego zalogowania. | Krytyczny |
| AUTH-07 | Próba dostępu do chronionej strony (`/dashboard`) przez niezalogowanego użytkownika. | Użytkownik jest przekierowywany na stronę główną lub stronę logowania.                                                                                                                    | Krytyczny |

### 4.2. Zarządzanie postaciami

| ID      | Opis Scenariusza                                                  | Oczekiwany Rezultat                                                                                                                | Priorytet |
| :------ | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| CHAR-01 | Stworzenie nowej postaci z wymaganymi polami.                     | Postać zostaje zapisana w bazie danych i pojawia się na liście postaci na dashboardzie.                                            | Krytyczny |
| CHAR-02 | Próba stworzenia postaci z niepoprawnymi danymi (błąd walidacji). | Formularz wyświetla odpowiednie komunikaty o błędach walidacji. Postać nie zostaje zapisana.                                       | Wysoki    |
| CHAR-03 | Edycja istniejącej postaci.                                       | Zmiany zostają zapisane w bazie danych i są widoczne na liście postaci oraz w szczegółach postaci.                                 | Wysoki    |
| CHAR-04 | Usunięcie (soft-delete) istniejącej postaci.                      | Postać znika z listy postaci. W bazie danych w tabeli `characters` dla danego rekordu ustawiana jest data w kolumnie `deleted_at`. | Wysoki    |
| CHAR-05 | Wyświetlanie listy postaci z paginacją i sortowaniem.             | Lista postaci jest poprawnie paginowana i sortowana zgodnie z wybranymi przez użytkownika opcjami.                                 | Średni    |

### 4.3. Zarządzanie zdarzeniami i analiza AI

| ID       | Opis Scenariusza                                                    | Oczekiwany Rezultat                                                                                                                                                                                                                                 | Priorytet |
| :------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| EVENT-01 | Stworzenie nowego zdarzenia z udziałem co najmniej dwóch postaci.   | Zdarzenie zostaje zapisane w bazie danych, a powiązania z uczestnikami zostają utworzone w tabeli `event_participants`. W tle zostaje uruchomiona analiza AI (`_triggerMediationAnalysis`), a status analizy zdarzenia jest ustawiony na `pending`. | Krytyczny |
| EVENT-02 | Próba stworzenia zdarzenia bez wymaganych pól (np. tytułu).         | Formularz wyświetla błędy walidacji. Zdarzenie nie zostaje zapisane.                                                                                                                                                                                | Wysoki    |
| EVENT-03 | Edycja istniejącego zdarzenia (przed zakończeniem analizy).         | Zmiany w zdarzeniu zostają zapisane w bazie danych.                                                                                                                                                                                                 | Wysoki    |
| EVENT-04 | Usunięcie istniejącego zdarzenia.                                   | Zdarzenie oraz powiązane z nim wpisy w `event_participants` i `ai_analyses` zostają usunięte z bazy danych.                                                                                                                                         | Wysoki    |
| EVENT-05 | Wyświetlenie zakończonej analizy AI dla zdarzenia.                  | Wyniki analizy są poprawnie parsowane i wyświetlane użytkownikowi w komponencie `AnalysisAccordion`.                                                                                                                                                | Krytyczny |
| EVENT-06 | Próba edycji zdarzenia po zakończeniu analizy (status `completed`). | Aplikacja uniemożliwia edycję i wyświetla odpowiedni komunikat.                                                                                                                                                                                     | Średni    |
| EVENT-07 | Wyświetlenie ostrzeżenia o nieaktualnych danych dla analizy.        | Jeśli po wygenerowaniu analizy dane zdarzenia lub uczestników zostały zmienione, przy wyniku analizy pojawia się odpowiednie ostrzeżenie (`outdated_data_warning`).                                                                                 | Średni    |
| EVENT-08 | Obsługa błędu podczas komunikacji z API OpenRouter.                 | Aplikacja poprawnie obsługuje błąd. Status analizy zdarzenia jest ustawiany na `failed`. Użytkownik może być poinformowany o niepowodzeniu.                                                                                                         | Wysoki    |

## 5. Środowisko testowe

- **Środowisko deweloperskie:** Lokalne maszyny deweloperów z uruchomioną aplikacją (`npm run dev`) i lokalną instancją Supabase (Docker).
- **Środowisko stagingowe:** Dedykowany serwer/kontener z konfiguracją maksymalnie zbliżoną do produkcyjnej. Baza danych Supabase na dedykowanym projekcie stagingowym. Na tym środowisku będą przeprowadzane testy E2E i testy manualne przed wdrożeniem.
- **Środowisko produkcyjne:** Środowisko dostępne dla użytkowników końcowych. Testy na tym środowisku ograniczą się do "smoke testów" po każdym wdrożeniu.

## 6. Narzędzia do testowania

| Narzędzie                       | Zastosowanie                                                     |
| :------------------------------ | :--------------------------------------------------------------- |
| **Vitest**                      | Framework do testów jednostkowych i integracyjnych               |
| **@vitest/coverage-v8**         | Narzędzie do mierzenia pokrycia kodu testami                     |
| **React Testing Library**       | Biblioteka do testowania komponentów React                       |
| **@testing-library/jest-dom**   | Dodatkowe matchery dla RTL, w tym asercje dostępności            |
| **@testing-library/user-event** | Symulacja interakcji użytkownika (kliknięcia, wpisywanie tekstu) |
| **Playwright**                  | Framework do testów End-to-End (E2E)                             |
| **Fetch API**                   | Testowanie Astro API endpoints (natywny Web API)                 |
| **msw** (Mock Service Worker)   | Mockowanie zewnętrznych API (OpenRouter) w testach               |
| **Postman / Insomnia / Bruno**  | Manualne testowanie API (Bruno jako open-source alternative)     |
| **@axe-core/react**             | Automatyczne wykrywanie problemów dostępności                    |
| **ESLint / Prettier**           | Statyczna analiza kodu i formatowanie                            |
| **GitHub Actions**              | Automatyzacja uruchamiania testów (CI)                           |

### 6.1. Uwagi dotyczące narzędzi

- **Supertest vs Fetch API:** Astro używa własnego systemu API endpoints (nie Express), dlatego Supertest nie jest odpowiednim narzędziem. Zamiast tego wykorzystujemy natywny Fetch API w testach Vitest, co jest bardziej zgodne z architekturą Astro.
- **Pokrycie kodu:** `@vitest/coverage-v8` zapewnia dokładne pomiary pokrycia kodu i integruje się bezpośrednio z Vitest.
- **Testy dostępności:** Narzędzia dostępności są integrowane z testami jednostkowymi, aby zapewnić automatyczne wykrywanie problemów już na etapie rozwoju.

## 7. Harmonogram testów

Proces testowania będzie integralną częścią cyklu rozwoju oprogramowania (CI/CD).

- **Testy jednostkowe i integracyjne:** Pisane na bieżąco przez deweloperów wraz z nowymi funkcjonalnościami. Uruchamiane automatycznie przed każdym commitem (pre-commit hook) oraz w pipeline CI. Raport pokrycia kodu jest generowany automatycznie.
- **Testy E2E:** Uruchamiane automatycznie w pipeline CI po każdym pushu do głównej gałęzi deweloperskiej. Wykorzystują Playwright do symulacji pełnych przepływów użytkownika.
- **Testy dostępności:** Zintegrowane z testami jednostkowymi, uruchamiane automatycznie w pipeline CI.
- **Testy manualne:** Przeprowadzane na środowisku stagingowym przed każdym wydaniem nowej wersji aplikacji. Obejmują testy eksploracyjne i weryfikację UX/UI na różnych przeglądarkach i urządzeniach.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia

- Nowa funkcjonalność została zaimplementowana i jest dostępna na środowisku deweloperskim/stagingowym.
- Testy jednostkowe i integracyjne dla nowej funkcjonalności zostały napisane i przechodzą pomyślnie.

### 8.2. Kryteria wyjścia (Definition of Done)

- Wszystkie zdefiniowane scenariusze testowe (jednostkowe, integracyjne, E2E) przechodzą pomyślnie.
- Pokrycie kodu testami jednostkowymi i integracyjnymi utrzymuje się na poziomie co najmniej 80% (mierzone przez `@vitest/coverage-v8`).
- Nie istnieją żadne otwarte błędy o priorytecie "Krytyczny" lub "Wysoki".
- Testy manualne na środowisku stagingowym zostały zakończone i zaakceptowane.
- Testy dostępności nie wykazują krytycznych problemów (weryfikowane przez `@axe-core/react`).
- Raport pokrycia kodu jest generowany automatycznie w pipeline CI/CD.

## 9. Role i odpowiedzialności w procesie testowania

- **Deweloperzy:**
  - Pisanie testów jednostkowych i integracyjnych dla tworzonego kodu.
  - Naprawianie błędów wykrytych w procesie testowania.
  - Utrzymywanie i rozwijanie pipeline'u CI/CD.
- **Inżynier QA (Rola):**
  - Tworzenie i utrzymywanie planu testów.
  - Projektowanie i implementacja testów E2E.
  - Przeprowadzanie testów manualnych i eksploracyjnych.
  - Zarządzanie procesem raportowania i priorytetyzacji błędów.
- **Product Owner / Manager Projektu:**
  - Definiowanie wymagań i kryteriów akceptacji.
  - Weryfikacja funkcjonalności pod kątem zgodności z celami biznesowymi.

## 10. Procedury raportowania błędów

Wszystkie wykryte błędy będą raportowane jako "Issues" w repozytorium projektu na GitHubie.

Każdy raport błędu powinien zawierać:

- **Tytuł:** Zwięzły i jednoznaczny opis problemu.
- **Opis:**
  - **Kroki do reprodukcji:** Szczegółowa, ponumerowana lista kroków prowadzących do wystąpienia błędu.
  - **Obserwowane zachowanie:** Co się stało po wykonaniu kroków.
  - **Oczekiwane zachowanie:** Co powinno się było stać.
- **Środowisko:** Informacje o środowisku, na którym wystąpił błąd (np. przeglądarka, system operacyjny, wersja aplikacji).
- **Zrzuty ekranu / Nagrania wideo:** Materiały wizualne ułatwiające zrozumienie i zdiagnozowanie problemu.
- **Priorytet:**
  - **Krytyczny:** Błąd blokujący kluczowe funkcjonalności aplikacji, uniemożliwiający dalsze testy.
  - **Wysoki:** Błąd znacząco utrudniający korzystanie z ważnej funkcjonalności, ale posiadający obejście.
  - **Średni:** Błąd w funkcjonalności drugorzędnej lub problem UI/UX, który nie blokuje przepływu.
  - **Niski:** Drobny błąd kosmetyczny, literówka.
- **Etykiety:** (np. `bug`, `frontend`, `backend`, `ui`).
