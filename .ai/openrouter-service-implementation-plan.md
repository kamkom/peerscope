# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

`OpenRouterService` to klasa po stronie serwera, odpowiedzialna za komunikację z API OpenRouter. Jej celem jest uproszczenie procesu wysyłania zapytań do modeli językowych (LLM) i otrzymywania ustrukturyzowanych odpowiedzi. Usługa będzie hermetyzować logikę budowania zapytań, obsługi uwierzytelniania, wysyłania żądań HTTP oraz parsowania i walidacji odpowiedzi, w tym odpowiedzi w formacie JSON zgodnych z podanym schematem.

Usługa zostanie zaimplementowana w TypeScript i będzie przeznaczona do użytku w endpointach API Astro (`src/pages/api`).

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` inicjalizuje usługę, pobierając klucz API z bezpiecznego miejsca, jakim są zmienne środowiskowe po stronie serwera.

```typescript
// src/lib/services/openrouter.service.ts

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";

  constructor() {
    // Klucz API jest dostępny tylko po stronie serwera w Astro
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined in environment variables.");
    }
  }

  // ... metody
}
```

## 3. Publiczne metody i pola

### `public async getChatCompletion<T>(params: ChatCompletionParams): Promise<T>`

Główna metoda publiczna, która wysyła zapytanie do API OpenRouter i zwraca odpowiedź w oczekiwanym formacie.

**Parametry (`ChatCompletionParams`):**

| Nazwa | Typ | Opis | Wymagane |
| :--- | :--- | :--- | :--- |
| `model` | `string` | Nazwa modelu do użycia (np. `anthropic/claude-3-haiku`). | Tak |
| `messages` | `Array<{ role: 'system' \| 'user' \| 'assistant'; content: string }>` | Tablica wiadomości stanowiąca kontekst rozmowy. | Tak |
| `responseSchema` | `ZodSchema<T>` | Schemat Zod używany do walidacji odpowiedzi i określenia `response_format`. | Nie |
| `temperature` | `number` | Parametr kontrolujący losowość odpowiedzi (0-2). | Nie |
| `max_tokens` | `number` | Maksymalna liczba tokenów w odpowiedzi. | Nie |

**Zwraca:**

`Promise<T>` - Obietnica, która rozwiązuje się do sparsowanej i zwalidowanej odpowiedzi modelu. Typ `T` jest inferowany na podstawie `responseSchema`. Jeśli `responseSchema` nie jest podane, zwraca `string`.

**Przykład użycia:**

```typescript
// W pliku /src/pages/api/character-generator.ts
import { z } from "zod";
import { OpenRouterService } from "@/lib/services/openrouter.service";

const characterSchema = z.object({
  name: z.string().describe("The character's name"),
  backstory: z.string().describe("A brief backstory for the character"),
});

const service = new OpenRouterService();
const response = await service.getChatCompletion({
  model: "anthropic/claude-3-haiku",
  messages: [
    { role: "system", content: "You are a creative character generator for a fantasy game." },
    { role: "user", content: "Generate a unique character based on a 'fire mage' concept." }
  ],
  responseSchema: characterSchema,
});

// response będzie obiektem typu: { name: string, backstory: string }
console.log(response.name);
```

## 4. Prywatne metody i pola

### `private _buildRequestPayload(params: ChatCompletionParams): object`

Buduje obiekt payloadu żądania na podstawie parametrów. Konwertuje schemat Zod na format `json_schema` wymagany przez OpenRouter.

### `private async _sendRequest(payload: object): Promise<object>`

Wysyła żądanie `POST` do API OpenRouter, używając `fetch`. Dodaje nagłówki autoryzacyjne i obsługuje podstawowe błędy HTTP.

### `private _parseAndValidateResponse<T>(response: object, schema?: ZodSchema<T>): T`

Parsuje odpowiedź z API. Jeśli `schema` jest dostarczone, parsuje wewnętrzną zawartość JSON (`message.content`) i waliduje ją za pomocą schematu Zod. W przeciwnym razie zwraca zawartość jako tekst.

## 5. Obsługa błędów

Błędy będą obsługiwane za pomocą niestandardowych klas wyjątków, co pozwoli na precyzyjne ich przechwytywanie w blokach `try...catch`.

**Niestandardowe klasy błędów:**

-   `OpenRouterAPIError`: Błędy zwrócone przez API OpenRouter (np. 4xx, 5xx).
-   `NetworkError`: Problemy z połączeniem sieciowym.
-   `ValidationError`: Błąd walidacji odpowiedzi, gdy odpowiedź modelu nie zgadza się z `responseSchema`.

**Scenariusze błędów i obsługa:**

| Scenariusz | Kod HTTP | Wyjątek | Sposób obsługi |
| :--- | :--- | :--- | :--- |
| Nieprawidłowy klucz API | 401 | `OpenRouterAPIError` | Zwróć błąd serwera (500) i zaloguj problem. |
| Przekroczony limit zapytań | 429 | `OpenRouterAPIError` | Zaimplementuj logikę ponawiania z wykładniczym backoffem. |
| Nieprawidłowe zapytanie | 400 | `OpenRouterAPIError` | Zaloguj szczegóły błędu, aby ułatwić debugowanie. |
| Błąd po stronie OpenRouter | 5xx | `OpenRouterAPIError` | Zaloguj błąd. Można spróbować ponowić zapytanie. |
| Brak połączenia z siecią | - | `NetworkError` | Zaloguj błąd. Poinformuj klienta o problemie z usługą. |
| Odpowiedź nie jest JSON | - | `ValidationError` | Złap błąd parsowania i rzuć `ValidationError`. |
| Odpowiedź nie pasuje do schematu | - | `ValidationError` | Złap błąd walidacji Zod i rzuć `ValidationError`. |

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API**: Klucz `OPENROUTER_API_KEY` musi być przechowywany jako zmienna środowiskowa (`.env`) i nigdy nie może być ujawniony po stronie klienta. Plik `.env` musi być dodany do `.gitignore`.
2.  **Walidacja danych wejściowych**: Chociaż usługa jest po stronie serwera, dane wejściowe pochodzące od użytkowników (np. zawartość wiadomości) powinny być walidowane i sanityzowane w endpointach API przed przekazaniem do usługi, aby zapobiec atakom typu prompt injection.
3.  **Ograniczenie dostępu**: Endpointy API korzystające z tej usługi powinny być zabezpieczone (np. wymagać uwierzytelnienia), aby uniknąć nieautoryzowanego wykorzystania i nadmiernych kosztów.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja środowiska

1.  Dodaj `zod` i `zod-to-json-schema` do zależności projektu:
    ```bash
    npm install zod zod-to-json-schema
    ```
2.  Utwórz plik `.env` w głównym katalogu projektu (jeśli jeszcze nie istnieje).
3.  Dodaj swój klucz API OpenRouter do pliku `.env`:
    ```
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
4.  Upewnij się, że `.env` jest dodany do `.gitignore`.

### Krok 2: Definicja typów i wyjątków

1.  Utwórz nowy plik: `src/lib/services/openrouter.service.ts`.
2.  Zdefiniuj w nim interfejsy dla parametrów i niestandardowe klasy błędów.

```typescript
// src/lib/services/openrouter.service.ts
import { z, ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// --- Custom Errors ---
export class OpenRouterAPIError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'OpenRouterAPIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

// --- Types ---
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionParams<T> {
  model: string;
  messages: ChatMessage[];
  responseSchema?: ZodSchema<T>;
  temperature?: number;
  max_tokens?: number;
}
```

### Krok 3: Implementacja szkieletu klasy `OpenRouterService`

Dodaj szkielet klasy wraz z konstruktorem i definicjami metod.

```typescript
// (ciąg dalszy pliku src/lib/services/openrouter.service.ts)

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      // Ten błąd zostanie rzucony podczas startu aplikacji, co jest pożądane
      throw new Error("FATAL: OPENROUTER_API_KEY is not defined in environment variables.");
    }
  }

  public async getChatCompletion<T>(params: ChatCompletionParams<T>): Promise<T> {
    // Logika do zaimplementowania
  }

  private _buildRequestPayload<T>(params: ChatCompletionParams<T>): object {
    // Logika do zaimplementowania
  }

  private async _sendRequest(payload: object): Promise<any> {
    // Logika do zaimplementowania
  }

  private _parseAndValidateResponse<T>(response: any, schema?: ZodSchema<T>): T {
    // Logika do zaimplementowania
  }
}
```

### Krok 4: Implementacja metod prywatnych

1.  **`_buildRequestPayload`**: Ta metoda przygotowuje ciało żądania. Kluczowym elementem jest konwersja `responseSchema` (Zod) na `json_schema` (OpenRouter).

```typescript
// wewnątrz klasy OpenRouterService
private _buildRequestPayload<T>(params: ChatCompletionParams<T>): object {
  const payload: any = {
    model: params.model,
    messages: params.messages,
    temperature: params.temperature,
    max_tokens: params.max_tokens,
  };

  if (params.responseSchema) {
    const jsonSchema = zodToJsonSchema(params.responseSchema, {
      name: "response_schema",
      errorMessages: true,
    });

    payload.response_format = {
      type: "json_schema",
      json_schema: {
        name: "extract_data", // Nazwa funkcji, dowolna
        strict: true,
        schema: jsonSchema.definitions!.response_schema,
      },
    };
  }

  // Usuń niezdefiniowane klucze, aby nie wysyłać ich w payloadzie
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  return payload;
}
```

2.  **`_sendRequest`**: Metoda odpowiedzialna za wysłanie żądania `fetch`.

```typescript
// wewnątrz klasy OpenRouterService
private async _sendRequest(payload: object): Promise<any> {
  try {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new OpenRouterAPIError(
        `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof OpenRouterAPIError) throw error;
    // Rzuć jako NetworkError, jeśli to nie jest błąd API
    throw new NetworkError("Failed to send request to OpenRouter", { cause: error });
  }
}
```

3.  **`_parseAndValidateResponse`**: Metoda parsuje i waliduje odpowiedź.

```typescript
// wewnątrz klasy OpenRouterService
private _parseAndValidateResponse<T>(response: any, schema?: ZodSchema<T>): T {
  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new ValidationError("Response content is empty or missing.");
  }

  if (schema) {
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new ValidationError("Failed to parse response content as JSON.", { cause: error });
    }

    const validationResult = schema.safeParse(parsedContent);
    if (!validationResult.success) {
      throw new ValidationError("Response data does not match the provided schema.", {
        cause: validationResult.error,
      });
    }
    return validationResult.data;
  }

  return content as T; // Zwraca string, jeśli nie ma schematu
}
```

### Krok 5: Implementacja metody publicznej `getChatCompletion`

Połącz wszystkie prywatne metody w jedną całość.

```typescript
// wewnątrz klasy OpenRouterService
public async getChatCompletion<T>(params: ChatCompletionParams<T>): Promise<T> {
  const payload = this._buildRequestPayload(params);
  const response = await this._sendRequest(payload);
  return this._parseAndValidateResponse(response, params.responseSchema);
}
```

### Krok 6: Przykład użycia w Astro API Route

Utwórz plik `src/pages/api/generate-story.ts` do przetestowania usługi.

```typescript
// src/pages/api/generate-story.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { 
  OpenRouterService, 
  ValidationError, 
  OpenRouterAPIError, 
  NetworkError 
} from "@/lib/services/openrouter.service";

const storySchema = z.object({
  title: z.string().describe("The title of the story"),
  story: z.string().describe("The generated short story"),
  characters: z.array(z.string()).describe("List of main characters"),
});

export const POST: APIRoute = async ({ request }) => {
  const { prompt } = await request.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
  }
  
  const openRouterService = new OpenRouterService();

  try {
    const result = await openRouterService.getChatCompletion({
      model: "anthropic/claude-3-haiku",
      messages: [
        { role: "system", content: "You are a master storyteller. Generate a short story based on the user's prompt." },
        { role: "user", content: prompt },
      ],
      responseSchema: storySchema,
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error); // Logowanie błędu na serwerze
    
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: "Invalid response from AI model", details: error.message }), { status: 502 }); // Bad Gateway
    }
    if (error instanceof OpenRouterAPIError) {
      return new Response(JSON.stringify({ error: "Failed to communicate with OpenRouter API", details: error.message }), { status: error.status });
    }
    if (error instanceof NetworkError) {
       return new Response(JSON.stringify({ error: "Network error", details: error.message }), { status: 503 }); // Service Unavailable
    }
    
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
  }
};
```
