import OpenAI from 'openai';
import type { LLMProvider, LLMMessage, LLMResponse, LLMGenerateOptions } from './provider.js';

// ── OpenAI Provider ─────────────────────────────────────────────────────

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(model: string, authEnv?: string, oauthTokenEnv?: string) {
    // Prefer OAuth token if provided, then fall back to API key
    let apiKey: string | undefined;

    if (oauthTokenEnv) {
      apiKey = process.env[oauthTokenEnv];
      if (apiKey) {
        // OAuth tokens are passed as Bearer tokens via the same apiKey field
        this.client = new OpenAI({ apiKey });
        this.model = model;
        return;
      }
    }

    const envVar = authEnv ?? 'OPENAI_API_KEY';
    apiKey = process.env[envVar];

    if (!apiKey) {
      throw new Error(
        `OpenAI API key not found. Set the ${envVar} environment variable.`
      );
    }

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(
    messages: LLMMessage[],
    options?: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const maxTokens = options?.maxTokens ?? 4096;
    const temperature = options?.temperature ?? 0.7;

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature,
      messages: openaiMessages,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? '';

    return {
      content,
      input_tokens: response.usage?.prompt_tokens ?? 0,
      output_tokens: response.usage?.completion_tokens ?? 0,
    };
  }
}
