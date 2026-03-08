# TannenTails — Project Memory

## What It Is

GPS-guided forest trail app (Angular 20 + Ionic 8 + Capacitor 7) for Goslar Stadtwald, Germany. Built by MachMit!Goslar. Users walk 11 stations, answer multiple-choice quizzes when within 25 m, earn Firebase badges.

## Key Architecture Points

- All components are **standalone** (`standalone: true`, explicit imports)
- Ionic components imported from `@ionic/angular/standalone` individually
- Services use `inject()` not constructor injection, all `providedIn: 'root'`
- Lazy routing via `loadComponent()` in `app.routes.ts`
- Station IDs are **strings** (`'1'`–`'11'`), not numbers
- All trail data is static in `src/app/core/models/dataset.ts` (not Firestore)

## Important Files

- `src/app/core/models/dataset.ts` — StationData, QuestionData, PathData, SpecialPoints
- `src/app/core/services/game-service.ts` — solved/unsolved station tracking
- `src/app/core/services/location-service.ts` — GPS + mock mode
- `src/app/core/services/auth.service.ts` — Firebase Auth + OIDC (Goslar-ID)
- `src/app/core/services/badges.service.ts` — Firestore badge loading/awarding
- `src/app/views/components/overview/` — Leaflet map
- `src/app/views/pages/station/` — station detail + quiz
- `src/app/views/pages/home/` — onboarding flow

## Firebase

- Project: `best-badges-dev`
- Firestore: `users/{uid}/badges`, `badgeTemplates/{badgeId}`
- Auth: email/password + `oidc.goslar_id`

## Commands

- `npm start` — dev server
- `npm run build` — prod build
- `npm test` — Karma tests
- `npm run lint:fix` — ESLint fix
- `npm run format` — Prettier

## Language Convention

- User-facing strings: German
- Code identifiers and comments: English
