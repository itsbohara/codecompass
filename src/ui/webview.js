/**
 * CodeCompass Webview JavaScript
 * Client-side logic, DOM rendering, and message handling
 */

(function () {
  "use strict";

  console.log("[CodeCompass] webview.js loaded!");

  // Acquire VS Code API
  const vscode = acquireVsCodeApi();

  // === State ===
  const state = {
    currentPlan: null,
    isGenerating: false,
    recentPlans: [],
    hasConfig: false,
    activePanel: "current", // 'current' or 'plans'
  };

  // === DOM Elements ===
  const elements = {};

  // Initialize DOM element references
  function initElements() {
    elements.statusIndicator = document.getElementById("statusIndicator");
    elements.settingsButton = document.getElementById("settingsButton");
    elements.currentTab = document.getElementById("currentTab");
    elements.plansTab = document.getElementById("plansTab");
    elements.currentPanel = document.getElementById("currentPanel");
    elements.plansPanel = document.getElementById("plansPanel");

    // Empty states
    elements.emptyNoConfig = document.getElementById("emptyNoConfig");
    elements.emptyNoPlan = document.getElementById("emptyNoPlan");
    elements.emptyRecentPlans = document.getElementById("emptyRecentPlans");

    // Input section
    elements.inputSection = document.getElementById("inputSection");
    elements.taskInput = document.getElementById("taskInput");
    elements.generateButton = document.getElementById("generateButton");

    // Plan display
    elements.generatingState = document.getElementById("generatingState");
    elements.planDisplay = document.getElementById("planDisplay");
    elements.planTitle = document.getElementById("planTitle");
    elements.stepsList = document.getElementById("stepsList");
    elements.copyPlanButton = document.getElementById("copyPlanButton");
    elements.exportPlanButton = document.getElementById("exportPlanButton");
    elements.deletePlanButton = document.getElementById("deletePlanButton");

    // Plans list
    elements.searchInput = document.getElementById("searchInput");
    elements.plansList = document.getElementById("plansList");

    // Toast container
    elements.toastContainer = document.getElementById("toastContainer");

    // Settings modal button
    elements.openSettingsButton = document.getElementById("openSettingsButton");

    console.log("[CodeCompass] DOM elements initialized:", {
      openSettingsButton: !!elements.openSettingsButton,
      openSettingsButtonId: elements.openSettingsButton?.id,
      settingsButton: !!elements.settingsButton,
    });
  }

  // === Event Listeners ===

  // Settings button
  function initEventListeners() {
    elements.settingsButton.addEventListener("click", () => {
      console.log("[CodeCompass] Settings button clicked");
      sendMessage({ type: "openSettings" });
    });

    if (elements.openSettingsButton) {
      console.log(
        "[CodeCompass] Attaching click listener to openSettingsButton",
      );
      elements.openSettingsButton.addEventListener("click", (e) => {
        console.log("[CodeCompass] Open Settings button clicked!");
        e.preventDefault();
        e.stopPropagation();
        sendMessage({ type: "openSettings" });
      });
    } else {
      console.log("[CodeCompass] WARNING: openSettingsButton not found!");
    }

    // Tab switching
    elements.currentTab.addEventListener("click", () => switchPanel("current"));
    elements.plansTab.addEventListener("click", () => switchPanel("plans"));

    // Generate button
    elements.generateButton.addEventListener("click", handleGenerate);

    // Task input Ctrl+Enter shortcut
    elements.taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleGenerate();
      }
    });

    // Plan actions
    elements.copyPlanButton.addEventListener("click", () => {
      sendMessage({ type: "copyPlan" });
    });

    elements.exportPlanButton.addEventListener("click", () => {
      sendMessage({ type: "exportPlan" });
    });

    elements.deletePlanButton.addEventListener("click", () => {
      sendMessage({ type: "deletePlan" });
    });

    // Search input
    elements.searchInput.addEventListener("input", (e) => {
      filterPlans(e.target.value);
    });
  }

  // === Message Handling ===

  // Send message to extension
  function sendMessage(message) {
    vscode.postMessage(message);
  }

  // Listen for messages from extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    handleExtensionMessage(message);
  });

  // Handle messages from extension
  function handleExtensionMessage(message) {
    switch (message.type) {
      case "generation-start":
        handleGenerationStart();
        break;
      case "generation-complete":
        handleGenerationComplete(message.plan);
        break;
      case "generation-error":
        handleGenerationError(message.error);
        break;
      case "plan-selected":
        handlePlanSelected(message.plan);
        break;
      case "plan-deleted":
        handlePlanDeleted();
        break;
      case "copied":
        showToast("Plan copied to clipboard", "success");
        break;
      case "exported":
        showToast("Plan exported successfully", "success");
        break;
      case "config-status":
        handleConfigStatus(message.hasConfig);
        break;
      case "recent-plans":
        handleRecentPlans(message.plans);
        break;
    }
  }

  // === State Handlers ===

  function handleGenerationStart() {
    state.isGenerating = true;
    state.currentPlan = null;
    updateUIState();
  }

  function handleGenerationComplete(plan) {
    state.isGenerating = false;
    state.currentPlan = plan;

    // Save to recent plans if not already there
    const existingIndex = state.recentPlans.findIndex((p) => p.id === plan.id);
    if (existingIndex >= 0) {
      state.recentPlans.splice(existingIndex, 1);
    }
    state.recentPlans.unshift(plan);

    updateUIState();
    showToast("Plan generated successfully", "success");
  }

  function handleGenerationError(error) {
    state.isGenerating = false;
    state.currentPlan = null;
    updateUIState();
    showToast(error, "error");
  }

  function handlePlanSelected(plan) {
    state.currentPlan = plan;
    state.activePanel = "current";
    updateUIState();
  }

  function handlePlanDeleted() {
    state.currentPlan = null;

    // Remove from recent plans
    if (state.recentPlans.length > 0) {
      state.recentPlans.shift();
    }

    updateUIState();
    showToast("Plan deleted", "info");
  }

  function handleConfigStatus(hasConfig) {
    state.hasConfig = hasConfig;
    updateUIState();
  }

  function handleRecentPlans(plans) {
    state.recentPlans = plans;
    renderPlansList();
  }

  // === UI Updates ===

  function updateUIState() {
    if (!state.hasConfig) {
      elements.emptyNoConfig.classList.remove("hidden");
      elements.emptyNoPlan.classList.add("hidden");
      elements.inputSection.classList.add("hidden");
      elements.generatingState.classList.add("hidden");
      elements.planDisplay.classList.add("hidden");
      elements.statusIndicator?.classList.remove("configured");
      elements.generateButton.disabled = true;
    } else if (state.isGenerating) {
      elements.emptyNoConfig.classList.add("hidden");
      elements.emptyNoPlan.classList.add("hidden");
      elements.inputSection.classList.add("hidden");
      elements.generatingState.classList.remove("hidden");
      elements.planDisplay.classList.add("hidden");
      elements.statusIndicator?.classList.remove("configured");
      elements.statusIndicator?.classList.add("generating");
      elements.generateButton.disabled = true;
    } else if (!state.currentPlan) {
      elements.emptyNoConfig.classList.add("hidden");
      elements.emptyNoPlan.classList.remove("hidden");
      elements.inputSection.classList.remove("hidden");
      elements.generatingState.classList.add("hidden");
      elements.planDisplay.classList.add("hidden");
      elements.statusIndicator?.classList.add("configured");
      elements.statusIndicator?.classList.remove("generating");
      elements.generateButton.disabled = false;
    } else {
      elements.emptyNoConfig.classList.add("hidden");
      elements.emptyNoPlan.classList.add("hidden");
      elements.inputSection.classList.add("hidden");
      elements.generatingState.classList.add("hidden");
      elements.planDisplay.classList.remove("hidden");
      elements.statusIndicator?.classList.add("configured");
      elements.statusIndicator?.classList.remove("generating");
      elements.generateButton.disabled = false;
      renderPlanDisplay();
    }

    renderPlansList();
  }

  function renderPlanDisplay() {
    if (!state.currentPlan) {
      return;
    }

    elements.planTitle.textContent = state.currentPlan.task;
    elements.stepsList.innerHTML = "";

    state.currentPlan.steps.forEach((step) => {
      const stepElement = createStepElement(step);
      elements.stepsList.appendChild(stepElement);
    });
  }

  function createStepElement(step) {
    const stepItem = document.createElement("div");
    stepItem.className = "step-item";

    const stepHeader = document.createElement("div");
    stepHeader.className = "step-header";

    const stepNumber = document.createElement("span");
    stepNumber.className = "step-number";
    stepNumber.textContent = step.order + 1;

    const stepText = document.createElement("div");
    stepText.className = "step-text";
    stepText.textContent = step.description;

    stepHeader.appendChild(stepNumber);
    stepHeader.appendChild(stepText);

    stepItem.appendChild(stepHeader);

    if (step.files && step.files.length > 0) {
      const stepFiles = document.createElement("div");
      stepFiles.className = "step-files";

      step.files.forEach((file) => {
        const fileLink = document.createElement("a");
        fileLink.className = "file-link";
        fileLink.textContent = file;
        fileLink.title = file;
        fileLink.addEventListener("click", () => {
          sendMessage({ type: "navigateToFile", filePath: file });
        });
        stepFiles.appendChild(fileLink);
      });

      stepItem.appendChild(stepFiles);
    }

    return stepItem;
  }

  function renderPlansList() {
    const container = elements.plansList;
    const hasPlans = state.recentPlans.length > 0;

    if (!hasPlans) {
      container.innerHTML = `
        <div class="empty-state empty-sm">
          <p>No plans yet. Generate your first plan above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    state.recentPlans.forEach((plan) => {
      const planSummary = createPlanSummary(plan);
      container.appendChild(planSummary);
    });
  }

  function createPlanSummary(plan) {
    const planSummary = document.createElement("div");
    planSummary.className = "plan-summary";
    if (state.currentPlan && plan.id === state.currentPlan.id) {
      planSummary.classList.add("selected");
    }

    const title = document.createElement("div");
    title.className = "plan-summary-title";
    title.textContent = plan.task;

    const meta = document.createElement("div");
    meta.className = "plan-summary-meta";

    const date = document.createElement("span");
    date.className = "plan-summary-date";
    date.textContent = formatDate(plan.createdAt);

    const steps = document.createElement("span");
    steps.className = "plan-summary-steps";

    const stepBadge = document.createElement("span");
    stepBadge.className = "step-badge";
    stepBadge.textContent = `${plan.steps.length} step${plan.steps.length === 1 ? "" : "s"}`;

    steps.appendChild(stepBadge);

    meta.appendChild(date);
    meta.appendChild(steps);

    planSummary.appendChild(title);
    planSummary.appendChild(meta);

    planSummary.addEventListener("click", () => {
      sendMessage({ type: "selectPlan", planId: plan.id });
    });

    return planSummary;
  }

  function filterPlans(searchTerm) {
    const container = elements.plansList;
    const summaries = container.querySelectorAll(".plan-summary");
    const term = searchTerm.toLowerCase();

    summaries.forEach((summary) => {
      const title =
        summary.querySelector(".plan-summary-title")?.textContent || "";
      const matches = title.toLowerCase().includes(term);
      summary.style.display = matches || !term ? "" : "none";
    });
  }

  // === Actions ===

  function handleGenerate() {
    const task = elements.taskInput.value.trim();
    if (!task) {
      showToast("Please enter a task description", "error");
      elements.taskInput.focus();
      return;
    }

    sendMessage({ type: "generatePlan", task });
    elements.generateButton.disabled = true;
  }

  function switchPanel(panel) {
    state.activePanel = panel;

    if (panel === "current") {
      elements.currentTab.classList.add("active");
      elements.currentTab.setAttribute("aria-selected", "true");
      elements.plansTab.classList.remove("active");
      elements.plansTab.setAttribute("aria-selected", "false");
      elements.currentPanel.classList.remove("hidden");
      elements.currentPanel.setAttribute("aria-hidden", "false");
      elements.plansPanel.classList.add("hidden");
      elements.plansPanel.setAttribute("aria-hidden", "true");
    } else {
      elements.plansTab.classList.add("active");
      elements.plansTab.setAttribute("aria-selected", "true");
      elements.currentTab.classList.remove("active");
      elements.currentTab.setAttribute("aria-selected", "false");
      elements.plansPanel.classList.remove("hidden");
      elements.plansPanel.setAttribute("aria-hidden", "false");
      elements.currentPanel.classList.add("hidden");
      elements.currentPanel.setAttribute("aria-hidden", "true");
    }
  }

  // === Toast Notifications ===

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = document.createElement("span");
    icon.className = "toast-icon";

    switch (type) {
      case "success":
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${getComputedStyle(document.documentElement).getPropertyValue("--cc-status-success") || "#10b981"}" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>`;
        break;
      case "error":
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${getComputedStyle(document.documentElement).getPropertyValue("--cc-status-error") || "#ef4444"}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        break;
      case "info":
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${getComputedStyle(document.documentElement).getPropertyValue("--cc-status-info") || "#3b82f6"}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        break;
    }

    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    elements.toastContainer.appendChild(toast);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      toast.style.animation = "fadeOut 0.2s ease forwards";
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // === Helpers ===

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  // === Initialization ===

  function init() {
    console.log("[CodeCompass] init() running...");
    initElements();
    console.log(
      "[CodeCompass] initElements done, openSettingsButton:",
      !!elements.openSettingsButton,
    );
    initEventListeners();
    console.log("[CodeCompass] initEventListeners done");

    // Check initial state
    sendMessage({ type: "checkConfig" });
    sendMessage({ type: "getRecentPlans" });
    console.log("[CodeCompass] init() complete");
  }

  // Run initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
