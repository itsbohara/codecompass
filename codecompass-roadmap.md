# CodeCompass - Project Roadmap
## AI-Powered Planning & Research Assistant for VSCode

### 🎯 Core Mission
CodeCompass is a VSCode extension that helps developers plan, research, and structure coding tasks without writing the actual code. It produces detailed, actionable plans that can be handed off to AI coding tools (Claude Code, Cursor, Copilot, etc.) or implemented manually.

---

## 📋 Core Features

### Phase 1: MVP (Weeks 1-4)
**Goal: Basic planning assistant that works**

#### 1.1 Task Decomposition
- Accept high-level task descriptions from user
- Break down tasks into logical subtasks
- Generate step-by-step implementation plan
- Output format: Markdown with clear sections

#### 1.2 Context Awareness
- Read current file content
- Analyze project structure (package.json, file tree)
- Understand technology stack
- Include relevant context in planning

#### 1.3 Simple UI
- Command palette integration (`CodeCompass: Plan Task`)
- Side panel for displaying plans
- Basic input form for task description
- Export plan to markdown file

#### 1.4 AI Integration (Basic)
- Integration with Claude API (Anthropic)
- Simple prompt engineering for task breakdown
- Token management and error handling
- API key configuration in settings

**MVP Deliverables:**
- Working VSCode extension
- Can decompose 1 task into actionable plan
- Exports to markdown
- Uses Claude API for intelligence

---

### Phase 2: Enhanced Research (Weeks 5-8)
**Goal: Deep context understanding and research capabilities**

#### 2.1 Codebase Analysis
- Scan entire workspace for relevant files
- Identify patterns, conventions, and architecture
- Detect dependencies and their versions
- Map file relationships and imports

#### 2.2 Web Research Integration
- Search documentation (MDN, Stack Overflow, official docs)
- Find best practices for detected tech stack
- Identify potential libraries/packages
- Summarize research findings in plan

#### 2.3 Documentation Understanding
- Read local README, CONTRIBUTING files
- Parse inline code comments
- Understand project-specific patterns
- Respect existing architectural decisions

#### 2.4 Enhanced Planning Output
- Include research references in plan
- Suggest libraries/packages with rationale
- Identify potential gotchas or edge cases
- Add implementation estimates (time/complexity)

**Phase 2 Deliverables:**
- Intelligent codebase scanning
- Web research capabilities
- Richer, research-backed plans
- Better context awareness

---

### Phase 3: Multi-Step Workflows (Weeks 9-12)
**Goal: Handle complex, multi-phase projects**

#### 3.1 Project Breakdown
- Handle large features spanning multiple files
- Create phased implementation plans
- Dependency tracking between tasks
- Milestone suggestions

#### 3.2 Interactive Planning
- Iterative refinement of plans
- User can ask follow-up questions
- Modify/regenerate specific sections
- Chat-like interface for planning discussion

#### 3.3 Plan Templates
- Common patterns (CRUD, API integration, etc.)
- Customizable plan templates
- Project-type detection (React, Node, Python, etc.)
- User can save/share templates

#### 3.4 Handoff Optimization
- Format plans specifically for target tools
  - Claude Code format
  - Cursor format
  - Generic AI assistant format
  - Human-readable format
- Include file paths, line numbers
- Add checkboxes for task tracking

**Phase 3 Deliverables:**
- Multi-step project planning
- Interactive plan refinement
- Multiple export formats
- Template system

---

### Phase 4: Intelligence & Polish (Weeks 13-16)
**Goal: Production-ready, delightful experience**

#### 4.1 Smart Features
- Learn from user's coding style
- Suggest based on git history
- Detect similar past tasks
- Auto-fill common patterns

#### 4.2 Collaboration
- Share plans with team
- Plan versioning and history
- Comments/annotations on plans
- Team templates and standards

#### 4.3 Integration Ecosystem
- Direct handoff to Claude Code
- Cursor integration
- GitHub Issues integration
- Jira/Linear task creation
- Export to Notion, Obsidian

#### 4.4 UX Polish
- Syntax highlighting in plans
- Collapsible sections
- Progress tracking
- Beautiful, intuitive UI
- Dark/light theme support
- Keyboard shortcuts

**Phase 4 Deliverables:**
- Polished, production-ready extension
- Multi-tool integrations
- Team collaboration features
- Delightful UX

---

## 🏗️ Technical Architecture

### Tech Stack

#### Extension Core
```
- Language: TypeScript
- Framework: VSCode Extension API
- Build: esbuild/webpack
- Testing: Jest + VSCode Extension Test Runner
```

#### AI/LLM Integration
```
- Primary: Anthropic Claude API (Sonnet 4)
- Fallback: OpenAI GPT-4
- Local option: Ollama integration
- Streaming support for real-time output
```

#### Data Storage
```
- Local: VSCode workspace state
- Cache: File system cache for analyses
- Config: VSCode settings.json
- History: SQLite for plan history
```

#### Key Dependencies
```
- @anthropic-ai/sdk - Claude API client
- @vscode/extension-api - VSCode APIs
- globby - File system traversal
- markdown-it - Markdown parsing
- cheerio - Web scraping (research)
- simple-git - Git operations
```

### Architecture Diagram

```
┌─────────────────────────────────────────┐
│         VSCode Extension Host           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │   UI Layer   │  │  Command Layer  │ │
│  │              │  │                 │ │
│  │ - Webview    │  │ - Commands      │ │
│  │ - Panel      │  │ - Menu items    │ │
│  │ - Input      │  │ - Keybindings   │ │
│  └──────┬───────┘  └────────┬────────┘ │
│         │                   │          │
│         └────────┬──────────┘          │
│                  │                     │
│         ┌────────▼─────────┐           │
│         │  Planning Engine │           │
│         │                  │           │
│         │ - Task decomp    │           │
│         │ - Context gather │           │
│         │ - Plan generation│           │
│         └────────┬─────────┘           │
│                  │                     │
│    ┌─────────────┼─────────────┐       │
│    │             │             │       │
│ ┌──▼────┐  ┌────▼─────┐  ┌───▼────┐   │
│ │Context│  │    AI    │  │Research│   │
│ │Analyzer│  │ Service  │  │Engine  │   │
│ │       │  │          │  │        │   │
│ │-Files │  │-Claude   │  │-Web    │   │
│ │-Git   │  │-Stream   │  │-Docs   │   │
│ │-AST   │  │-Prompts  │  │-Search │   │
│ └───────┘  └──────────┘  └────────┘   │
│                                        │
└────────────────────────────────────────┘
```

---

## 📝 Detailed Implementation Plan

### Week 1-2: Foundation & Setup

#### Tasks:
1. **Project Initialization**
   ```bash
   npm install -g yo generator-code
   yo code  # Generate extension scaffold
   ```

2. **Basic Structure**
   ```
   codecompass/
   ├── src/
   │   ├── extension.ts          # Entry point
   │   ├── commands/              # Command handlers
   │   ├── services/              # Core services
   │   │   ├── aiService.ts       # Claude integration
   │   │   ├── contextService.ts  # Codebase analysis
   │   │   └── planService.ts     # Plan generation
   │   ├── ui/                    # UI components
   │   │   ├── planPanel.ts       # Webview panel
   │   │   └── inputForm.ts       # User input
   │   └── utils/                 # Utilities
   ├── package.json
   └── tsconfig.json
   ```

3. **VSCode Extension Basics**
   - Register commands
   - Create activation events
   - Set up configuration schema
   - Implement basic webview

4. **Claude API Integration**
   - Set up Anthropic SDK
   - Create API wrapper service
   - Implement streaming responses
   - Add error handling

**Deliverable:** Extension loads, can call Claude API, shows output in panel

---

### Week 3-4: Core Planning Feature

#### Tasks:
1. **Context Collection**
   ```typescript
   class ContextService {
     async gatherContext(): Promise<Context> {
       return {
         currentFile: await this.getCurrentFile(),
         projectStructure: await this.getFileTree(),
         dependencies: await this.getDependencies(),
         techStack: await this.detectTechStack()
       };
     }
   }
   ```

2. **Prompt Engineering**
   - Design system prompt for task planning
   - Create templates for different task types
   - Add context injection logic
   - Optimize for quality output

3. **Plan Generation**
   ```typescript
   class PlanService {
     async generatePlan(task: string, context: Context): Promise<Plan> {
       const prompt = this.buildPrompt(task, context);
       const response = await aiService.complete(prompt);
       return this.parsePlan(response);
     }
   }
   ```

4. **Output Formatting**
   - Markdown generation
   - Syntax highlighting
   - Export functionality
   - Copy to clipboard

**Deliverable:** Working MVP that can plan a single task

---

### Week 5-6: Codebase Analysis

#### Tasks:
1. **File System Scanner**
   ```typescript
   class CodebaseAnalyzer {
     async analyzeWorkspace(): Promise<Analysis> {
       const files = await this.scanFiles();
       const structure = await this.buildStructure(files);
       const patterns = await this.detectPatterns(files);
       return { files, structure, patterns };
     }
   }
   ```

2. **AST Parsing**
   - Parse TypeScript/JavaScript files
   - Extract functions, classes, imports
   - Build dependency graph
   - Identify code patterns

3. **Git Integration**
   ```typescript
   class GitService {
     async getRelevantHistory(file: string): Promise<Commit[]> {
       // Recent changes to understand context
     }
     
     async getSimilarTasks(): Promise<Task[]> {
       // Find similar past work
     }
   }
   ```

4. **Smart Context Selection**
   - Rank files by relevance
   - Limit context to fit token budget
   - Prioritize recent/modified files
   - Include only necessary code

**Deliverable:** Deep codebase understanding, context-aware planning

---

### Week 7-8: Research Capabilities

#### Tasks:
1. **Documentation Search**
   ```typescript
   class ResearchService {
     async searchDocs(query: string, techStack: string[]): Promise<Result[]> {
       // Search official docs, MDN, etc.
     }
     
     async findBestPractices(task: string): Promise<Guide[]> {
       // Find relevant patterns
     }
   }
   ```

2. **Package Discovery**
   - Search npm/PyPI for relevant packages
   - Compare alternatives
   - Check popularity, maintenance
   - Add to plan with reasoning

3. **Web Integration**
   - Implement web search (using search API)
   - Parse Stack Overflow answers
   - Extract code examples
   - Summarize findings

**Deliverable:** Research-backed plans with external knowledge

---

### Week 9-10: Multi-Step Planning

#### Tasks:
1. **Task Breakdown Algorithm**
   ```typescript
   class TaskDecomposer {
     async decompose(feature: string): Promise<Subtask[]> {
       // Break into phases
       // Identify dependencies
       // Order by priority
     }
   }
   ```

2. **Dependency Management**
   - Track task dependencies
   - Suggest implementation order
   - Identify blockers
   - Create milestone groups

3. **Interactive Refinement**
   - Chat interface for follow-ups
   - Plan modification
   - Regenerate sections
   - Version history

**Deliverable:** Handle complex, multi-file features

---

### Week 11-12: Handoff Formats

#### Tasks:
1. **Export Templates**
   ```typescript
   interface ExportFormat {
     claudeCode: () => string;    // Optimized for Claude Code
     cursor: () => string;         // Cursor-compatible
     markdown: () => string;       // Generic markdown
     checklist: () => string;      // Task checklist
   }
   ```

2. **Tool-Specific Optimization**
   - Claude Code: Include file paths, clear instructions
   - Cursor: Add @-mentions, file references
   - Generic: Human-readable, step-by-step

3. **Metadata Inclusion**
   - File locations
   - Line numbers where relevant
   - Estimated complexity
   - Priority levels

**Deliverable:** Plans ready for any AI coding tool

---

### Week 13-14: Polish & Intelligence

#### Tasks:
1. **Learning System**
   - Track successful plans
   - Learn user preferences
   - Adapt to coding style
   - Personalized suggestions

2. **Plan History**
   ```typescript
   class HistoryService {
     async savePlan(plan: Plan): Promise<void>;
     async searchHistory(query: string): Promise<Plan[]>;
     async findSimilar(task: string): Promise<Plan[]>;
   }
   ```

3. **UI/UX Improvements**
   - Beautiful webview design
   - Progress indicators
   - Keyboard shortcuts
   - Smooth animations

**Deliverable:** Intelligent, delightful experience

---

### Week 15-16: Integrations & Launch

#### Tasks:
1. **Direct Integrations**
   - Claude Code API/CLI integration
   - Cursor API integration
   - GitHub Issues export
   - Copy formatted for any tool

2. **Testing & QA**
   - Unit tests (80%+ coverage)
   - Integration tests
   - User acceptance testing
   - Performance optimization

3. **Documentation**
   - README with examples
   - Video walkthrough
   - API documentation
   - Contributing guide

4. **Marketplace Preparation**
   - Icon and branding
   - Screenshots and demos
   - Extension description
   - Publisher account setup

**Deliverable:** Launch-ready extension on VSCode Marketplace

---

## 🔧 Key Implementation Details

### 1. Prompt Engineering for Planning

```typescript
const SYSTEM_PROMPT = `You are CodeCompass, an expert software architect and planning assistant.

Your role is to:
1. Analyze the task and codebase context
2. Break down complex features into clear, actionable steps
3. Research best practices and suggest appropriate tools/libraries
4. Create detailed implementation plans (NOT write code)
5. Format plans for handoff to AI coding tools or human developers

Guidelines:
- Be specific about file locations and what needs to change
- Include research findings and rationale for decisions
- Identify potential challenges or edge cases
- Suggest testing approaches
- Keep plans actionable and clear

Output format: Structured markdown with clear sections.`;

const USER_PROMPT_TEMPLATE = `
Task: {task}

Context:
- Current File: {currentFile}
- Project Type: {projectType}
- Tech Stack: {techStack}
- Dependencies: {dependencies}
- Recent Changes: {gitHistory}
- Relevant Files: {relevantFiles}

Create a detailed implementation plan for this task. Include:
1. Overview and approach
2. Research findings (libraries, best practices)
3. Step-by-step breakdown
4. Files to create/modify
5. Testing considerations
6. Potential challenges

Format the plan for handoff to {targetTool}.
`;
```

### 2. Context Gathering Strategy

```typescript
async function gatherSmartContext(task: string): Promise<Context> {
  // 1. Analyze task to understand scope
  const scope = await analyzeTaskScope(task);
  
  // 2. Find relevant files (limit to most important)
  const relevantFiles = await findRelevantFiles(task, scope);
  
  // 3. Get project structure
  const structure = await getProjectStructure();
  
  // 4. Read key config files
  const config = await getProjectConfig();
  
  // 5. Check git history for similar work
  const history = await findSimilarCommits(task);
  
  // 6. Detect patterns and conventions
  const patterns = await detectCodePatterns(relevantFiles);
  
  // 7. Fit everything into token budget (e.g., 100K tokens)
  return optimizeContext({
    task,
    scope,
    relevantFiles: relevantFiles.slice(0, 10), // Limit
    structure,
    config,
    history: history.slice(0, 5),
    patterns
  }, MAX_CONTEXT_TOKENS);
}
```

### 3. File Scanning with Relevance Ranking

```typescript
class FileRelevanceRanker {
  async rankFiles(task: string, files: string[]): Promise<RankedFile[]> {
    const scores = await Promise.all(
      files.map(async (file) => {
        let score = 0;
        
        // Keyword matching in filename
        if (this.matchesKeywords(file, task)) score += 10;
        
        // Recently modified
        const stats = await fs.stat(file);
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 5 - daysSinceModified);
        
        // Import relationships
        const importCount = await this.countImports(file);
        score += Math.min(importCount, 5);
        
        // File type relevance
        if (this.isRelevantType(file, task)) score += 3;
        
        return { file, score };
      })
    );
    
    return scores.sort((a, b) => b.score - a.score);
  }
}
```

### 4. Plan Output Format

```markdown
# Implementation Plan: [Feature Name]

## 📋 Overview
[High-level description of what needs to be done]

## 🔍 Research & Recommendations
### Libraries/Tools
- **[Library Name]** (v1.2.3)
  - Why: [Rationale]
  - Alternatives considered: [Others]
  
### Best Practices
- [Practice 1 with reference]
- [Practice 2 with reference]

## 🏗️ Implementation Steps

### Phase 1: [Phase Name]
**Files to modify:**
- `src/components/Feature.tsx` (lines 45-67)
- `src/services/api.ts` (new file)

**Steps:**
1. [ ] Step description
   - Details and considerations
   - Expected outcome
   
2. [ ] Next step
   - More details

### Phase 2: [Next Phase]
[...]

## ⚠️ Potential Challenges
1. **Challenge**: [Description]
   - **Solution**: [Approach]

## ✅ Testing Strategy
- Unit tests: [What to test]
- Integration tests: [What to test]
- Manual testing: [Steps]

## 📚 References
- [Documentation link]
- [Stack Overflow answer]
- [GitHub issue]

---
Generated by CodeCompass | Ready for: Claude Code, Cursor, or manual implementation
```

---

## 🚀 MVP Launch Checklist

### Before Publishing:
- [ ] Extension works in clean VSCode install
- [ ] API key setup is clear and documented
- [ ] Error handling for common failures
- [ ] At least 3 successful test cases
- [ ] Icon and branding complete
- [ ] README with screenshots
- [ ] Demo video (2-3 minutes)
- [ ] Privacy policy (if collecting data)
- [ ] License file (MIT recommended)

### Marketplace Requirements:
- [ ] Unique extension name
- [ ] Clear description (150 chars)
- [ ] 5+ screenshots
- [ ] Categories selected
- [ ] Tags added
- [ ] Publisher verified
- [ ] Version 0.1.0 or higher

---

## 💡 Success Metrics

### MVP Success:
- [ ] 100+ installs in first month
- [ ] 4+ star rating
- [ ] 5+ GitHub stars
- [ ] Positive user feedback

### Long-term Goals:
- 10,000+ installs
- Integration partnerships (Cursor, etc.)
- Active community contributions
- Sustainable development model

---

## 🎓 Learning Resources

### VSCode Extension Development:
- [Official Extension Guide](https://code.visualstudio.com/api)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Webview Guide](https://code.visualstudio.com/api/extension-guides/webview)

### AI Integration:
- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- [Token Management](https://docs.anthropic.com/en/docs/build-with-claude/token-counting)

### TypeScript/Testing:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [VSCode Test Runner](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

---

## 🤝 Next Steps

1. **Set up development environment**
   - Install Node.js 18+
   - Install VSCode Insiders (for testing)
   - Get Anthropic API key

2. **Week 1 Sprint Plan**
   - Day 1-2: Generate extension scaffold, explore VSCode API
   - Day 3-4: Implement basic Claude API integration
   - Day 5-6: Create simple webview UI
   - Day 7: Test end-to-end flow with sample task

3. **Create GitHub repo**
   - Initialize with good README
   - Set up issue templates
   - Create project board
   - Add CI/CD (GitHub Actions)

4. **Join communities**
   - VSCode Extension authors
   - Anthropic Discord/Forum
   - Reddit r/vscode

---

**Ready to build? Let's start with Week 1!** 🚀
