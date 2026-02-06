/**
 * Configuration Service
 * Manages VSCode workspace settings and environment configuration for CodeCompass
 */

import * as vscode from "vscode";

/**
 * VSCode configuration keys (relative to "codecompass" section)
 * When using getConfiguration("codecompass"), use relative keys
 */
const CONFIG_KEYS = {
  API_KEY: "apiKey",
  ENDPOINT: "endpoint",
  MODEL: "model",
  MAX_TOKENS: "maxTokens",
} as const;

/**
 * Default model value
 */
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

/**
 * Default max tokens value
 */
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Default endpoint (use empty to use OpenAI default)
 */
const DEFAULT_ENDPOINT = "";

export class ConfigService {
  private config: vscode.WorkspaceConfiguration;
  private lastModel: string;

  constructor() {
    this.config = vscode.workspace.getConfiguration("codecompass");
    this.lastModel = this.model;
  }

  /**
   * Get API key from configuration, with environment variable fallback
   */
  get apiKey(): string {
    const configKey = this.config.get<string>(CONFIG_KEYS.API_KEY, "");
    const trimmedConfigKey = configKey ? configKey.trim() : "";

    if (trimmedConfigKey) {
      return trimmedConfigKey;
    }

    return process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "";
  }

  /**
   * Get custom endpoint URL for OpenAI-compatible APIs
   */
  get endpoint(): string {
    return (
      this.config.get<string>(CONFIG_KEYS.ENDPOINT, DEFAULT_ENDPOINT) ||
      DEFAULT_ENDPOINT
    );
  }

  /**
   * Get model identifier
   */
  get model(): string {
    return this.config.get<string>(CONFIG_KEYS.MODEL) || DEFAULT_MODEL;
  }

  /**
   * Get max tokens setting
   */
  get maxTokens(): number {
    return (
      this.config.get<number>(CONFIG_KEYS.MAX_TOKENS, DEFAULT_MAX_TOKENS) ||
      DEFAULT_MAX_TOKENS
    );
  }

  /**
   * Get complete AI service configuration
   */
  get aiConfig() {
    return {
      apiKey: this.apiKey,
      endpoint: this.endpoint,
      model: this.model,
      maxTokens: this.maxTokens,
    };
  }

  /**
   * Open VSCode settings UI at CodeCompass configuration section
   */
  async openSettings(): Promise<void> {
    await vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "codecompass.apiKey",
    );
  }

  /**
   * Check if API key is configured and show warning if missing
   */
  async checkApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      const action = await vscode.window.showWarningMessage(
        "CodeCompass: API key not configured. Set it in settings to use AI features.",
        "Open Settings",
        "Dismiss",
      );

      if (action === "Open Settings") {
        await this.openSettings();
      }
      return false;
    }
    return true;
  }

  /**
   * Reload configuration (call when settings might have changed)
   */
  reloadConfig(): void {
    this.config = vscode.workspace.getConfiguration("codecompass");
    this.lastModel = this.model;
  }
}
