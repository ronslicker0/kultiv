import { execSync } from 'node:child_process';
import type { LLMProvider, LLMMessage, LLMResponse, LLMGenerateOptions } from './provider.js';

// ── Claude Code CLI Response Types ──────────────────────────────────────

interface ClaudeCodeJsonResponse {
  result?: string;
  content?: string;
  text?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

// ── Claude Code Provider ────────────────────────────────────────────────

/**
 * LLM provider that shells out to the Claude Code CLI (`claude`).
 *
 * Executes: claude -p --output-format json --model <model>
 * Pipes the prompt via stdin and parses JSON output.
 */
export class ClaudeCodeProvider implements LLMProvider {
  private model: string;
  private claudeBinary: string;

  constructor(model: string) {
    this.model = model;
    this.claudeBinary = this.detectBinary();
  }

  /**
   * Detect the claude binary path.
   * Tries `claude` first, falls back to `npx @anthropic-ai/claude-code`.
   */
  private detectBinary(): string {
    // Try bare `claude` command
    try {
      execSync('claude --version', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10_000,
        windowsHide: true,
      });
      return 'claude';
    } catch {
      // Not found — fall through
    }

    // Fall back to npx
    return 'npx @anthropic-ai/claude-code';
  }

  async generate(
    messages: LLMMessage[],
    _options?: LLMGenerateOptions
  ): Promise<LLMResponse> {
    // Combine all messages into a single prompt string.
    // Claude Code CLI takes a single prompt via -p flag.
    const prompt = messages
      .map((m) => {
        const prefix = m.role === 'user' ? 'Human' : 'Assistant';
        return `${prefix}: ${m.content}`;
      })
      .join('\n\n');

    const command = `${this.claudeBinary} -p --output-format json --model ${this.model}`;

    let stdout = '';
    try {
      stdout = execSync(command, {
        input: prompt,
        encoding: 'utf-8',
        timeout: 300_000, // 5 minute timeout for LLM calls
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
        // Ensure proper shell on Windows (git-bash or cmd)
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
      });
    } catch (err: unknown) {
      const execError = err as {
        status?: number | null;
        stdout?: string;
        stderr?: string;
        message?: string;
      };
      const stderr = execError.stderr ?? '';
      throw new Error(
        `Claude Code CLI failed (exit ${execError.status ?? 'unknown'}): ${stderr.slice(0, 500)}`
      );
    }

    // Parse JSON output
    const trimmed = stdout.trim();
    let content: string;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const parsed = JSON.parse(trimmed) as ClaudeCodeJsonResponse;
      content = parsed.result ?? parsed.content ?? parsed.text ?? trimmed;
      inputTokens = parsed.usage?.input_tokens ?? 0;
      outputTokens = parsed.usage?.output_tokens ?? 0;
    } catch {
      // If JSON parsing fails, treat the raw output as the content
      content = trimmed;
    }

    return {
      content,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    };
  }
}
