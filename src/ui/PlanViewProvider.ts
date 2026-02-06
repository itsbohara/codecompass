/**
 * PlanViewProvider
 * Provides a webview view in the VS Code sidebar for displaying AI-generated implementation plans
 */

import * as vscode from "vscode";
import { WebviewViewProvider } from "vscode";
import { PlanService } from "../services/planService";
import { ConfigService } from "../services/configService";
import { Plan } from "../types";

/**
 * Message types sent from extension to webview
 */
type ExtensionMessage =
  | { type: "generation-start" }
  | { type: "generation-complete"; plan: Plan }
  | { type: "generation-error"; error: string }
  | { type: "plan-selected"; plan: Plan }
  | { type: "plan-deleted" }
  | { type: "copied" }
  | { type: "exported" }
  | { type: "config-status"; hasConfig: boolean }
  | { type: "recent-plans"; plans: Plan[] }
  | {
      type: "config-info";
      model: string;
      endpoint: string;
      hasConfig: boolean;
    };

/**
 * Message types sent from webview to extension
 */
type WebviewMessage =
  | { type: "generatePlan"; task: string }
  | { type: "selectPlan"; planId: string }
  | { type: "navigateToFile"; filePath: string }
  | { type: "deletePlan" }
  | { type: "copyStep"; stepId: string }
  | { type: "copyPlan" }
  | { type: "exportPlan" }
  | { type: "getRecentPlans" }
  | { type: "checkConfig" }
  | { type: "openSettings" };

/**
 * Plans stored in global state
 */
interface StoredPlan {
  id: string;
  task: string;
  steps: Array<{
    id: string;
    description: string;
    files?: string[];
    order: number;
    completed?: boolean;
  }>;
  createdAt: number;
  status: "draft" | "active" | "completed" | "failed";
}

const PLAN_STORAGE_KEY = "codecompass.recentPlans";

export class PlanViewProvider implements WebviewViewProvider {
  public static readonly viewType = "codecompass.planView";
  private _view?: vscode.WebviewView;
  private _currentPlan: Plan | null = null;
  private _recentPlans: Plan[] = [];
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _planService: PlanService,
    private readonly _configService: ConfigService,
    private readonly _context: vscode.ExtensionContext,
  ) {
    // Load recent plans from storage
    this.loadRecentPlans();
  }

  /**
   * Resolve the webview view when it's shown
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.handleWebviewMessage(message);
    });

    // Set up event listener for when the view becomes visible
    const onDidChangeVisibilityDisposable = webviewView.onDidChangeVisibility(
      () => {
        if (this._view?.visible) {
          this._configService.reloadConfig();
          this.sendConfigStatus();
          this.sendRecentPlans();
        }
      },
    );
    this._disposables.push(onDidChangeVisibilityDisposable);

    // Set up event listener for when configuration changes
    const onDidChangeConfigurationDisposable =
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("codecompass")) {
          this._configService.reloadConfig();
          this.sendConfigInfo();
          this.sendConfigStatus();
        }
      });
    this._disposables.push(onDidChangeConfigurationDisposable);
  }

  /**
   * Handle messages from the webview
   */
  private async handleWebviewMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case "generatePlan": {
        await this.handleGeneratePlan(message.task);
        break;
      }
      case "selectPlan": {
        await this.handleSelectPlan(message.planId);
        break;
      }
      case "navigateToFile": {
        await this.handleNavigateToFile(message.filePath);
        break;
      }
      case "deletePlan": {
        await this.handleDeletePlan();
        break;
      }
      case "copyPlan": {
        await this.handleCopyPlan();
        break;
      }
      case "exportPlan": {
        await this.handleExportPlan();
        break;
      }
      case "getRecentPlans": {
        this.sendRecentPlans();
        break;
      }
      case "checkConfig": {
        this.sendConfigStatus();
        break;
      }
      case "openSettings": {
        await this.handleOpenSettings();
        break;
      }
    }
  }

  /**
   * Handle open settings request
   */
  private async handleOpenSettings(): Promise<void> {
    await vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "codecompass",
    );
  }

  /**
   * Handle plan generation request
   */
  private async handleGeneratePlan(task: string): Promise<void> {
    if (!this._configService.apiKey) {
      this.postMessage({
        type: "generation-error",
        error: "API key not configured. Please set your API key in settings.",
      });
      return;
    }

    this.postMessage({ type: "generation-start" });

    try {
      const plan = await this._planService.generatePlan(task, {
        includeActiveFile: true,
        includeWorkspaceStructure: true,
        includeDependencies: true,
      });

      if (plan.status === "failed") {
        this.postMessage({
          type: "generation-error",
          error:
            "Failed to generate plan. Please check your API configuration and try again.",
        });
        return;
      }

      this._currentPlan = plan;
      await this.saveRecentPlans();
      this.postMessage({ type: "generation-complete", plan });
    } catch (error) {
      console.error("[PlanViewProvider] Error in handleGeneratePlan:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.postMessage({ type: "generation-error", error: errorMessage });
    }
  }

  /**
   * Handle selecting a plan from the list
   */
  private async handleSelectPlan(planId: string): Promise<void> {
    const plan = this._recentPlans.find((p) => p.id === planId);
    if (plan) {
      this._currentPlan = plan;
      this.postMessage({ type: "plan-selected", plan });
    }
  }

  /**
   * Handle file navigation request
   */
  private async handleNavigateToFile(filePath: string): Promise<void> {
    if (!vscode.workspace.rootPath) {
      vscode.window.showWarningMessage(
        "No workspace folder is open. Cannot navigate to file.",
      );
      return;
    }

    const fullPath = vscode.Uri.joinPath(
      vscode.Uri.file(vscode.workspace.rootPath),
      filePath,
    );

    try {
      await vscode.commands.executeCommand("vscode.open", fullPath);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
    }
  }

  /**
   * Handle delete plan request
   */
  private async handleDeletePlan(): Promise<void> {
    this._currentPlan = null;
    await this.saveRecentPlans();
    this.postMessage({ type: "plan-deleted" });
  }

  /**
   * Handle copy plan request
   */
  private async handleCopyPlan(): Promise<void> {
    if (!this._currentPlan) {
      return;
    }

    const markdown = this.formatPlanAsMarkdown(this._currentPlan);
    await vscode.env.clipboard.writeText(markdown);
    this.postMessage({ type: "copied" });
  }

  /**
   * Handle export plan request
   */
  private async handleExportPlan(): Promise<void> {
    if (!this._currentPlan) {
      return;
    }

    const markdown = this.formatPlanAsMarkdown(this._currentPlan);

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(
        `${this._currentPlan.task.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`,
      ),
      filters: {
        Markdown: ["md"],
      },
    });

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(markdown));
      this.postMessage({ type: "exported" });
    }
  }

  /**
   * Format a plan as markdown
   */
  private formatPlanAsMarkdown(plan: Plan): string {
    const lines: string[] = [];
    lines.push(`# ${plan.task}`);
    lines.push("");
    lines.push(`*Plan generated on ${plan.createdAt.toLocaleString()}*`);
    lines.push("");
    lines.push("## Steps");
    lines.push("");

    for (const step of plan.steps) {
      lines.push(`${step.order + 1}. ${step.description}`);
      if (step.files && step.files.length > 0) {
        lines.push(`   Files: ${step.files.join(", ")}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Post a message to the webview
   */
  private postMessage(message: ExtensionMessage): void {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  /**
   * Send config status to webview
   */
  private sendConfigStatus(): void {
    const hasConfig = !!this._configService.apiKey;
    this.postMessage({ type: "config-status", hasConfig });
    // Also send detailed config info for footer
    this.sendConfigInfo();
  }

  /**
   * Send detailed config info to webview for footer display
   */
  private sendConfigInfo(): void {
    this.postMessage({
      type: "config-info",
      model: this._configService.model,
      endpoint: this._configService.endpoint || "default",
      hasConfig: !!this._configService.apiKey,
    });
  }

  /**
   * Send recent plans to webview
   */
  private sendRecentPlans(): void {
    this.postMessage({ type: "recent-plans", plans: this._recentPlans });
  }

  /**
   * Load recent plans from global storage
   */
  private loadRecentPlans(): void {
    try {
      const stored = this._context.globalState.get<StoredPlan[]>(
        PLAN_STORAGE_KEY,
        [],
      );
      this._recentPlans = stored.map((sp) => ({
        ...sp,
        createdAt: new Date(sp.createdAt),
      }));
    } catch (error) {
      console.error("Failed to load recent plans:", error);
      this._recentPlans = [];
    }
  }

  /**
   * Save recent plans to global storage
   */
  private async saveRecentPlans(): Promise<void> {
    try {
      const plans: StoredPlan[] = this._recentPlans.map((p) => ({
        id: p.id,
        task: p.task,
        steps: p.steps,
        createdAt: p.createdAt.getTime(),
        status: p.status,
      }));

      await this._context.globalState.update(PLAN_STORAGE_KEY, plans);
    } catch (error) {
      console.error("Failed to save recent plans:", error);
    }
  }

  /**
   * Get the HTML content for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for local resources
    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "ui", "styles.css"),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "ui", "webview.js"),
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    style-src ${webview.cspSource};
    script-src ${webview.cspSource};
    img-src ${webview.cspSource} https:;
  ">
  <title>CodeCompass</title>
  <link rel="stylesheet" href="${stylesUri}">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <svg class="logo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
          <path d="M2 12h20"/>
        </svg>
        <h1 class="title">CodeCompass</h1>
      </div>
      <div class="header-right">
        <div class="status-indicator" id="statusIndicator" aria-label="Status"></div>
        <button class="icon-button" id="settingsButton" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Panel Switcher -->
    <nav class="panel-switcher" role="tablist">
      <button class="tab-button active" id="currentTab" role="tab" aria-selected="true" aria-controls="currentPanel">Current</button>
      <button class="tab-button" id="plansTab" role="tab" aria-selected="false" aria-controls="plansPanel">Plans</button>
    </nav>

    <!-- Current Plan Panel -->
    <section id="currentPanel" class="panel" role="tabpanel">
      <!-- Empty State: No Config -->
      <div id="emptyNoConfig" class="empty-state">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z"/>
        </svg>
        <h2>API Key Required</h2>
        <p>Configure your API key in settings to start generating plans.</p>
        <button class="button primary" id="openSettingsButton">Open Settings</button>
      </div>

      <!-- Empty State: No Plan -->
      <div id="emptyNoPlan" class="empty-state hidden">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h2>No Current Plan</h2>
        <p>Describe a task to generate an implementation plan.</p>
      </div>

      <!-- Task Input -->
      <div id="inputSection" class="input-section hidden">
        <textarea id="taskInput" class="task-input" placeholder="Describe what you want to build or fix..."></textarea>
        <button class="button primary full-width" id="generateButton">Generate Plan</button>
      </div>

      <!-- Generating State -->
      <div id="generatingState" class="generating-state hidden">
        <div class="spinner"></div>
        <p>Generating plan...</p>
      </div>

      <!-- Plan Display -->
      <div id="planDisplay" class="plan-display hidden">
        <div class="plan-header">
          <h3 id="planTitle"></h3>
          <div class="plan-actions">
            <button class="icon-button" id="copyPlanButton" title="Copy plan to clipboard" aria-label="Copy plan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
            <button class="icon-button" id="exportPlanButton" title="Export as markdown" aria-label="Export plan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            </button>
            <button class="icon-button danger" id="deletePlanButton" title="Delete plan" aria-label="Delete plan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div id="stepsList" class="steps-list"></div>
      </div>
    </section>

    <!-- Plans List Panel -->
    <section id="plansPanel" class="panel hidden" role="tabpanel">
      <div class="panel-header">
        <input type="text" id="searchInput" class="search-input" placeholder="Search plans...">
      </div>
      <div id="plansList" class="plans-list">
        <div class="empty-state empty-sm" id="emptyRecentPlans">
          <p>No plans yet. Generate your first plan above.</p>
        </div>
      </div>
    </section>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Footer with Config Info -->
    <footer class="config-footer" id="configFooter" title="Click to open settings">
      <div class="config-item">
        <span class="config-label">Model:</span>
        <span class="config-value" id="configModel">-</span>
      </div>
      <div class="config-item">
        <span class="config-label">API:</span>
        <span class="config-value" id="configEndpoint">-</span>
      </div>
    </footer>
  </div>

  <script>
    console.log("[CodeCompass] INLINE script running!");
    window.addEventListener('error', function(e) {
      console.error("[CodeCompass] Script error:", e.message);
    });
  </script>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    for (const disposable of this._disposables) {
      disposable.dispose();
    }
    this._disposables = [];
  }
}
