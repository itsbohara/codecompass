# CodeCompass Phase 1: MVP Implementation Plan

## Overview

This plan outlines the implementation of the **Minimum Viable Product (MVP)** for CodeCompass. Instead of rigid day-by-day tasks, it's organized around **7 key goals** that build on each other.

**Starting point**: Zero code (only documentation exists)
**End point**: Working MVP that generates plans using Claude API

---

## Goals Structure

Each goal defines:
- **What** needs to be built
- **Why** it matters
- **Key components** to create
- **How to verify** it works

Work through goals sequentially, but spend as much time as needed on each.

---

## ~~Goal 1: Project Setup & Foundation~~ ✅ COMPLETE

**Status**: Done on 2026-02-05

**What was completed**:
- ✅ VSCode extension scaffold generated with `yo code`
- ✅ Configured with pnpm package manager
- ✅ Bundler set to esbuild
- ✅ TypeScript configured (strict mode)
- ✅ Project conventions documented in `PROJECT_CONVENTIONS.md`
- ✅ Root directory cleaned up

**Work directory**: `./`

---

## ~~Goal 2: Core Services Architecture~~ ✅ COMPLETE

**Status**: Done - All services implemented

**What was completed**:
- ✅ TypeScript types defined in `src/types/index.ts` (Plan, PlanStep, Context, AIServiceConfig, PlanRequest, AIError)
- ✅ AI Service implemented (`src/services/aiService.ts`)
  - OpenAI client integration (supports Anthropic, litellm proxies)
  - `generatePlan(prompt)` method implemented
  - Comprehensive error handling (401, 429, 400, network, timeout, JSON parse errors)
  - System prompt for planning assistant role
  - Retry logic on 429 status
- ✅ Config Service implemented (`src/services/configService.ts`)
  - Reads from VSCode configuration
  - Environment variable fallback (ANTHROPIC_API_KEY, OPENAI_API_KEY)
  - Getters for apiKey, endpoint, model, maxTokens
  - Settings validation
  - `openSettings()` helper
- ✅ Plan Service implemented (`src/services/planService.ts`)
  - `gatherContext(task)`: active file, project structure, tech stack, dependencies
  - Tech stack detection (React, Vue, Angular, Next.js, etc.)
  - `generatePlan(task, context)`: prompt building via AI service
  - Prompt engineering
  - Response parsing and validation
- ✅ Extension.ts updated with service initialization and command registration

**Files created**: `src/types/index.ts`, `src/services/aiService.ts`, `src/services/configService.ts`, `src/services/planService.ts`

---

## ~~Goal 3: Interactive Webview Panel~~ ✅ COMPLETE

**Status**: Done - Full two-panel webview UI implemented

**What was completed**:
- ✅ Panel architecture implemented (view provider pattern, not singleton)
  - Message-based communication (webview ↔ extension)
  - State management (currentPlan, isGenerating, recentPlans, hasConfig)
- ✅ PlanViewProvider class (`src/ui/PlanViewProvider.ts`)
  - `resolveWebviewView()` method for VSCode integration
  - Two-panel interface (Current + Plans)
  - Message handler registration
  - Cleanup and disposal
- ✅ Webview UI implemented
  - Input form: textarea for task description
  - Action buttons: Generate, Copy to Clipboard, Export to Markdown
  - Loading indicator with pulse animation
  - Error display area
  - Plan output area with industrial/engineering aesthetic
  - VSCode theme integration (CSS variables)
  - Input validation (min 10 chars)
  - Filter/recent dropdown for plan history
- ✅ Command handlers wired
  - `codecompass.openPlanPanel` command
  - `generate`: calls planService, displays plan
  - `selectPlan`: loads plan from history
  - `goToFile`: navigates to file step
  - `copy`: copies plan to clipboard
  - `export`: saves plan as .md file
  - `delete`: removes plan from history
- ✅ State handling
  - Loading states during generation
  - Error messages with actionable feedback
  - Toast notifications for copy/export success

**Files created**: `src/ui/PlanViewProvider.ts`, `src/ui/styles.css`, `src/ui/webview.js`, `ui/codecompass-icon.svg`

---

## ~~Goal 4: Error Handling & User Onboarding~~ ✅ COMPLETE

**Status**: Done - Comprehensive error handling and user feedback implemented

**What was completed**:
- ✅ Error handling in all services
  - AI Service: 401 (invalid key), 429 (rate limit), 400 (bad request), network, timeout, JSON parse errors
  - Plan Service: try-catch for file operations, API errors
  - User-friendly error messages (not raw stack traces)
- ✅ Plan panel error handling
  - Clear error when API key missing with config guidance
  - Empty workspace handling
- ✅ Input validation
  - Minimum 10 character check
  - Whitespace trimming
  - Validation messages in UI
- ✅ User feedback
  - Loading states with pulse animation
  - Toast notifications (copy success, export success)
  - Error messages in toast UI
  - Plan display with timestamp

**Note**: First-time welcome message (settingsHelper.ts) not yet implemented - deferred to Phase 2

### Verification

- [x] Missing API key shows helpful error
- [x] Empty/short task shows validation message
- [x] Toast notifications for success/error
- [x] Loading states during generation
- [x] Plan output includes timestamp
- [ ] Welcome message on first launch (deferred to Phase 2)

---

## Goal 5: End-to-End Testing & Stabilization

**Status**: In Progress - Test infrastructure exists, comprehensive testing needed

**What exists**:
- ✅ Test infrastructure setup (`.vscode-test.mjs`, `src/test/extension.test.ts`)
- ✅ Build configuration (esbuild, watch mode)
- ✅ Package.json test scripts (`test`, `watch`, `compile`, `package`)
- ✅ Retry logic for API failures (429 status)

**Remaining tasks**:

1. **Run comprehensive manual testing**
   - Basic flow: generate, copy, export plans
   - Error handling: missing API key, no workspace, invalid input
   - Different project types: Node.js, React, Python
   - Edge cases: large descriptions, small/large workspaces

2. **Document issues**
   - Create `TEST_ISSUES.md` for bugs found
   - Prioritize: Critical, High, Medium, Low

3. **Fix critical bugs** (as discovered)

4. **Code cleanup**
   - Remove console.log statements
   - Ensure consistent error handling
   - Check memory leaks

### Verification

- [ ] All manual test scenarios succeed
- [ ] No critical bugs remaining
- [ ] Extension stable during extended use
- [ ] Console clean during normal operation
- [ ] All event listeners properly disposed

---

## Goal 6: Documentation

**Status**: Partial - Project conventions and planning docs exist, README needs completion

**What exists**:
- ✅ `PROJECT_CONVENTIONS.md` - Project standards and conventions
- ✅ `codecompass-roadmap.md` - Overall project roadmap
- ✅ `plan/PHASE1_MVP.md` - This MVP implementation plan
- ✅ `plan/WEEK1-2_FOUNDATION.md` - Week-by-week foundation plan
- ✅ `.gitignore` - Standard exclusions configured
- ✅ Root-level `README.md` - Template exists (needs actual content)

**Remaining tasks**:

1. **Write proper codecompass/README.md**
   - Project description and tagline
   - Feature list (current MVP scope)
   - Installation instructions
   - Configuration guide (settings, settings.json, env var)
   - Usage guide with examples
   - Architecture overview
   - Development guide (build, watch, test, debug)
   - Known limitations
   - Links to roadmap planning docs

2. **Create PHASE1_SUMMARY.md**
   - What was built (with metrics)
   - Testing results
   - Known issues and technical debt
   - Lessons learned
   - Preview of Phase 2

3. **Create plan/PHASE2_PLAN.md**
   - Outline for next phase features

4. **Inline documentation**
   - Add JSDoc to public methods
   - Document complex algorithms

### Verification

- [ ] codecompass/README.md comprehensive and tested
- [ ] PHASE1_SUMMARY.md with metrics
- [ ] plan/PHASE2_PLAN.md created
- [ ] No sensitive data in git

---

## Goal 7: Version Control & Release Prep

**Status**: Pending - Work to commit in codecompass subdirectory

**Current state**:
- Root repo has planning docs and conventions committed
- `codecompass/` subdirectory has its own git with changes to commit
- Most MVP code exists but not committed

**Tasks**:

1. **Review git status in codecompass/**
   - `git status` - check all files
   - `git diff` - review changes
   - Ensure no secrets in committed files

2. **Commit all changes**
   - Stage all files
   - Create conventional commit message(s)

3. **Verify repository state**
   - `git log` - clean commit history
   - `git status` - working directory clean

4. **Prepare for Phase 2**
   - Review PHASE2_PLAN.md (from Goal 6)
   - Note technical debt items to address

### Verification

- [ ] `git status` shows clean working directory
- [ ] All MVP code committed
- [ ] Clean commit history
- [ ] No sensitive data in repository

---

## MVP Success Criteria

At the end of Phase 1, the extension should:

### Functional
- [x] Load in VSCode without errors
- [x] Open interactive planning panel from command palette
- [x] Generate an implementation plan from a task description (using AI via OpenAI SDK)
- [x] Display plan with readable formatting
- [x] Copy plan to clipboard
- [x] Export plan to markdown file
- [x] Plan history persistence

### User Experience
- [ ] First-time user sees welcome message (deferred to Phase 2)
- [x] Missing API key shows clear instructions
- [x] Errors are actionable (toast notifications)
- [x] Input validation prevents invalid submissions
- [x] Loading states during generation
- [x] Industrial/engineering aesthetic UI

### Technical
- [x] TypeScript compiles cleanly (strict mode)
- [ ] No console errors during normal use (needs testing)
- [x] Proper error handling at all layers
- [x] Resources cleaned up on panel close
- [x] All files properly structured
- [x] Retry logic for rate limits (429)

### Documentation
- [ ] README complete and tested (needs proper content)
- [x] Architecture documented
- [x] Development guide available
- [ ] Phase 2 plan outlined (needs creation)

---

## Architecture Overview (Phase 1)

```
CodeCompass MVP Architecture (As Implemented)

┌─────────────────┐
│   VSCode        │
│   Extension     │
│   Host          │
└────────┬────────┘
         │
         ├── Commands
         │   └── codecompass.openPlanPanel
         │
         ├── Services Layer
         │   ├── ConfigService (settings.json + env vars)
         │   ├── AIService (OpenAI SDK, supports Anthropic/litellm)
         │   │   └── API: generatePlan(), error handling, retry(429)
         │   └── PlanService (context gathering + prompts)
         │       ├── gatherContext() - active file, structure, tech stack
         │       ├── detectTechStack() - React, Vue, Angular, Next.js...
         │       └── generatePlan() - prompt + AI service
         │
         └── UI Layer
             └── PlanViewProvider (webview sidebar view)
                 ├── Two-panel layout (Current + Plans history)
                 ├── webview.js - client-side state, DOM, messages
                 ├── styles.css - industrial/engineering aesthetic
                 └── Actions: generate, copy, export, select, delete, goToFile

Data Flow:
1. User opens panel via command palette
2. User enters task in webview textarea
3. Webview → extension: 'generate' message
4. PlanService.gatherContext() collects workspace info
5. PlanService.generatePlan() builds prompt, calls AIService
6. AIService.generatePlan() calls AI via OpenAI SDK
7. Plan returned through layers to webview
8. Plan displayed with timestamp in webview
9. Plan stored in VSCode globalState
10. User can: copy to clipboard, export to .md, select from history

Storage:
- Plans: VSCode globalState (persistent across sessions)
- Settings: VSCode workspace settings (settings.json)
- API Key: settings.json OR ANTHROPIC_API_KEY/OPENAI_API_KEY env var
```

---

## What's NOT in Phase 1 (Out of Scope)

These are planned for Phase 2+:

- Advanced code analysis (AST parsing, dependency graphs)
- Workspace-wide file scanning beyond top-level
- Relevance ranking and token budgeting
- Web research integration
- Streaming plan generation
- Multiple export formats (Claude Code, Cursor, etc.)
- Template system
- Team collaboration features
- First-time welcome message
- Unit tests (manual testing only for MVP)
- Settings UI (uses default VSCode settings)

**Note: Plan history and persistence ARE implemented in Phase 1** (stored in VSCode globalState)

---

## Getting Started

Begin with **Goal 1: Project Setup & Foundation** and work through each goal sequentially. Each goal builds on the previous one, so don't skip ahead.

The MVP is achievable in 1-2 weeks of focused development. Stay focused on the success criteria—resist adding extra features. Get a working, polished MVP first, then iterate.

---

**Ready? Start with Goal 1.**
