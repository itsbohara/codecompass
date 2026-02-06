/**
 * Type definitions for CodeCompass core services
 */

/**
 * A generated plan structure for code tasks
 */
export interface Plan {
  id: string;
  task: string;
  steps: PlanStep[];
  createdAt: Date;
  status: 'draft' | 'active' | 'completed' | 'failed';
}

/**
 * Individual step within a plan
 */
export interface PlanStep {
  id: string;
  description: string;
  files?: string[];
  order: number;
  completed?: boolean;
}

/**
 * Context gathered for AI planning
 */
export interface Context {
  workspaceRoot?: string;
  activeFile?: {
    path: string;
    content: string;
    language: string;
  };
  workspaceStructure?: string[];
  techStack?: string;
  dependencies?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

/**
 * AI service configuration
 */
export interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
}

/**
 * Request to generate a plan
 */
export interface PlanRequest {
  task: string;
  includeActiveFile?: boolean;
  includeWorkspaceStructure?: boolean;
  includeDependencies?: boolean;
}

/**
 * Error types for AI service
 */
export interface AIError {
  message: string;
  code?: string;
  type: 'authentication' | 'rate_limit' | 'bad_request' | 'network' | 'unknown';
  original?: unknown;
}