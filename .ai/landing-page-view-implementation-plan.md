# Plan implementacji widoku Landing Page

## 1. Przegląd

Celem tego widoku jest stworzenie strony głównej (`Landing Page`) aplikacji Peerscope. Strona ma za zadanie przedstawić kluczowe wartości i funkcjonalności produktu nowym użytkownikom oraz zachęcić ich do rejestracji. Będzie to statyczna strona, zbudowana w oparciu o komponenty Astro, z naciskiem na wydajność, responsywność i semantykę HTML dla SEO i dostępności.

## 2. Routing widoku

Widok będzie dostępny pod głównym adresem URL aplikacji:

- **Ścieżka:** `/`
- **Plik:** `src/pages/index.astro`

## 3. Struktura komponentów

Strona będzie zbudowana z pięciu głównych, semantycznych komponentów, zagnieżdżonych w głównym layoucie. Wszystkie komponenty będą komponentami Astro (`.astro`), aby zapewnić maksymalną wydajność (zero JavaScript po stronie klienta domyślnie).

```
- Layout.astro
  - index.astro (strona)
    - Header.astro
    - main
      - HeroSection.astro
      - FeaturesSection.astro
      - CallToAction.astro
    - Footer.astro
```

## 4. Szczegóły komponentów

### `Header.astro`

- **Opis komponentu:** Górny pasek nawigacyjny, widoczny na wszystkich podstronach. Zawiera logo aplikacji, które jest linkiem do strony głównej, oraz linki do logowania i rejestracji. W wersji mobilnej nawigacja powinna być schowana pod przyciskiem typu "hamburger".
- **Główne elementy:**
  - Logo aplikacji (`<a>` z `<img>` lub komponentem SVG).
  - Lista nawigacyjna (`<nav>` z `<ul>`).
  - Linki do logowania i rejestracji (komponent `NavLink.astro`).
  - Przycisk "hamburger" dla widoków mobilnych.
- **Obsługiwane interakcje:**
  - Kliknięcie w logo przekierowuje na `/`.
  - Kliknięcie w linki nawigacyjne przekierowuje do odpowiednich stron (`/login`, `/register`).
  - Kliknięcie w przycisk "hamburger" na mobile toggluje widoczność menu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `NavLinkProps`.
- **Propsy:** Brak.

### `HeroSection.astro`

- **Opis komponentu:** Pierwsza, główna sekcja strony ("above the fold"). Ma za zadanie przyciągnąć uwagę użytkownika za pomocą chwytliwego nagłówka, krótkiego opisu propozycji wartości aplikacji oraz wyraźnego wezwania do działania (CTA).
- **Główne elementy:**
  - Nagłówek `<h1>`.
  - Paragraf `<p>` z opisem.
  - Główny przycisk CTA (np. `<a>` stylizowany na przycisk), prowadzący do strony rejestracji.
  - Opcjonalnie grafika lub zdjęcie w tle.
- **Obsługiwane interakcje:** Kliknięcie w przycisk CTA przekierowuje na `/register`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `FeaturesSection.astro`

- **Opis komponentu:** Sekcja prezentująca kluczowe funkcjonalności aplikacji. Powinna zawierać zrzuty ekranu lub grafiki ilustrujące działanie produktu, zgodnie z wymaganiami PRD.
- **Główne elementy:**
  - Nagłówek sekcji, np. `<h2>`.
  - Kontener (np. grid) na karty z funkcjami.
  - Komponenty `FeatureCard.astro`, gdzie każdy opisuje jedną funkcję i zawiera ikonę/grafikę, tytuł oraz krótki opis.
- **Obsługiwane interakcje:** Brak (sekcja informacyjna).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FeatureCardProps`.
- **Propsy:** Brak.

### `CallToAction.astro`

- **Opis komponentu:** Ostatnia sekcja na stronie, której celem jest ponowne i mocne zachęcenie użytkownika do rejestracji.
- **Główne elementy:**
  - Nagłówek, np. `<h2>`.
  - Drugi, równie ważny przycisk CTA prowadzący do strony rejestracji.
- **Obsługiwane interakcje:** Kliknięcie w przycisk CTA przekierowuje na `/register`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `Footer.astro`

- **Opis komponentu:** Stopka strony. Zawiera informacje o prawach autorskich i ewentualnie linki do podstron informacyjnych (np. Polityka Prywatności).
- **Główne elementy:**
  - Paragraf `<p>` z informacją o prawach autorskich `© {rok} Peerscope`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

## 5. Typy

Ponieważ jest to strona statyczna, nie ma potrzeby definiowania złożonych typów DTO czy ViewModel. Definiujemy jedynie proste interfejsy dla propsów komponentów.

```typescript
// src/types.ts lub w plikach komponentów

// Propsy dla komponentu opisującego pojedynczą funkcję
export interface FeatureCardProps {
  icon: string; // Ścieżka do ikony SVG lub obrazka
  title: string;
  description: string;
}

// Propsy dla komponentu linku nawigacyjnego
export interface NavLinkProps {
  href: string;
  text: string;
}
```

## 6. Zarządzanie stanem

Widok jest w większości statyczny, więc nie wymaga globalnego zarządzania stanem. Jedyny stan, jaki może wystąpić, to obsługa widoczności mobilnego menu nawigacyjnego.

- **Stan:** `isMobileMenuOpen: boolean`.
- **Implementacja:** Stan ten będzie zarządzany lokalnie w komponencie `Header.astro` za pomocą niewielkiego skryptu po stronie klienta (`<script>` w Astro), który będzie dodawał/usuwał klasy CSS. Nie ma potrzeby używania Reacta ani customowego hooka.

## 7. Integracja API

Ten widok nie wymaga żadnej integracji z API. Wszystkie treści są statyczne i serwowane bezpośrednio z plików `.astro`.

## 8. Interakcje użytkownika

- **Nawigacja:** Użytkownik może nawigować do strony logowania i rejestracji poprzez linki w komponencie `Header`.
- **Wezwanie do działania (CTA):** Użytkownik jest zachęcany do przejścia na stronę rejestracji poprzez kliknięcie przycisków w sekcjach `HeroSection` oraz `CallToAction`.
- **Menu mobilne:** Na urządzeniach mobilnych użytkownik może otwierać i zamykać menu nawigacyjne.

## 9. Warunki i walidacja

Ten widok nie zawiera formularzy ani danych wejściowych od użytkownika, w związku z czym nie ma potrzeby implementacji warunków i walidacji.

## 10. Obsługa błędów

- **Brakujące zasoby (obrazy, ikony):** Należy upewnić się, że wszystkie zasoby statyczne są poprawnie umieszczone w katalogu `src/assets` lub `public` i linki do nich są prawidłowe. Dla wszystkich obrazów (`<img>`) należy zdefiniować atrybut `alt`, aby zapewnić dostępność i graceful degradation.
- **Niedziałające linki:** Wszystkie linki (`<a>`) muszą zostać przetestowane, aby upewnić się, że prowadzą do prawidłowych ścieżek.

## 11. Kroki implementacji

1. **Struktura plików:** Utworzyć plik strony `src/pages/index.astro`.
2. **Layout:** Upewnić się, że `index.astro` używa głównego layoutu aplikacji (`src/layouts/Layout.astro`).
3. **Tworzenie komponentów:** Stworzyć pliki dla każdego z pięciu głównych komponentów w `src/components/`: `Header.astro`, `HeroSection.astro`, `FeaturesSection.astro`, `CallToAction.astro`, `Footer.astro`.
4. **Implementacja `Header.astro`:** Dodać logo, linki nawigacyjne oraz logikę (skrypt kliencki) do obsługi menu mobilnego.
5. **Implementacja `HeroSection.astro`:** Dodać nagłówek, opis i przycisk CTA.
6. **Implementacja `FeaturesSection.astro`:** Dodać nagłówek sekcji. Stworzyć pomocniczy komponent `FeatureCard.astro` i użyć go do wyświetlenia kilku kluczowych funkcji. Użyć placeholderów dla grafik/zrzutów ekranu.
7. **Implementacja `CallToAction.astro`:** Dodać treść i przycisk CTA.
8. **Implementacja `Footer.astro`:** Dodać informację o prawach autorskich.
9. **Złożenie widoku:** Zaimportować i umieścić wszystkie pięć komponentów w odpowiedniej kolejności w pliku `src/pages/index.astro`.
10. **Stylowanie:** Ostylować wszystkie komponenty i całą stronę za pomocą Tailwind CSS, stosując podejście "mobile-first".
11. **Responsywność:** Przetestować i dopracować wygląd strony na różnych szerokościach ekranu (mobile, tablet, desktop).
12. **Dostępność i SEO:** Zweryfikować poprawność semantyczną HTML, dodać atrybuty `alt` dla obrazów oraz meta tagi w `Layout.astro`.
13. **Testowanie:** Ręcznie przetestować wszystkie interakcje, w tym linki i menu mobilne.
