import * as vscode from "vscode";
import { ConfigService } from "./services/configService";
import { AIService } from "./services/aiService";
import { PlanService } from "./services/planService";
import { PlanViewProvider } from "./ui/PlanViewProvider";

/**
 * Global services instances
 */
let configService: ConfigService;
let aiService: AIService;
let planService: PlanService;

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 */
export function activate(context: vscode.ExtensionContext) {
  // Initialize services
  configService = new ConfigService();
  aiService = new AIService(configService.aiConfig);
  planService = new PlanService(aiService, configService);

  // Update context key based on API key status
  updateApiKeyContextKey();

  // Delay the initial config check slightly to allow VSCode to fully load settings
  const initialCheckTimer = setTimeout(() => {
    configService.reloadConfig();
    updateApiKeyContextKey();
    configService.checkApiKey().catch(console.error);
  }, 500);

  context.subscriptions.push({
    dispose: () => clearTimeout(initialCheckTimer),
  });

  // Register PlanViewProvider
  const planViewProvider = new PlanViewProvider(
    context.extensionUri,
    planService,
    configService,
    context,
  );

  const planViewProviderDisposable = vscode.window.registerWebviewViewProvider(
    PlanViewProvider.viewType,
    planViewProvider,
    { webviewOptions: { retainContextWhenHidden: true } },
  );

  context.subscriptions.push(planViewProviderDisposable);

  // Register openPlanPanel command
  const openPlanPanelCommand = vscode.commands.registerCommand(
    "codecompass.openPlanPanel",
    async () => {
      await vscode.commands.executeCommand(
        "workbench.view.extension.codecompass",
      );
    },
  );

  context.subscriptions.push(openPlanPanelCommand);

  // Check if API key is configured
  configService.checkApiKey().catch(console.error);

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration("codecompass")) {
        configService.reloadConfig();
        aiService.updateConfig(configService.aiConfig);
        updateApiKeyContextKey();
      }
    },
  );

  context.subscriptions.push(configChangeListener);
}

/**
 * This method is called when your extension is deactivated
 */
/**
 * Update the context key based on API key status
 */
function updateApiKeyContextKey(): void {
  vscode.commands.executeCommand(
    "setContext",
    "codecompass.apiKeyConfigured",
    !!configService.apiKey,
  );
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  // Cleanup if needed
}
