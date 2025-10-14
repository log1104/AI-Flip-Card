# Zustand Integration Fixes

## Summary
- The legacy localStorage store was replaced with a Supabase-backed Zustand store (`store.ts`). It keeps decks/cards synced with the backend, queues offline mutations, and replays them once connectivity returns.
- Selectors across the app (`App.tsx`, `components/DeckList.tsx`, `components/CardView.tsx`) rely on `zustand/shallow` so optimistic updates do not trigger render storms.
- The optional peer dependency `use-sync-external-store` remains in `package.json`, ensuring the `zustand/traditional` helpers resolve cleanly during `npm run lint`, `npm run typecheck`, and `npm run build`.
