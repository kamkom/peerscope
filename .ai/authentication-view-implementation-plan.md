# Plan implementacji widoku Uwierzytelniania

## 1. Przegląd

Celem jest wdrożenie widoków logowania i rejestracji, które będą dostępne dla użytkowników w formie okien modalnych. Umożliwią one nowym użytkownikom założenie konta, a obecnym zalogowanie się do aplikacji. Komponenty te będą kluczowym elementem przepływu uwierzytelniania, zapewniając walidację danych po stronie klienta oraz obsługę komunikacji z API backendowym.

## 2. Routing widoku

Widoki nie będą miały dedykowanych ścieżek URL (np. `/login`). Zamiast tego, będą one renderowane w komponencie modalnym, którego stan (widoczność i typ formularza) będzie zarządzany globalnie. Przyciski do otwierania modali będą umieszczone w głównym komponencie nagłówka (`Header.astro`).

## 3. Struktura komponentów

Hierarchia komponentów zostanie zorganizowana w celu zapewnienia reużywalności i separacji logiki. Stan modala będzie kontrolowany przez globalny store (Zustand), aby umożliwić komunikację między komponentami Astro i React.

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthModal.tsx         # Główny komponent modalny
│   │   ├── LoginForm.tsx         # Formularz logowania
│   │   └── RegistrationForm.tsx  # Formularz rejestracji
│   └── Header.astro              # (Do modyfikacji) Będzie zawierał przyciski
└── lib/
    └── stores/
        └── authModal.store.ts    # Globalny store Zustand do zarządzania stanem modala
```

## 4. Szczegóły komponentów

### `AuthModal.tsx`

- **Opis komponentu:** Reużywalny komponent modalny (oparty na `Dialog` z biblioteki Shadcn/ui), który warunkowo renderuje `LoginForm` lub `RegistrationForm` na podstawie stanu z globalnego store'a.
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`.
- **Obsługiwane interakcje:**
  - Otwieranie/zamykanie modala.
  - Przełączanie widoku między logowaniem a rejestracją.
- **Obsługiwana walidacja:** Brak walidacji na tym poziomie.
- **Typy:** `AuthModalState` (ze store'a).
- **Propsy:** Brak, komponent jest w pełni kontrolowany przez globalny store.

### `LoginForm.tsx`

- **Opis komponentu:** Formularz logowania z polami na e-mail i hasło. Wykorzystuje `react-hook-form` do zarządzania stanem formularza i `zod` do walidacji.
- **Główne elementy:** Komponenty `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` z Shadcn/ui, `Input`, `Button`. Zawiera również link do przełączenia na widok rejestracji.
- **Obsługiwane interakcje:**
  - Wprowadzanie danych w polach formularza.
  - Przesłanie formularza (`onSubmit`).
  - Kliknięcie linku "Nie masz konta? Zarejestruj się", który zmienia stan w globalnym store.
- **Obsługiwana walidacja:**
  - `email`: Pole wymagane, musi być w poprawnym formacie adresu e-mail.
  - `password`: Pole wymagane, nie może być puste.
- **Typy:** `LoginFormData`, `LoginFormSchema`.
- **Propsy:** Brak.

### `RegistrationForm.tsx`

- **Opis komponentu:** Formularz rejestracji z polami na e-mail, hasło i potwierdzenie hasła. Również wykorzystuje `react-hook-form` i `zod`.
- **Główne elementy:** Podobne do `LoginForm`, ale z dodatkowym polem `confirmPassword`. Zawiera link do przełączenia na widok logowania.
- **Obsługiwane interakcje:**
  - Wprowadzanie danych w polach formularza.
  - Przesłanie formularza (`onSubmit`).
  - Kliknięcie linku "Masz już konto? Zaloguj się".
- **Obsługiwana walidacja:**
  - `email`: Pole wymagane, musi być w poprawnym formacie adresu e-mail.
  - `password`: Pole wymagane, minimalna długość (np. 6 znaków).
  - `confirmPassword`: Pole wymagane, musi być identyczne z polem `password`.
- **Typy:** `RegistrationFormData`, `RegistrationFormSchema`.
- **Propsy:** Brak.

## 5. Typy

Wymagane będzie zdefiniowanie typów dla danych formularzy oraz schematów walidacji `zod`.

```typescript
// Plik: src/components/Auth/LoginForm.tsx

import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Niepoprawny format adresu e-mail." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

// Plik: src/components/Auth/RegistrationForm.tsx

import { z } from "zod";

export const RegistrationFormSchema = z
  .object({
    email: z.string().email({ message: "Niepoprawny format adresu e-mail." }),
    password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne.",
    path: ["confirmPassword"], // Ścieżka do pola, przy którym ma się pojawić błąd
  });

export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;
```

## 6. Zarządzanie stanem

Stan modala będzie zarządzany globalnie przy użyciu biblioteki **Zustand**, co umożliwi łatwą komunikację między komponentami Astro (`Header`) a React (`AuthModal`).

```typescript
// Plik: src/lib/stores/authModal.store.ts

import { create } from "zustand";

type AuthView = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  openModal: (view: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",
  openModal: (view) => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
```

Stan formularzy (`LoginForm`, `RegistrationForm`) będzie zarządzany lokalnie przy użyciu biblioteki `react-hook-form`.

## 7. Integracja API

Integracja z API będzie realizowana poprzez funkcję `fetch` wewnątrz funkcji `onSubmit` każdego z formularzy.

- **Logowanie:**
  - **Endpoint:** `POST /api/auth/signin`
  - **Typ żądania (Request):** `FormData` zawierające `email` i `password`.
  - **Typ odpowiedzi (Response):** W przypadku sukcesu, serwer zwróci odpowiedź `302 Found` z przekierowaniem na `/dashboard`. Przeglądarka automatycznie podąży za przekierowaniem. W przypadku błędu, odpowiedź będzie miała status `400` lub `500` z komunikatem błędu w ciele odpowiedzi.

- **Rejestracja:**
  - **Endpoint:** `POST /api/auth/register`
  - **Typ żądania (Request):** `FormData` zawierające `email` i `password`.
  - **Typ odpowiedzi (Response):** Analogicznie do logowania, sukces skutkuje przekierowaniem na `/dashboard`, a błąd zwraca odpowiedni status i komunikat.

## 8. Interakcje użytkownika

- **Otwarcie modala:** Użytkownik klika przycisk "Zaloguj" lub "Zarejestruj" w `Header.astro`, co wywołuje akcję `openModal` ze store'a Zustand.
- **Przełączanie formularzy:** Wewnątrz modala użytkownik może klikać linki, aby przełączać się między formularzem logowania a rejestracji (wywołując akcję `setView`).
- **Wprowadzanie danych:** Walidacja odbywa się na bieżąco (on-the-fly) dzięki `react-hook-form`.
- **Wysyłka formularza:** Kliknięcie przycisku "Zaloguj" / "Zarejestruj" uruchamia walidację. Jeśli jest poprawna, przycisk jest blokowany, a do API wysyłane jest żądanie. Po otrzymaniu odpowiedzi, przycisk jest odblokowywany.
- **Sukces:** Przeglądarka zostaje automatycznie przekierowana na `/dashboard`.
- **Błąd:** Pod formularzem wyświetlany jest komunikat błędu zwrócony przez API.

## 9. Warunki i walidacja

- **Formularz rejestracji:**
  - `email` musi być poprawnym adresem email.
  - `password` musi mieć minimum 6 znaków.
  - `confirmPassword` musi być identyczne z `password`.
- **Formularz logowania:**
  - `email` musi być poprawnym adresem email.
  - `password` nie może być puste.
- Wszystkie walidacje będą implementowane za pomocą schematów `zod` i obsługiwane przez `react-hook-form`, wyświetlając komunikaty o błędach pod odpowiednimi polami.

## 10. Obsługa błędów

- **Błędy walidacji klienta:** Obsługiwane przez `react-hook-form` i `zod`, komunikaty wyświetlane są w interfejsie użytkownika.
- **Błędy API (np. zły login/hasło, email zajęty):** Odpowiedź z serwera zostanie przechwycona w bloku `catch` funkcji `fetch`. Komunikat błędu (`await response.text()`) zostanie zapisany w lokalnym stanie komponentu i wyświetlony użytkownikowi w dedykowanym miejscu w formularzu (np. nad przyciskiem "Wyślij").
- **Błędy sieciowe:** Ogólny komunikat o błędzie sieci ("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.") zostanie wyświetlony w przypadku problemów z połączeniem.

## 11. Kroki implementacji

1.  **Stworzenie globalnego store'a:** Utworzenie pliku `src/lib/stores/authModal.store.ts` i zaimplementowanie store'a Zustand zgodnie z definicją w sekcji 6.
2.  **Stworzenie komponentów formularzy:**
    - Utworzenie plików `LoginForm.tsx` i `RegistrationForm.tsx` w `src/components/Auth/`.
    - Zaimplementowanie struktury formularzy przy użyciu komponentów Shadcn/ui.
    - Zdefiniowanie schematów `zod` i typów `FormData` dla każdego formularza.
    - Integracja z `react-hook-form` w celu zarządzania stanem i walidacją.
3.  **Implementacja logiki API:**
    - W obu komponentach formularzy, zaimplementowanie funkcji `onSubmit`, która tworzy obiekt `FormData` i wysyła żądanie `fetch` do odpowiedniego endpointu (`/api/auth/signin` lub `/api/auth/register`).
    - Dodanie obsługi stanu ładowania (np. blokowanie przycisku) oraz wyświetlania błędów zwróconych przez API.
4.  **Stworzenie komponentu `AuthModal`:**
    - Utworzenie pliku `src/components/Auth/AuthModal.tsx`.
    - Zaimplementowanie komponentu `Dialog` z Shadcn/ui.
    - Pobranie stanu `isOpen` i `view` z `useAuthModalStore` w celu kontrolowania widoczności modala i renderowania odpowiedniego formularza (`LoginForm` lub `RegistrationForm`).
5.  **Modyfikacja `Header.astro` i `Layout.astro`:**
    - Dodanie komponentu `<AuthModal client:load />` do głównego layoutu aplikacji (`Layout.astro`), aby był dostępny na każdej stronie.
    - W `Header.astro`, dodanie przycisków "Zaloguj" i "Zarejestruj" z tagami `<script>` lub osobnym skryptem, który będzie importował i wywoływał akcję `openModal` ze store'a Zustand.
    - Zaimplementowanie logiki w `Header.astro` (z wykorzystaniem `Astro.locals` z middleware), aby warunkowo wyświetlać przyciski logowania/rejestracji lub przycisk "Wyloguj" (`<a href="/api/auth/signout">...</a>`) dla zalogowanych użytkowników.
6.  **Implementacja middleware:** Utworzenie pliku `src/middleware/index.ts` (jeśli nie istnieje), który będzie weryfikował sesję użytkownika na podstawie ciasteczek i ustawiał `Astro.locals.isAuthenticated`.
7.  **Testowanie:** Gruntowne przetestowanie całego przepływu: otwieranie modali, walidacja po stronie klienta, obsługa błędów API, pomyślne logowanie/rejestracja i przekierowanie.
