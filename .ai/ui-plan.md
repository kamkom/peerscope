# Architektura UI dla Peerscope

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) aplikacji Peerscope została zaprojektowana w oparciu o model komponentowy, wykorzystując Astro dla stron statycznych i React dla interaktywnych "wysp". Celem jest stworzenie intuicyjnego, responsywnego i spójnego doświadczenia, które prowadzi użytkownika od procesu onboardingu, przez codzienne zarządzanie danymi, aż po korzystanie z kluczowych funkcji analitycznych AI.

Struktura opiera się na kilku głównych widokach: publicznych (strona marketingowa, logowanie, rejestracja), prywatnych (pulpit, formularze, widoki szczegółów) oraz dedykowanych stronach obsługi błędów. Zarządzanie stanem serwera i komunikacją z API jest realizowane przez bibliotekę React Query, co zapewnia efektywne buforowanie danych, obsługę stanów ładowania i błędów. Nacisk położono na płynne przepływy użytkownika (user flows), minimalizując potrzebę złożonej, stałej nawigacji na rzecz kontekstowych akcji i przejść między widokami.

## 2. Lista widoków

### Widoki publiczne

| Nazwa widoku      | Ścieżka     | Główny cel                                                     | Kluczowe informacje                                                  | Kluczowe komponenty                                                   | UX, Dostępność, Bezpieczeństwo                                           |
| :---------------- | :---------- | :------------------------------------------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Strona Główna** | `/`         | Przedstawienie wartości aplikacji i zachęcenie do rejestracji. | Opis produktu, korzyści, zrzuty ekranu, wezwanie do działania (CTA). | `Header`, `HeroSection`, `FeaturesSection`, `CallToAction`, `Footer`. | Semantyczny HTML dla SEO i a11y.                                         |
| **Logowanie**     | `/login`    | Uwierzytelnienie istniejącego użytkownika.                     | Formularz logowania.                                                 | `LoginForm` (e-mail, hasło), `Button`.                                | Walidacja po stronie klienta. Komunikaty o błędach. Link do rejestracji. |
| **Rejestracja**   | `/register` | Utworzenie nowego konta użytkownika.                           | Formularz rejestracji.                                               | `RegistrationForm` (e-mail, hasło, potwierdzenie hasła), `Button`.    | Walidacja po stronie klienta (format e-mail, zgodność haseł).            |

### Widoki prywatne (dostępne po zalogowaniu)

| Nazwa widoku                     | Ścieżka                                   | Główny cel                                                     | Kluczowe informacje                                                                            | Kluczowe komponenty                                                                                                        | UX, Dostępność, Bezpieczeństwo                                                       |
| :------------------------------- | :---------------------------------------- | :------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Onboarding**                   | `/dashboard`                              | Poprowadzenie nowego użytkownika przez pierwszy kluczowy krok. | Wezwanie do stworzenia własnego profilu.                                                       | `EmptyState`, `Button` ("Stwórz swój profil").                                                                             | Jasny i pojedynczy CTA eliminuje dezorientację.                                      |
| **Pulpit (Dashboard)**           | `/dashboard`                              | Centralny punkt aplikacji; przegląd i zarządzanie Postaciami.  | Siatka Postaci, główne przyciski akcji, opcje sortowania.                                      | `CharacterCardGrid`, `CharacterCard`, `Button` ("Dodaj Postać", "Dodaj Zdarzenie"), `Dropdown` (sortowanie), `Pagination`. | Skeleton loaders w trakcie ładowania. Responsywna siatka (jedna kolumna na mobile).  |
| **Tworzenie / Edycja Postaci**   | `/characters/new`, `/characters/:id/edit` | Wprowadzanie i modyfikacja danych o Postaci.                   | Formularz z danymi Postaci.                                                                    | `CharacterForm`, `Input`, `Select` (rola), `Textarea`, `FileUpload` (awatar), `TagInput` (cechy, motywacje).               | Walidacja po stronie klienta. Toast po zapisaniu. Przycisk do użycia szablonu opisu. |
| **Szczegóły Postaci**            | `/characters/:id`                         | Wyświetlanie pełnych informacji o Postaci i inicjowanie akcji. | Wszystkie dane Postaci, przyciski akcji, historia zdarzeń (opcjonalnie).                       | `CharacterDetailsView`, `Avatar`, `Button` ("Edytuj", "Usuń", "Zasugeruj prezent").                                        | Modal potwierdzający usunięcie. Spinner na przycisku analizy.                        |
| **Tworzenie / Edycja Zdarzenia** | `/events/new`, `/events/:id/edit`         | Wprowadzanie i modyfikacja danych o Zdarzeniu.                 | Wieloetapowy formularz.                                                                        | `EventForm` (krokowy), `MultiSelect` (uczestnicy), `Input`, `DatePicker`, `Textarea`.                                      | Podział na kroki zmniejsza obciążenie poznawcze.                                     |
| **Szczegóły Zdarzenia**          | `/events/:id`                             | Przegląd Zdarzenia i jego analizy AI.                          | Dane Zdarzenia, uczestnicy, wyniki analizy.                                                    | `EventDetailsView`, `Accordion` (wyniki analizy), `Alert` (ostrzeżenie o nieaktualności), `FeedbackButtons`.               | Przycisk analizy zablokowany podczas przetwarzania.                                  |
| **Lista Zdarzenia**              | `/events`                                 | Lista zdarzeń                                                  | Lista z informacjami o wydarzeniach. Klikniecie w zdarzenie przenosi nas w szegoly wydarzenia. |                                                                                                                            | Przycisk analizy zablokowany podczas przetwarzania.                                  |

### Widoki błędów

| Nazwa widoku            | Ścieżka         | Główny cel                                                             | Kluczowe informacje            | Kluczowe komponenty                                  | UX, Dostępność, Bezpieczeństwo                                   |
| :---------------------- | :-------------- | :--------------------------------------------------------------------- | :----------------------------- | :--------------------------------------------------- | :--------------------------------------------------------------- |
| **401 Nieautoryzowany** | `/unauthorized` | Poinformowanie o wygaśnięciu sesji i konieczności ponownego logowania. | Komunikat o wygaśnięciu sesji. | `InfoPageLayout`, `Button` ("Przejdź do logowania"). | Jasny komunikat i jednoznaczne działanie.                        |
| **403 Zabroniony**      | `/forbidden`    | Poinformowanie o braku uprawnień do dostępu do zasobu.                 | Komunikat o braku uprawnień.   | `InfoPageLayout`, `Button` ("Wróć na pulpit").       | Zapobiega frustracji, kierując użytkownika w bezpieczne miejsce. |

## 3. Mapa podróży użytkownika

Podstawowy przepływ (happy path) dla nowego użytkownika został zaprojektowany tak, aby był jak najbardziej płynny i prowadził go do odkrycia kluczowej wartości aplikacji.

1.  **Rejestracja i Onboarding:**
    - Użytkownik trafia na stronę główną (`/`), klika "Zarejestruj się", przechodzi do (`/register`).
    - Po pomyślnej rejestracji jest automatycznie logowany i przekierowywany na Pulpit (`/dashboard`), który jest w stanie "Onboarding".
    - Klika CTA "Stwórz swój profil", co prowadzi go do formularza Tworzenia Postaci (`/characters/new`) z preselekcją dla profilu własnego.

2.  **Budowanie Bazy Danych:**
    - Po stworzeniu swojego profilu, użytkownik wraca na Pulpit (`/dashboard`), gdzie widzi swoją kartę i nowe CTA "Dodaj kolejną osobę".
    - Po dodaniu kilku Postaci, pulpit zapełnia się kartami, a główne CTA stabilizują się jako "Dodaj Postać" i "Dodaj Zdarzenie".

3.  **Tworzenie i Analiza Zdarzenia:**
    - Z Pulpitu użytkownik klika "Dodaj Zdarzenie", przechodząc do formularza (`/events/new`).
    - Krok 1: Wybiera co najmniej dwóch uczestników z listy swoich Postaci.
    - Krok 2: Uzupełnia tytuł, datę i opis zdarzenia.
    - Po zapisaniu zostaje przekierowany do widoku Szczegółów Zdarzenia (`/events/:id`).
    - Po Zapisaniu wykonuje się analiza zdarzenia, jeśli jest dostępna, komponent modalu przesuwa się w lewo robiąc miejsce dla nowego duzego pola tekstowego `textarea`
      w ktorym wyswietlany jest wynik analizy. Czyli dwie kolumny w przypadku kiedy analiza jest dostępna. Kiedy analizy nie ma i tworzymy nowe zdarzenie okno jest na srodku

## 4. Układ i struktura nawigacji

Nawigacja w aplikacji jest minimalistyczna i kontekstowa, aby nie przytłaczać użytkownika.

- **Główny Układ (Layout):**
  - **Nagłówek:** Zawiera logo aplikacji. Dla zalogowanych użytkowników dodatkowo znajduje się menu z opcją wylogowania.
  - **Stopka:** Zawiera linki do polityki prywatności, regulaminu itp.
- **Nawigacja:**
  - Aplikacja posiada menu nawigacyjne po lewej stronie
  - Podstawowym punktem startowym jest **Pulpit**, z którego inicjowane są główne akcje.
  - Przejścia między widokami są realizowane przez kliknięcie w elementy interfejsu (np. kliknięcie karty Postaci prowadzi do jej szczegółów; kliknięcie "Edytuj" prowadzi do formularza edycji).
  - W widokach zagnieżdżonych (np. edycja Postaci) stosowane będą "okruszki" (breadcrumbs), np. `Pulpit > Jan Kowalski > Edytuj`.

## 5. Kluczowe komponenty

Poniżej znajduje się lista reużywalnych komponentów, które stanowią podstawę interfejsu użytkownika.

- **`CharacterCard`**: Karta wyświetlająca podstawowe informacje o Postaci (awatar, imię) na Pulpicie.
- **`TagInput`**: Komponent formularza pozwalający na wprowadzanie i zarządzanie listą tagów (dla cech i motywacji).
- **`Toast`**: Niewielkie, nieinwazyjne powiadomienie (np. "Zapisano pomyślnie", "Wystąpił błąd").
- **`Alert`**: Bardziej widoczny komponent do komunikowania ważnych informacji lub błędów w kontekście widoku.
- **`Accordion`**: Używany do prezentacji wyników analizy AI w sposób ustrukturyzowany i zwarty.
- **`SkeletonLoader`**: Placeholder wyświetlany podczas ładowania danych (np. siatki kart), poprawiający postrzeganą wydajność.
- **`FeedbackButtons`**: Prosty komponent z ikonami kciuka w górę i w dół do oceniania odpowiedzi AI.
- **`EmptyState`**: Komponent wyświetlany, gdy brakuje danych (np. na start dla nowego użytkownika), zawierający grafikę i wezwanie do działania.
