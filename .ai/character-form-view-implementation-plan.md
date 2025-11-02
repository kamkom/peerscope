# Plan implementacji widoku: Tworzenie / Edycja Postaci

## 1. Przegląd

Widok "Tworzenie / Edycja Postaci" to formularz umożliwiający użytkownikom wprowadzanie i modyfikowanie danych dotyczących Postaci w aplikacji Peerscope. Służy jako centralny punkt do zarządzania profilami osób, które użytkownik chce analizować. Formularz jest kluczowy dla podstawowej funkcjonalności aplikacji, ponieważ dane te stanowią podstawę dla modułu analizy AI. Widok ten musi obsługiwać zarówno tworzenie nowych Postaci (w tym profilu własnego użytkownika), jak i edycję już istniejących.

## 2. Routing widoku

Widok będzie dostępny pod dwoma głównymi ścieżkami:

- `/characters/new`: Do tworzenia nowej Postaci.
- `/characters/[id]/edit`: Do edycji istniejącej Postaci, gdzie `[id]` to unikalny identyfikator postaci.

Dodatkowo, ścieżka `/characters/new?is_owner=true` będzie używana w procesie onboardingu do tworzenia profilu własnego użytkownika.

## 3. Struktura komponentów

Komponenty będą zaimplementowane w React i osadzone na stronie Astro. Hierarchia komponentów będzie wyglądać następująco:

```
/pages/characters/new.astro
└── <Layout>
    └── <CharacterForm client:load isOwnerProfile={true} />

/pages/characters/[id]/edit.astro
└── <Layout>
    └── <CharacterForm client:load initialData={characterData} />
```

Drzewo komponentów React:

```
<CharacterForm>
├── <Form> (z react-hook-form & Shadcn)
│   ├── <FormField name="name"> -> <Input />
│   ├── <FormField name="role"> -> <Select />
│   ├── <FormField name="description"> -> <Textarea />
│   ├── <Button> (do użycia szablonu)
│   ├── <FormField name="traits"> -> <TagInput />
│   ├── <FormField name="motivations"> -> <TagInput />
│   ├── <FormField name="avatar_url"> -> <FileUpload />
│   └── <Button type="submit">
└── <Toaster /> (z shadcn/sonner do notyfikacji)
```

## 4. Szczegóły komponentów

### `CharacterForm` (React, komponent główny)

- **Opis komponentu**: Zarządza stanem całego formularza, obsługuje walidację, komunikację z API oraz renderuje poszczególne pola formularza. Jest to komponent-kontener, który będzie używany zarówno do tworzenia, jak i edycji postaci.
- **Główne elementy**: Wykorzystuje komponent `<Form>` z biblioteki `react-hook-form` zintegrowanej z Shadcn/ui do budowy struktury. Renderuje komponenty `Input`, `Select`, `Textarea`, `FileUpload` oraz `TagInput`.
- **Obsługiwane interakcje**:
  - Wypełnianie pól formularza.
  - Wysyłka formularza (submit).
  - Użycie szablonu opisu na podstawie wybranej roli.
- **Obsługiwana walidacja**: Walidacja jest realizowana po stronie klienta przy użyciu `zod` i `@hookform/resolvers/zod`, zgodnie ze schematem z backendu.
- **Typy**: `CharacterFormProps`, `CharacterFormViewModel` (oparty na `zod.infer<typeof characterFormSchema>`).
- **Propsy**:
  ```typescript
  interface CharacterFormProps {
    initialData?: CharacterDto; // Dane do wypełnienia formularza w trybie edycji
    isOwnerProfile?: boolean; // Flaga wskazująca, że tworzony jest profil właściciela
  }
  ```

### `FileUpload` (React, komponent niestandardowy)

- **Opis komponentu**: Umożliwia użytkownikowi przesłanie pliku graficznego (awatara), wyświetla jego podgląd i zarządza procesem wysyłki do Supabase Storage.
- **Główne elementy**: `div` jako dropzone, ukryty `input type="file"`, `img` do podglądu, `Button` do usunięcia obrazka.
- **Obsługiwane interakcje**:
  - Wybór pliku z dysku.
  - Upuszczenie pliku (drag-and-drop).
  - Usunięcie wybranego/przesłanego obrazka.
- **Obsługiwana walidacja**: Typ pliku (np. `image/png`, `image/jpeg`), rozmiar pliku (np. max 2MB).
- **Typy**: Komponent zarządza wewnętrznym stanem, a po pomyślnym przesłaniu wywołuje funkcję z `react-hook-form` (`setValue`) w celu zaktualizowania pola `avatar_url`.
- **Propsy**:
  ```typescript
  interface FileUploadProps {
    value: string | undefined; // Aktualny URL awatara
    onChange: (url?: string) => void; // Funkcja do aktualizacji wartości w formularzu
  }
  ```

### `TagInput` (React, komponent niestandardowy)

- **Opis komponentu**: Pole do wprowadzania wielu wartości tekstowych (tagów), używane dla cech i motywacji. Użytkownik może dodawać tagi, wpisując tekst i naciskając Enter.
- **Główne elementy**: `Input` do wpisywania nowego taga, kontenery `div` lub `Badge` (z Shadcn) do wyświetlania dodanych tagów z przyciskiem do ich usuwania.
- **Obsługiwane interakcje**:
  - Dodawanie nowego taga.
  - Usuwanie istniejącego taga.
- **Obsługiwana walidacja**: Opcjonalnie: maksymalna liczba tagów, maksymalna długość pojedynczego taga.
- **Typy**: Wartością komponentu jest `string[]`.
- **Propsy**:
  ```typescript
  interface TagInputProps {
    value: string[]; // Aktualna lista tagów
    onChange: (tags: string[]) => void; // Funkcja do aktualizacji wartości
    placeholder?: string;
  }
  ```

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy, a także zdefiniowany zostanie lokalny schemat walidacji i model widoku dla formularza.

- **`CreateCharacterCommand` (z `src/types.ts`)**: Używany do typowania payloadu żądania API.
- **`CharacterDto` (z `src/types.ts`)**: Używany do typowania danych postaci przekazywanych w trybie edycji.
- **`characterFormSchema` (lokalny, w komponencie `CharacterForm`)**: Schemat walidacji `zod` odzwierciedlający ten z backendu.

  ```typescript
  import { z } from "zod";

  const characterFormSchema = z.object({
    name: z.string().min(1, { message: "Imię jest wymagane" }),
    role: z.string().optional(),
    description: z.string().optional(),
    traits: z.array(z.string()).optional(),
    motivations: z.array(z.string()).optional(),
    avatar_url: z.string().url({ message: "Nieprawidłowy format URL" }).optional(),
    is_owner: z.boolean(),
  });
  ```

- **`CharacterFormViewModel`**: Typ dla danych formularza, wyinferowany ze schemy `zod`.
  ```typescript
  type CharacterFormViewModel = z.infer<typeof characterFormSchema>;
  ```

## 6. Zarządzanie stanem

Stan formularza będzie zarządzany lokalnie w komponencie `CharacterForm` przy użyciu biblioteki `react-hook-form`.

- **`useForm` hook**: Inicjalizowany z `zodResolver(characterFormSchema)` do automatycznej walidacji.
- **Domyślne wartości**:
  - W trybie tworzenia: pola są puste, a `is_owner` jest ustawiane na podstawie propa `isOwnerProfile` lub na `false`.
  - W trybie edycji: formularz jest inicjalizowany danymi z propa `initialData`.
- **Custom hook**: Można stworzyć hook `useCharacterForm`, aby zamknąć w nim logikę `useForm`, obsługę wysyłki (mutację danych), stany ładowania/błędów oraz wyświetlanie notyfikacji.

## 7. Integracja API

Integracja z API będzie polegać na komunikacji z endpointem `/api/characters`.

- **Tworzenie postaci**:
  - **Akcja**: Wysyłka formularza w trybie "create".
  - **Metoda**: `POST`
  - **URL**: `/api/characters`
  - **Typ żądania**: `CreateCharacterCommand`
  - **Typ odpowiedzi (success)**: `CharacterDto`
- **Edycja postaci**: (Wymaga stworzenia endpointu `PUT /api/characters/[id]`)
  - **Akcja**: Wysyłka formularza w trybie "edit".
  - **Metoda**: `PUT`
  - **URL**: `/api/characters/[id]`
  - **Typ żądania**: `UpdateCharacterCommand`
  - **Typ odpowiedzi (success)**: `CharacterDto`

Przesyłanie awatara będzie obsługiwane oddzielnie przez bezpośrednią komunikację z Supabase Storage API z poziomu komponentu `FileUpload`, przed wysłaniem głównego formularza.

## 8. Interakcje użytkownika

- **Wypełnianie formularza**: Użytkownik wpisuje dane w pola. Stan jest aktualizowany na bieżąco przez `react-hook-form`.
- **Walidacja w czasie rzeczywistym**: Błędy walidacji mogą być wyświetlane po utracie fokusu przez pole (`onBlur`).
- **Wysyłka**: Użytkownik klika przycisk "Zapisz". Przycisk jest nieaktywny, jeśli formularz jest w trakcie wysyłki lub dane są nieprawidłowe.
- **Użycie szablonu**: Użytkownik wybiera rolę, a następnie klika przycisk "Użyj szablonu". Pole opisu zostaje wypełnione predefiniowanym tekstem.
- **Przesyłanie awatara**: Użytkownik klika na komponent `FileUpload`, wybiera plik. Rozpoczyna się przesyłanie, a w interfejsie widoczny jest stan ładowania i podgląd obrazu.

## 9. Warunki i walidacja

Walidacja jest kluczowym elementem formularza i będzie oparta o schemat `zod`.

- `name`: Musi być stringiem o długości co najmniej 1 znaku. Interfejs wyświetli komunikat "Imię jest wymagane", jeśli pole będzie puste.
- `avatar_url`: Jeśli podany, musi być poprawnym adresem URL.
- `is_owner`: Wartość logiczna, pole ukryte, ustawiane automatycznie.
- Pozostałe pola są opcjonalne.
- Przycisk "Zapisz" będzie nieaktywny (`disabled`), dopóki wszystkie wymagane pola nie zostaną poprawnie wypełnione (`!form.formState.isValid`).

## 10. Obsługa błędów

- **Błędy walidacji klienta**: Komunikaty o błędach są wyświetlane pod odpowiednimi polami formularza natychmiast po walidacji.
- **Błędy API (4xx, 5xx)**: Po otrzymaniu błędu z serwera (np. `500 Internal Server Error`), użytkownikowi zostanie wyświetlona globalna notyfikacja (toast) z informacją o niepowodzeniu operacji, np. "Wystąpił błąd podczas zapisywania postaci. Spróbuj ponownie."
- **Błąd przesyłania awatara**: W obrębie komponentu `FileUpload` zostanie wyświetlony komunikat o błędzie, np. "Nie udało się przesłać pliku. Spróbuj ponownie." Operacja nie blokuje reszty formularza, ale `avatar_url` nie zostanie zaktualizowany.
- **Brak autoryzacji (401)**: Aplikacja powinna przechwycić ten błąd globalnie i przekierować użytkownika na stronę logowania.

## 11. Kroki implementacji

1.  **Stworzenie plików**: Utworzenie plików dla stron Astro: `/src/pages/characters/new.astro` i `/src/pages/characters/[id]/edit.astro`.
2.  **Zdefiniowanie typów i schemy**: Stworzenie schematu walidacji `characterFormSchema` w pliku komponentu `CharacterForm`.
3.  **Implementacja komponentów UI**: Stworzenie niestandardowych komponentów `FileUpload` i `TagInput` z wykorzystaniem prymitywów z Shadcn/ui.
4.  **Budowa komponentu `CharacterForm`**:
    - Zintegrowanie `react-hook-form` z `zodResolver`.
    - Zbudowanie layoutu formularza przy użyciu komponentów Shadcn/ui oraz `FileUpload` i `TagInput`.
    - Implementacja logiki do obsługi trybu "create" vs "edit" na podstawie propsów.
5.  **Logika przesyłania awatara**: Implementacja funkcji przesyłania pliku do Supabase Storage w komponencie `FileUpload`.
6.  **Integracja z API**:
    - Stworzenie funkcji `onSubmit`, która będzie zbierać dane z formularza.
    - Wywołanie `POST /api/characters` (lub `PUT` w trybie edycji).
    - Dodanie obsługi stanów ładowania i błędów.
7.  **Obsługa notyfikacji**: Zintegrowanie biblioteki `sonner` (lub innej) do wyświetlania powiadomień "toast" o sukcesie lub porażce operacji.
8.  **Implementacja stron Astro**: Osadzenie komponentu `CharacterForm` na stronach `new.astro` i `edit.astro`, przekazując odpowiednie propsy. Dla strony edycji, zaimplementowanie logiki pobierania danych początkowych postaci.
9.  **Testowanie**: Ręczne przetestowanie wszystkich scenariuszy: tworzenie profilu własnego, tworzenie innej postaci, walidacja, obsługa błędów oraz tryb edycji (gdy będzie gotowy).
