import type { LLMProvider, LLMMessage, LLMResponse, LLMGenerateOptions } from './provider.js';

// ── Ollama REST API Types ───────────────────────────────────────────────

interface OllamaChatMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: OllamaChatMessage;
  done: boolean;
  eval_count?: number;
  prompt_eval_count?: number;
}

// ── Ollama Provider ─────────────────────────────────────────────────────

export class OllamaProvider implements LLMProvider {
  private model: string;
  private baseUrl: string;

  constructor(model: string, baseUrl?: string) {
    this.model = model;
    this.baseUrl = (baseUrl ?? 'http://localhost:11434').replace(/\/$/, '');
  }

  async generate(
    messages: LLMMessage[],
    options?: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const temperature = options?.temperature ?? 0.7;

    const ollamaMessages: OllamaChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body = JSON.stringify({
      model: this.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature,
        ...(options?.maxTokens ? { num_predict: options.maxTokens } : {}),
      },
    });

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (err) {
      throw new Error(
        `Failed to connect to Ollama at ${this.baseUrl}. ` +
        `Is the Ollama server running? Error: ${String(err)}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Ollama API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;

    return {
      content: data.message?.content ?? '',
      input_tokens: data.prompt_eval_count ?? 0,
      output_tokens: data.eval_count ?? 0,
    };
  }
}
