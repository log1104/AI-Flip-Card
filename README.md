<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Flip Cards

A Supabase-backed PWA for creating, studying, and syncing flashcard decks. Users authenticate with email/password or Google OAuth; decks and cards are stored in Supabase with optimistic updates and an offline queue that replays mutations when connectivity returns.

## Project Structure

```
.
├── App.tsx                   # Root UI + auth gating
├── auth/AuthContext.tsx      # Supabase auth context & hooks
├── components/               # UI building blocks
│   ├── AddCardModal.tsx
│   ├── CardView.tsx
│   ├── DeckList.tsx
│   ├── FlipCard.tsx
│   └── ThemeManager.tsx
├── store.ts                  # Zustand store that syncs decks/cards via Supabase
├── supabaseClient.ts         # Supabase singleton
├── types.ts                  # Shared TypeScript types
├── index.css                 # Tailwind entrypoint (processed via PostCSS)
├── tailwind.config.js        # Tailwind content scan + theme extension
├── postcss.config.js         # Tailwind/PostCSS pipeline
└── zustand-fix-summary.md    # Notes on earlier state-management fixes
```

## Prerequisites

- Node.js 18+
- A Supabase project with the following tables:

```sql
-- auth is handled by Supabase Auth (no table required)
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade,
  front jsonb not null,
  back jsonb not null,
  created_at timestamp with time zone default now()
);
```

Enable Row Level Security (RLS) on the tables and add policies such as:

```sql
create policy "Users can manage their decks"
on public.decks
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage cards in their decks"
on public.cards
for all using (
  exists (
    select 1 from public.decks d
    where d.id = cards.deck_id and d.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.decks d
    where d.id = cards.deck_id and d.user_id = auth.uid()
  )
);
```

## Environment Variables

Copy `.env.local` and provide real values (see [docs/supabase-setup.md](docs/supabase-setup.md) for step-by-step guidance):

```
GEMINI_API_KEY=placeholder-or-remove-if-unused
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
VITE_SUPABASE_GOOGLE_ENABLED=true
```

When deploying to Vercel, add the same variables in the project settings.

## Scripts

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Run Vite dev server (Tailwind via PostCSS)  |
| `npm run build`      | Create production build                     |
| `npm run preview`    | Preview the production build locally        |
| `npm run typecheck`  | Run TypeScript in `--noEmit` mode           |
| `npm run lint`       | Lint `*.ts`/`*.tsx` using ESLint flat config |

## Local Development

1. Install dependencies  
   ```bash
   npm install
   ```
2. Populate `.env.local` with Supabase credentials.
3. Start the dev server  
   ```bash
   npm run dev
   ```
4. Visit the printed URL (default `http://localhost:5173`). Sign up or sign in to create decks/cards. Changes sync automatically; offline edits are queued in `localStorage` and replayed when the browser regains connectivity.

## Deployment Checklist

1. Supabase:
   - Run [`supabase/schema.sql`](supabase/schema.sql) to provision tables/policies.
   - Enable auth providers and configure redirect URLs (details in [docs/supabase-setup.md](docs/supabase-setup.md)).
2. Vercel:
   - Connect the repository, configure Env Vars (`GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), and deploy.
3. Optional: set up Supabase Storage/Functions or the `profiles` table for user metadata, then extend the app/UI.

## Testing & QA Notes

- Use `npm run typecheck` and `npm run lint` before pushing changes.
- `npm run build` verifies that Vercel’s production build will succeed.
 - Pending mutations are stored under the `flip-card-pending-mutations` key in `localStorage`; clear it to reset offline queues during testing.

## Recent UX Improvements

- Gallery cards: actions are pinned in a fixed footer on the back face so long answers never push Edit/Delete off screen. The content area scrolls when needed.
- Subtle overflow hint: a bottom fade mask (`.scroll-fade`) applied to scrollable areas suggests there is more content below.
- Stable scrollbars: `.scroll-stable` reserves gutter space to prevent layout jumps when scrollbars appear (notable on Windows).
- Study session layout: navigation row is now a 3-column grid, keeping the card perfectly centered between the left/right arrows across breakpoints.
- Flip cue: a small `touch_app` hint with the label "Flip" appears on the front of study cards, consistent with the gallery.

### Utility Classes

- `.scroll-fade` — adds a linear-gradient mask to the bottom of a scrollable pane.
- `.scroll-stable` — sets `scrollbar-gutter: stable both-edges` to avoid horizontal reflow when a vertical scrollbar toggles.

These utilities are defined in `index.css` and can be applied to any scrollable container.
