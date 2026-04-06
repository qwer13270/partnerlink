# CLAUDE.md

## Project Overview

**HomeKey 房客** is a KOL and merchant platform. It connects KOL and merchants who earn commissions by referring buyers through trackable affiliate links.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Supabase (auth + database)
- **Deployment**: Vercel

## Dev Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Key Conventions

- **Data layer**: Real API routes in `src/app/api/` backed by Supabase. Some mock data remains in `src/data/` for UI development.
- **Component style**: Use shadcn/ui components where possible. Extend with Tailwind utility classes.
- **TypeScript**: Strict mode is on. Avoid `any`.
- **File naming**: kebab-case for files/folders, PascalCase for components.

## Architecture Notes

- Backend is Supabase. Auth is handled via `src/middleware.ts` and `src/lib/supabase/`. Real API routes live in `src/app/api/`.
- Remaining mock data in `src/data/` is for UI-only features not yet wired to the backend.
- Three user roles: **Admin**, **KOL**, **Merchant** — each has its own dashboard section.

## 代碼風格 / Code Style

### Components
- Functional components only — no class components
- `'use client'` directive at the top of client components; server components are `async` functions with no directive
- Default exports for all components: `export default function ComponentName({ prop }: Props)`
- Props typed with inline interfaces defined above the function in the same file
- Shared domain types live in `src/lib/types.ts`; feature-specific types in a `_types.ts` file within the feature folder

### Data Fetching
- Pages are server components that fetch data upfront and pass it as props to `'use client'` child components
- Parallel fetches use `Promise.all()`
- Supabase: use `getSupabaseAdminClient()` server-side, `getSupabaseBrowserClient()` client-side
- Client components do not use `useEffect` for initial data fetching — receive pre-fetched props instead
- When a client component needs live data, fetch via `fetch('/api/...')` with a Bearer token

### API Routes
- Named exports for HTTP verbs: `export async function GET(...)`, `export async function POST(...)`
- Auth check first on every route via `requireApiRole(request, ['role'])`
- Errors returned as `NextResponse.json({ error: '...' }, { status: ### })`
- Error logging pattern: `console.error('[api/route-name] operation:', error.message)`
- Validate request body fields with type checks before use: `typeof body.field === 'string' ? body.field.trim() : ''`

### Styling
- All styling via Tailwind utility classes — no CSS modules
- Use `cn()` from `@/lib/utils` for conditional or merged class names
- Extract repeated class strings to constants (e.g., status color maps) rather than duplicating inline

### Error Handling
- API routes: return appropriate HTTP status codes with a `{ error }` JSON body
- Client forms: store error in state (`const [submitError, setSubmitError] = useState<string | null>(null)`) and render in UI
- After Supabase queries, always check `if (error || !data)` before proceeding
- After `fetch()` calls, check `if (!res.ok)` and parse the error body

## Workflow Orchestration

### 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to tasks/todo.md with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to tasks/todo.md
6. **Capture Lessons**: Update tasks/lessons.md after corrections

## 測試 / Testing

- **Framework**: Vitest — unit tests for business logic in `src/lib/`
- **Run tests**: `npm run test` (single run) or `npm run test:watch` (watch mode)
- After any change to a tested file, run `npm run test` and fix all failures before marking the task done
- Test files live in `__tests__/` folders next to the code they test (e.g. `src/lib/__tests__/`)

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
