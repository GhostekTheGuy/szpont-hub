# CLAUDE.md - Rules for Claude Code

## Build & Deploy
- Project uses Next.js 14.2.3 with pnpm
- Always verify code compiles: `pnpm run build` before considering work done
- TypeScript strict mode is enabled
- Target is NOT es2015+ — do NOT use raw Map/Set iterators in for..of loops. Use `Array.from()` to wrap iterators (e.g., `Array.from(map.entries())`)

## Code Quality
- Write performant code — avoid unnecessary re-renders, redundant computations, and excessive API calls
- Keep bundle size small — no unnecessary dependencies
- Use server actions (`'use server'`) for data fetching where possible
- Follow existing code patterns and conventions in the codebase

## Security
- Never expose API keys, secrets, or credentials in client-side code
- Validate and sanitize all user inputs
- Use parameterized queries for database operations (Prisma handles this)
- Do not disable TypeScript strict checks or ESLint rules to bypass errors — fix the root cause

## TypeScript
- Do not use `any` type — use proper types or `unknown` with type guards
- Do not use `@ts-ignore` or `@ts-expect-error` — fix the underlying type issue
- Do not add `downlevelIteration` to tsconfig — use `Array.from()` instead

## Git
- Write concise commit messages in English with conventional commit prefixes (fix:, feat:, ref:, etc.)
- Do not commit `.env` files or secrets
