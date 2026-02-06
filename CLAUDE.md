# Agent Rules for Claude Code

## Build Step

**After finishing any task, run `pnpm compile` to build the package.**

- Always compile after making code changes to ensure the changes are reflected in the extension
- This generates the compiled output in the `dist/` folder

## Git Workflow

**DO NOT automatically commit and push to GitHub after making changes.**

- Only stage, commit, or push when explicitly asked by the user
- Do not run git push as part of the session close protocol
- Wait for explicit user confirmation before any git operations that affect remote

**Before committing, always prompt to clean up debug logs.**

- If `console.log`, `console.debug`, or other debug statements were added during troubleshooting, ask the user if they should be removed before committing
- Error handling logs (`console.error`) can typically remain
- One-time initialization logs are generally acceptable to keep
