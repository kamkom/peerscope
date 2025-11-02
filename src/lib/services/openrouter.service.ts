import { z, ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// --- Custom Errors ---
export class OpenRouterAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = "OpenRouterAPIError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public cause?: any
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public cause?: any
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// --- Types ---
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams<T> {
  model: string;
  messages: ChatMessage[];
  responseSchema?: ZodSchema<T>;
  temperature?: number;
  max_tokens?: number;
}

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
    const payload = this._buildRequestPayload(params);
    const response = await this._sendRequest(payload);
    return this._parseAndValidateResponse(response, params.responseSchema);
  }

  private _buildRequestPayload<T>(params: ChatCompletionParams<T>): object {
    const payload: any = {
      model: params.model || "google/gemini-2.5-flash",
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
        type: "json_object",
      };

      const lastMessage = payload.messages[payload.messages.length - 1];
      lastMessage.content = `${lastMessage.content} Always respond with a JSON object that respects the following JSON schema: ${JSON.stringify(jsonSchema.definitions!.response_schema)}`;
    }

    // Usuń niezdefiniowane klucze, aby nie wysyłać ich w payloadzie
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    return payload;
  }

  private async _sendRequest(payload: object): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new OpenRouterAPIError(`API request failed with status ${response.status}`, response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OpenRouterAPIError) throw error;
      // Rzuć jako NetworkError, jeśli to nie jest błąd API
      throw new NetworkError("Failed to send request to OpenRouter", {
        cause: error,
      });
    }
  }

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
        throw new ValidationError("Failed to parse response content as JSON.", {
          cause: error,
        });
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
}
