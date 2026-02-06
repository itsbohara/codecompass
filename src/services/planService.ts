/**
 * Plan Service
 * Gathers context from the workspace and generates plans using AI
 */

import * as vscode from 'vscode';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Context, PlanRequest, Plan, PlanStep } from '../types';
import { AIService } from './aiService';
import { ConfigService } from './configService';

export class PlanService {
  private aiService: AIService;
  private configService: ConfigService;

  constructor(aiService: AIService, configService: ConfigService) {
    this.aiService = aiService;
    this.configService = configService;
  }

  /**
   * Gather context from the workspace
   */
  async gatherContext(task: string, options?: {
    includeActiveFile?: boolean;
    includeWorkspaceStructure?: boolean;
    includeDependencies?: boolean;
  }): Promise<Context> {
    const context: Context = {
      workspaceRoot: vscode.workspace.rootPath,
    };

    try {
      // Gather active file info
      if (options?.includeActiveFile) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const document = activeEditor.document;
          context.activeFile = {
            path: document.uri.fsPath,
            content: document.getText(),
            language: document.languageId,
          };
        }
      }

      // Gather workspace structure
      if (options?.includeWorkspaceStructure) {
        context.workspaceStructure = await this.getWorkspaceStructure();
      }

      // Gather dependencies
      if (options?.includeDependencies) {
        const pkgJsonPath = context.workspaceRoot
          ? join(context.workspaceRoot, 'package.json')
          : null;

        if (pkgJsonPath) {
          try {
            const pkgContent = await readFile(pkgJsonPath, 'utf-8');
            const pkgJson = JSON.parse(pkgContent);

            context.dependencies = {
              dependencies: pkgJson.dependencies || {},
              devDependencies: pkgJson.devDependencies || {},
            };

            // Detect tech stack from dependencies
            context.techStack = this.detectTechStack(pkgJson);
          } catch {
            // Ignore errors reading package.json
          }
        }
      }
    } catch (error) {
      console.error('Error gathering context:', error);
    }

    return context;
  }

  /**
   * Generate a prompt from context and task
   */
  private buildPrompt(task: string, context: Context): string {
    let prompt = `Task: ${task}\n\n`;

    if (context.activeFile) {
      prompt += `Current active file: ${context.activeFile.path}\n`;
      prompt += `Language: ${context.activeFile.language}\n\n`;
      prompt += `--- File Content ---\n${context.activeFile.content}\n--- End File ---\n\n`;
    }

    if (context.techStack) {
      prompt += `Tech Stack: ${context.techStack}\n\n`;
    }

    if (context.dependencies?.dependencies) {
      const deps = Object.keys(context.dependencies.dependencies);
      prompt += `Dependencies: ${deps.slice(0, 10).join(', ')}${deps.length > 10 ? '...' : ''}\n\n`;
    }

    return prompt;
  }

  /**
   * Generate a plan for the given task
   */
  async generatePlan(
    task: string,
    options?: {
      includeActiveFile?: boolean;
      includeWorkspaceStructure?: boolean;
      includeDependencies?: boolean;
    }
  ): Promise<Plan> {
    console.log('[PlanService] generatePlan called with task:', task);
    try {
      console.log('[PlanService] Gathering context...');
      const context = await this.gatherContext(task, options);
      console.log('[PlanService] Context gathered:', {
        hasActiveFile: !!context.activeFile,
        hasWorkspaceRoot: !!context.workspaceRoot,
        techStack: context.techStack || 'none',
        hasDependencies: !!context.dependencies,
      });

      console.log('[PlanService] Building prompt...');
      const prompt = this.buildPrompt(task, context);
      console.log('[PlanService] Prompt length:', prompt.length);

      console.log('[PlanService] Calling AI service generatePlan...');
      const response = await this.aiService.generatePlan(prompt);
      console.log('[PlanService] AI response received:', typeof response, response);

      // Parse and validate response into Plan structure
      console.log('[PlanService] Parsing response...');
      const parsedPlan = this.parsePlanResponse(task, response);
      console.log('[PlanService] Plan parsed:', {
        id: parsedPlan.id,
        status: parsedPlan.status,
        stepCount: parsedPlan.steps.length,
      });

      return parsedPlan;
    } catch (error) {
      console.error('[PlanService] Error in generatePlan:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        id: this.generateId(),
        task,
        steps: [],
        createdAt: new Date(),
        status: 'failed',
      };
    }
  }

  /**
   * Parse AI response into Plan structure
   */
  private parsePlanResponse(task: string, response: unknown): Plan {
    const plan: Plan = {
      id: this.generateId(),
      task,
      steps: [],
      createdAt: new Date(),
      status: 'draft',
    };

    // Handle structured JSON response
    if (response && typeof response === 'object' && 'steps' in response) {
      const data = response as { steps: unknown[]; summary?: string; };
      const steps: PlanStep[] = [];

      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        if (step && typeof step === 'object') {
          steps.push({
            id: this.generateId(),
            description: 'description' in step ? String(step.description) : `Step ${i + 1}`,
            files: 'files' in step && Array.isArray(step.files) ? step.files as string[] : [],
            order: i,
          });
        }
      }

      plan.steps = steps;
      plan.status = steps.length > 0 ? 'active' : 'draft';
    }

    return plan;
  }

  /**
   * Get simplified workspace structure (top-level directories)
   */
  private async getWorkspaceStructure(): Promise<string[]> {
    const workspaceRoot = vscode.workspace.rootPath;
    if (!workspaceRoot) {
      return [];
    }

    try {
      const folders = await vscode.workspace.fs.readDirectory(vscode.Uri.file(workspaceRoot));
      return folders
        .filter(([name, type]) => type === vscode.FileType.Directory)
        .map(([name]) => name);
    } catch {
      return [];
    }
  }

  /**
   * Detect tech stack from package.json
   */
  private detectTechStack(pkgJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }): string {
    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
    };

    if (allDeps.react) {return 'React';}
    if (allDeps.vue) {return 'Vue.js';}
    if (allDeps.angular || allDeps['@angular/core']) {return 'Angular';}
    if (allDeps.svelte) {return 'Svelte';}
    if (allDeps.next) {return 'Next.js';}
    if (allDeps.node) {return 'Node.js';}
    if (allDeps.express) {return 'Express.js';}
    if (allDeps.nest) {return 'NestJS';}
    if (allDeps.typescript) {return 'TypeScript';}
    if (allDeps.storybook) {return 'Storybook';}

    return 'JavaScript/TypeScript';
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}