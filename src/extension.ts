import * as vscode from 'vscode';
import { ConfigService } from './services/configService';
import { AIService } from './services/aiService';
import { PlanService } from './services/planService';
import { PlanViewProvider } from './ui/PlanViewProvider';

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
  console.log('[CodeCompass] Extension activating...');

  // Initialize services
  configService = new ConfigService();
  const aiConfig = configService.aiConfig;

  console.log('[CodeCompass] AI Service config:', {
    hasApiKey: !!aiConfig.apiKey,
    apiKeyPrefix: aiConfig.apiKey ? aiConfig.apiKey.substring(0, 8) + '...' : 'none',
    model: aiConfig.model,
    endpoint: aiConfig.endpoint || 'none',
    maxTokens: aiConfig.maxTokens
  });

  aiService = new AIService(aiConfig);
  planService = new PlanService(aiService, configService);

  // Extension is now active
  console.log('[CodeCompass] Services initialized successfully');

  // Update context key based on API key status
  updateApiKeyContextKey();

  // Delay the initial config check slightly to allow VSCode to fully load settings
  const initialCheckTimer = setTimeout(() => {
    console.log('[CodeCompass] Performing delayed config check...');
    configService.reloadConfig();
    const reloadedConfig = configService.aiConfig;
    console.log('[CodeCompass] Reloaded config after delay:', {
      hasApiKey: !!reloadedConfig.apiKey,
      apiKeyPrefix: reloadedConfig.apiKey ? reloadedConfig.apiKey.substring(0, 8) + '...' : 'none',
    });
    updateApiKeyContextKey();
    configService.checkApiKey().catch(console.error);
  }, 500);

  context.subscriptions.push({ dispose: () => clearTimeout(initialCheckTimer) });

  // Register PlanViewProvider
  const planViewProvider = new PlanViewProvider(
    context.extensionUri,
    planService,
    configService,
    context
  );

  const planViewProviderDisposable = vscode.window.registerWebviewViewProvider(
    PlanViewProvider.viewType,
    planViewProvider,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  context.subscriptions.push(planViewProviderDisposable);

  // Register openPlanPanel command
  const openPlanPanelCommand = vscode.commands.registerCommand(
    'codecompass.openPlanPanel',
    async () => {
      await vscode.commands.executeCommand('workbench.view.extension.codecompass');
    }
  );

  context.subscriptions.push(openPlanPanelCommand);

  // Check if API key is configured
  configService.checkApiKey().catch(console.error);

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
    if (e.affectsConfiguration('codecompass')) {
      console.log('[CodeCompass] Configuration changed, reloading...');
      configService.reloadConfig();
      const newConfig = configService.aiConfig;

      console.log('[CodeCompass] New config:', {
        hasApiKey: !!newConfig.apiKey,
        apiKeyPrefix: newConfig.apiKey ? newConfig.apiKey.substring(0, 8) + '...' : 'none',
        model: newConfig.model,
        endpoint: newConfig.endpoint || 'none',
        maxTokens: newConfig.maxTokens
      });

      aiService.updateConfig(newConfig);
      updateApiKeyContextKey();
      console.log('[CodeCompass] Configuration reloaded successfully');
    }
  });

  context.subscriptions.push(configChangeListener);
}

/**
 * This method is called when your extension is deactivated
 */
/**
 * Update the context key based on API key status
 */
function updateApiKeyContextKey(): void {
  const hasApiKey = !!configService.apiKey;
  vscode.commands.executeCommand('setContext', 'codecompass.apiKeyConfigured', hasApiKey);
  console.log(`[CodeCompass] Context key set: codecompass.apiKeyConfigured = ${hasApiKey}`);
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  // Cleanup if needed
}