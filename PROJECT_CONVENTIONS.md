# CodeCompass Project Conventions

This file defines standards and preferences for the CodeCompass project. Always refer to this when suggesting commands or making decisions.

---

## 📦 Package Management

### Primary Package Manager
**Use pnpm for all package operations**

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add package-name

# Add dev dependency
pnpm add -d package-name

# Run scripts
pnpm run compile
pnpm test
```

### Why pnpm?
- Fast and efficient
- Better disk space usage
- Strict dependency management
- Considers this project's choice

---

## 🔧 Build Tool

### Bundler
**Use esbuild**

- Faster than webpack
- Simpler configuration
- Better for VSCode extensions

### Build Command
```bash
pnpm run compile  # or pnpm run esbuild
```

---

## 🎨 UI Technology

### Phase 1 (MVP) - Webview Panel
**Plain HTML/CSS/JS (no framework)**

- Inline HTML in PlanPanel.ts
- CSS variables for VSCode theme support
- No build step for webview
- Fast iteration

### Why Plain HTML for MVP?
- Simplicity and speed
- No extra dependencies
- Good enough for simple panel (textarea + buttons + output)
- Can upgrade to React later if needed

### When to Add React + Tailwind? (Phase 2 or 3)
- Complex state management needed
- Reusable components required
- Advanced UI features

---

## 💻 Shell Commands

### Command Preferences
- `pnpm` over `npm` or `bun` for package operations
- `cat > file` for file creation
- `mkdir -p` for directory creation
- Conventional for git operations

---

## 📁 Project Structure

### Service Layer
```
src/services/
├── aiService.ts      # Claude API integration
├── configService.ts  # Settings management
└── planService.ts    # Context gathering, prompt building
```

### UI Layer
```
src/ui/
└── planPanel.ts       # Webview panel
```

### Types Layer
```
src/types/
└── index.ts           # TypeScript interfaces
```

### Utils Layer
```
src/utils/
└── settingsHelper.ts  # UX helpers
```

---

## 🎯 Development Workflow

### Standard Commands
```bash
# Development
pnpm run compile        # Compile TypeScript
pnpm run watch         # Watch mode
pnpm test               # Run tests

# VSCode
F5                     # Start development host
Cmd+Shift+P             # Open command palette
```

---

## 🔑 API Keys & Secrets

- Never commit API keys
- Use `.env.example` as template
- Support multiple configuration methods:
  - VSCode settings (primary)
  - Environment variables (fallback)

---

## 📝 Documentation

### README.md Structure
- Project description
- Features
- Installation
- Configuration
- Usage
- Architecture
- Development guide
- Project structure

### Documentation Style
- Clear, concise
- Include examples
- Keep up-to-date with code

---

## 🧪 Testing

### Phase 1 MVP
- Manual testing only
- Manual test checklist

### Phase 2+
- Unit tests with Jest
- Integration tests
- Mock VSCode API

---

## 🎨 Code Style

### TypeScript
- Strict mode enabled
- Proper typing
- JSDoc for public methods

### VSCode Extension
- Use `vscode.*` APIs
- Proper disposal of resources
- Error messages should be actionable

---

## 📋 When in Doubt

Ask: "What does PROJECT_CONVENTIONS.md say?"

This file is the source of truth for project decisions.

---

*Created: 2026-02-05*
*Last updated: 2026-02-05*