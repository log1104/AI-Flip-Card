Updated capabilities as of the Supabase integration refactor:

**Authentication & Profiles**

*   Supabase Auth powers email/password sign-up as well as Google and GitHub OAuth flows.
*   The React context in `auth/AuthContext.tsx` exposes session state and helper methods for the UI components (`LoginForm`, `RegisterForm`, `LogoutButton`).

**Deck & Card Management**

*   Decks (`decks` table) and cards (`cards` table) live in Supabase and are loaded through the Zustand store (`store.ts`).
*   CRUD actions for decks/cards are optimistically applied in the UI and replayed against Supabase when online.
*   The new UI (`DeckList`, `CardView`, `AddCardModal`) provides creation, renaming, deletion, and editing for both decks and cards.

**Offline Support**

*   Mutations performed while offline are queued in `localStorage` (`flip-card-pending-mutations`) and automatically retried when connectivity returns.
*   Pending sync count is surfaced in the header and deck list so users know if work is still in flight.

**User Experience**

*   Clean two-column layout with deck management on the left and card gallery on the right.
*   `ThemeManager` preserves light/dark/system preferences.
*   Flip cards remain the primary interaction, using the existing `FlipCard` component with updated styling for the new data model.
