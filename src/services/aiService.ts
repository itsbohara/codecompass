/**
 * AI Service
 * Handles communication with OpenAI-compatible APIs (Anthropic, litellm proxy, etc.)
 */

import OpenAI from 'openai';
import type { AIServiceConfig, AIError } from '../types';

/**
 * System prompt for the planning assistant role
 */
const SYSTEM_PROMPT = `You are an expert developer assistant specialized in software architecture and implementation planning.

When given a task, you should:
1. Break it down into clear, actionable steps
2. Identify files that need to be created or modified
3. Consider dependencies and prerequisites
4. Provide a logical ordering of steps

Respond with a structured plan in the following JSON format:
{
  "title": "Brief title of the plan",
  "summary": "2-3 sentence summary of what will be done",
  "steps": [
    {
      "description": "What this step does",
      "files": ["file/path/1.ts", "file/path/2.ts"],
      "notes": "Any important considerations"
    }
  ]
}`;

export class AIService {
  private client: OpenAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;

    // Initialize OpenAI client with optional custom endpoint
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.endpoint || undefined,
    });
  }

  /**
   * Generate a plan for the given task
   * @param prompt - The task description
   * @returns Generated plan as structured JSON
   */
  async generatePlan(prompt: string): Promise<unknown> {
    console.log('[AIService] generatePlan called');
    console.log('[AIService] Config:', {
      model: this.config.model,
      endpoint: this.config.endpoint || 'default',
      maxTokens: this.config.maxTokens,
      hasApiKey: !!this.config.apiKey,
      apiKeyPrefix: this.config.apiKey ? this.config.apiKey.substring(0, 8) + '...' : 'none',
    });

    try {
      console.log('[AIService] Creating chat completion request...');
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: this.config.maxTokens,
      });

      console.log('[AIService] Response received:', {
        id: response.id,
        model: response.model,
        choices: response.choices.length,
        usage: response.usage,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error('[AIService] No content in response');
        throw this.createError('No response content received from AI service');
      }

      console.log('[AIService] Raw content length:', content.length);
      console.log('[AIService] Raw content preview:', content.substring(0, 200) + '...');

      // Attempt to parse JSON response
      try {
        const parsed = JSON.parse(content);
        console.log('[AIService] Successfully parsed JSON response');
        return parsed;
      } catch (parseError) {
        console.error('[AIService] JSON parse failed, returning raw content:', parseError);
        // Return raw content if JSON parsing fails
        return { raw: content };
      }
    } catch (error) {
      console.error('[AIService] Error in generatePlan:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle and standardize errors from the AI service
   */
  private handleError(error: unknown): AIError {
    if (error instanceof OpenAI.APIError) {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        return {
          message: 'Invalid API key. Please check your CodeCompass API key in settings.',
          code: 'AUTH_ERROR',
          type: 'authentication',
          original: error,
        };
      }

      // Handle 429 Rate Limit
      if (error.status === 429) {
        return {
          message: 'Rate limit exceeded. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          type: 'rate_limit',
          original: error,
        };
      }

      // Handle 400 Bad Request
      if (error.status === 400) {
        return {
          message: 'Invalid request. Please check your configuration.',
          code: 'BAD_REQUEST',
          type: 'bad_request',
          original: error,
        };
      }

      // Other API errors
      return {
        message: `API error (${error.status}): ${error.message}`,
        code: error.code ?? undefined,
        type: 'unknown',
        original: error,
      };
    }

    // Handle network/connection errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error: Unable to reach the AI service. Check your connection and endpoint.',
        code: 'NETWORK_ERROR',
        type: 'network',
        original: error,
      };
    }

    return {
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      type: 'unknown',
      original: error,
    };
  }

  /**
   * Create an AI error object
   */
  private createError(message: string): AIError {
    return {
      message,
      type: 'unknown',
    };
  }

  /**
   * Update configuration (call when settings change)
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };

    // Recreate client with new config
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.endpoint || undefined,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<AIServiceConfig> {
    return { ...this.config };
  }
}