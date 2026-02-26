# CLAUDE.md

## Project Overview

**HomeKey 房客** is a real estate affiliate marketing platform for Taiwan's apartment market. It connects apartment merchants with KOLs (Key Opinion Leaders) who earn commissions by referring buyers through trackable affiliate links.

**Current phase**: Visual prototype/demo (investor-facing). All data is mock/hardcoded — no real backend, auth, or database yet.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **i18n**: next-intl (Traditional Chinese `zh-TW` + English `en`)
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Dev Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Project Structure

```
src/
├── app/
│   └── [locale]/          # i18n dynamic segment (en, zh-TW)
│       ├── admin/         # Admin dashboard
│       ├── kol/           # KOL dashboard (links, performance, commissions)
│       ├── merchant/      # Merchant portal
│       └── property/      # Property listing pages
├── components/
│   ├── layout/            # Shared layout components (header, sidebar, etc.)
│   ├── ui/                # shadcn/ui primitives
│   └── ...                # Feature components
├── data/                  # Mock/hardcoded data
├── hooks/                 # Custom React hooks
├── i18n/                  # Translation files and config
└── lib/                   # Utilities (cn, helpers, etc.)
```

## Key Conventions

- **All data is mocked** — no API calls. Data lives in `src/data/`.
- **i18n is required** — every user-facing string must use `next-intl` (`useTranslations`). Never hardcode English or Chinese strings directly in JSX.
- **Component style**: Use shadcn/ui components where possible. Extend with Tailwind utility classes.
- **Routing**: App Router only. Use `[locale]` dynamic segment for all pages.
- **TypeScript**: Strict mode is on. Avoid `any`.
- **File naming**: kebab-case for files/folders, PascalCase for components.

## Architecture Notes

- The project is structured for future backend integration. Keep data-fetching logic in a dedicated layer (currently `src/data/`) so it can be swapped out for real API calls later.
- No authentication exists yet. Role-based views (Admin / KOL / Merchant) are navigated directly.
- Three user roles: **Admin**, **KOL**, **Merchant** — each has its own dashboard section.

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

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
