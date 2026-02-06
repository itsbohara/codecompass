# CodeCompass Implementation Plan: Weeks 1-2

## Overview

This document provides a **strategic implementation plan** for building the CodeCompass VSCode extension MVP. It outlines the key tasks, components, and verification steps without low-level implementation details.

**Phase**: Foundation & Setup (Weeks 1-2)
**Status**: Ready to execute
**Starting point**: Zero code (only documentation exists)
**Approach**: Day-by-day incremental development

---

## Quick Navigation

- [Day 1: Environment Setup](#day-1)
- [Day 2: Configuration](#day-2)
- [Day 3: AI Service](#day-3)
- [Day 4: Webview UI](#day-4)
- [Day 5: UX Polish](#day-5)
- [Day 6: Testing](#day-6)
- [Day 7: Documentation](#day-7)

---

## Day 1: Environment Setup

### Objective
Prepare development environment and generate extension scaffold.

### Tasks

1. Verify Node.js 18+ and VSCode installation
2. Install Yeoman and generator-code globally
3. Create project directory and run `yo code` generator with:
   - Type: New Extension (TypeScript)
   - Name: CodeCompass
   - Standard options (git init, npm, no bundling)
4. Install dependencies: Anthropic SDK, TypeScript types, build tools
5. Obtain Anthropic API key from console.anthropic.com

### Deliverables

- Project scaffold generated
- Dependencies installed (anthropic, @types/vscode, @types/node)
- API key secured for configuration

### Verification

- [ ] `npm run compile` succeeds
- [ ] Extension loads in development host (F5)
- [ ] Yeoman generated expected structure

---

## Day 2: Configuration & Structure

### Objective
Set up project structure and build configuration.

### Tasks

1. Create directory structure:
   - `src/services/` (AI, config, planning services)
   - `src/ui/` (webview panels)
   - `src/utils/` (helpers)
   - `src/types/` (TypeScript interfaces)
   - `.vscode/` (debug configs)

2. Update `package.json`:
   - Add activation events for commands
   - Define command contributions (open panel, generate plan)
   - Add configuration schema (apiKey, model, tokens)
   - Configure build scripts

3. Configure TypeScript:
   - Strict mode enabled
   - Proper output directory
   - ES2020 target

4. Create TypeScript types for:
   - Plan structure
   - Context (project data)
   - AI service configuration
   - UI messages

5. Set up VSCode debugging configs (launch.json, tasks.json)

### Deliverables

- Complete folder structure
- Configured package.json and tsconfig.json
- Core type definitions
- Debug configurations

### Verification

- [ ] All directories created
- [ ] `npm run compile` succeeds without errors
- [ ] Extension loads with new configuration

---

## Day 3: AI Service

### Objective
Implement Claude API integration.

### Tasks

1. Create `src/services/aiService.ts`:
   - Initialize Anthropic client with API key
   - Implement `generatePlan(prompt)` method
   - Add streaming support (for future enhancement)
   - Error handling for API failures (401, 429, 400)
   - System prompt defining planning assistant role

2. Create `src/services/configService.ts`:
   - Read settings from VSCode configuration
   - Fallback to environment variables
   - Provide API key, model, and token settings
   - Open settings UI helper
   - Configuration validation

3. Update `src/extension.ts`:
   - Initialize ConfigService and AIService
   - Register core commands
   - Show warning if API key not configured
   - Basic generate plan command (output channel)

### Deliverables

- Working Claude API integration
- Configuration management
- Extension loading with service initialization

### Verification

- [ ] AIService calls Claude API successfully (with valid key)
- [ ] ConfigService reads settings correctly
- [ ] Extension shows warning when API key missing
- [ ] No compilation errors

---

## Day 4: Webview UI

### Objective
Create interactive planning panel.

### Tasks

1. Create `src/services/planService.ts`:
   - Gather context: current file, project structure, tech stack, dependencies
   - Build prompt from task and context
   - Integrate with AIService
   - Return plan as string

2. Create `src/ui/planPanel.ts`:
   - PlanPanel class with singleton pattern
   - Webview with HTML/CSS/JS inline
   - User input form (textarea for task)
   - Action buttons: Generate, Copy, Export
   - Message handling between webview and extension
   - Loading states and error display
   - VSCode theme integration

3. Update `src/extension.ts`:
   - Initialize PlanService
   - Wire open panel command to PlanPanel.createOrShow()
   - Enhance generate command to use plan service

4. Implement export and copy functionality

### Deliverables

- Interactive webview panel
- Complete plan generation flow
- Copy to clipboard and file export

### Verification

- [ ] Panel opens from command palette
- [ ] Can enter task and generate plan
- [ ] Plan displays with readable formatting
- [ ] Copy and export buttons work
- [ ] Loading and error states function

---

## Day 5: UX Improvements

### Objective
Polish user experience and add helpful guidance.

### Tasks

1. Create `src/utils/settingsHelper.ts`:
   - First-time welcome message (show once)
   - API key check with actionable prompts
   - "Open Settings" and "Learn More" options

2. Update `extension.ts`:
   - Show welcome message on first activation
   - Integrate settings helpers

3. Enhance `planPanel.ts`:
   - Better error messages with action buttons
   - Input validation (minimum length, non-empty)
   - Disable button during generation

4. Improve output formatting:
   - Add header with metadata
   - Better progress messages
   - Consistent styling

### Deliverables

- First-time user onboarding
- Improved error handling
- Input validation
- Polished interactions

### Verification

- [ ] Welcome message shows on first extension activation
- [ ] "Open Settings" button appears when API key missing
- [ ] Input validation prevents empty/short tasks
- [ ] Progress messages are clear
- [ ] No console errors during normal use

---

## Day 6: Testing & Bug Fixes

### Objective
Validate end-to-end functionality and fix issues.

### Tasks

1. Create automated test script:
   - Compilation check
   - TypeScript error check
   - Required files verification
   - Run automatically via `npm test`

2. Perform manual testing:
   - Panel opens and displays correctly
   - Generate plan with various tasks
   - Copy and export operations
   - Error scenarios (no API key, no workspace, invalid input)
   - Theme compatibility

3. Document any issues found in TEST_ISSUES.md

4. Fix critical bugs:
   - Handle empty workspace gracefully
   - Add try-catch for file system operations
   - Validate all user inputs
   - Improve error messages

### Deliverables

- Test script and manual test results
- Bug fixes for critical issues
- TEST_ISSUES.md documentation

### Verification

- [ ] Automated tests pass
- [ ] All manual scenarios succeed
- [ ] No known critical bugs
- [ ] Extension stable in development host

---

## Day 7: Documentation & Wrap-up

### Objective
Create comprehensive documentation and prepare for Week 2.

### Tasks

1. Write README.md:
   - Project description and features
   - Installation and configuration guide
   - Usage instructions with examples
   - Architecture overview
   - Development guide (build, test, debug)
   - Project structure
   - Known limitations
   - Links to roadmap

2. Create WEEK1_SUMMARY.md:
   - What was built (with metrics)
   - Testing results
   - Known issues and technical debt
   - Lessons learned
   - Week 2 preview

3. Create planning directory:
   - `plan/WEEK2_PLAN.md` overview
   - Detailed day files will be created at Week 2 start

4. Update `.gitignore` with standard exclusions

5. Commit all changes with proper conventional commit message

### Deliverables

- Complete README
- Week 1 summary
- Week 2 planning structure
- Git commit with all Week 1 work

### Verification

- [ ] README is comprehensive and accurate
- [ ] WEEK1_SUMMARY.md documents the week
- [ ] plan/WEEK2_PLAN.md exists
- [ ] Git commit succeeds
- [ ] All files properly tracked

---

## Week 2 Preview

**Theme**: Enhanced Context & Testing Infrastructure

### Goals

1. **Smart Context Gathering** (Days 8-9)
   - Deep workspace scanning
   - Relevance ranking
   - Token budgeting (<100K tokens)

2. **Testing** (Days 10-11)
   - Jest setup with VSCode mocks
   - Unit tests for services
   - 50%+ coverage

3. **Polish** (Day 12)
   - Bug fixes
   - Retry logic
   - Code cleanup

4. **Planning** (Day 13)
   - Documentation updates
   - Week 3 roadmap

---

## Success Criteria

By end of Week 1, the extension should:

- [ ] Load in VSCode without errors
- [ ] Open interactive planning panel
- [ ] Generate plans using Claude API
- [ ] Copy plans to clipboard
- [ ] Export plans to markdown files
- [ ] Handle errors gracefully with actionable messages
- [ ] TypeScript compiles cleanly
- [ ] All automated tests pass
- [ ] Documentation complete
- [ ] Code committed to git

---

## Architecture Summary

### Components

**Services** (business logic):
- `AIService` - Claude API communication
- `ConfigService` - Settings and configuration
- `PlanService` - Context gathering and prompt engineering

**UI**:
- `PlanPanel` - Webview panel with user interface

**Utilities**:
- `settingsHelper` - User onboarding and guidance

**Types**:
- Interfaces for Plan, Context, Configuration, etc.

### Data Flow

1. User enters task → Webview sends message
2. Extension → PlanService gathers context
3. PlanService → AIService calls Claude
4. Claude returns plan → Display in webview
5. User copies or exports plan

---

## Getting Help

- VSCode Extension API: https://code.visualstudio.com/api
- Anthropic Claude: https://docs.anthropic.com/
- Full roadmap: `codecompass-roadmap.md`
- Issues: Create GitHub issues for bugs/requests

---

**Ready to start with Day 1?**
