# TannenTails Roadmap

Agreed restructuring and feature plan (2026-11-09). Each phase lands as its own PR.
Phase 2 is pure file moves so that logic changes in later phases stay reviewable.

| #   | Phase                                     | Status |
| --- | ----------------------------------------- | ------ |
| 0   | Security                                  | ☐      |
| 1   | Cleanup & bug fixes                       | ✅     |
| 2   | Restructure (moves only)                  | ☐      |
| 3   | Models, state, content repository seam    | ☐      |
| 4   | Tooling & baseline tests                  | ☐      |
| 5   | Design system                             | ☐      |
| 6   | Map experience                            | ☐      |
| 7   | Content server & admin app (Node/Docker)  | ☐      |
| 8   | Docs                                      | ☐      |

---

## 0. Security

- [ ] Rotate the SFTP password in `sync_config.jsonc`; replace the manual SFTP upload with the buddy.works pipeline (credentials stored there, not in the repo folder).
- [ ] Revoke/restrict the Google Maps key leaked in git history (commit `5a413f1`); remove `googleMapsApiKey` from environments.
- [x] Remove `console.log('Environment:', environment)` from `src/main.ts`.

## 1. Cleanup & bug fixes

- [x] Remove unused deps: `@angular/google-maps`, `leaflet-gpx`, `leaflet-providers`, `@types/leaflet-providers`.
- [x] Remove dead code: `GameService.writeStateToFirestore`, `track-points.json`, unused imports in models/dataset.
- [x] `StationPage`: single position stream (currently starts two watchers), no mutation of shared `StationData`, not-found handling for unknown ids.
- [x] `LocationService`: watchers are never cleared — implement proper start/stop for browser and Capacitor.
- [x] `OverviewComponent`: add teardown (`takeUntilDestroyed`), stop recreating the map by DOM id. (Marker diffing moved to Phase 6.)
- [x] `GameService` must not hard-depend on `Firestore` (app crashes when Firebase is disabled).
- [x] Fix `solveRandomStation` (index used as id; ids are `'1'`–`'11'`).
- [x] Fix `.gitignore` vs tracked `memory/MEMORY.md`.

## 2. Restructure

Target layout (app part; see Phase 7 for the workspace layout):

```
src/app/
  app.config.ts          # providers out of main.ts
  app.routes.ts
  core/                  # singletons, no UI: location, game-progress, auth, badges, notification, logger, config tokens
  data/                  # bundled trail snapshot (fallback content)
  models/                # interfaces + discriminated unions
  features/
    onboarding/          # home.page
    map/                 # map.page, trail-map component, leaflet helpers
    station/             # station.page, question-card, stars-animation
    progress/            # progress modal + service
  shared/
    ui/                  # notification, notification-container, station-bar, design-system primitives
    utils/geo.ts         # bearing, offset, compass (deduplicated)
scripts/gpx-to-ts.js
```

- [ ] Path aliases `@core/*`, `@data/*`, `@models/*`, `@features/*`, `@shared/*`, `@env/*`.
- [ ] Fix `notfication/` typo; map page becomes a real page.
- [ ] Ionic imports from `@ionic/angular/standalone`; icons registered in one place.
- [ ] One source of truth for route data (currently `PathData`, `path.json`, `path.gpx`, `track-points.json`).

## 3. Models, state, content repository seam

- [ ] Models as interfaces; `Question` as discriminated union (no placeholder defaults).
- [ ] Signals for `GameService` / `LocationService` state; consistent naming.
- [ ] `TrailRepository` interface with `BundledTrailRepository` (later `HttpTrailRepository`, Phase 7).
- [ ] Firebase (badges) optional via injection token / provider factory — `AuthService` and `BadgeService` (progress modal) still inject Firebase unconditionally.

## 4. Tooling & baseline tests

- [ ] Flat ESLint config: `no-console`, `no-explicit-any`, unused imports, import boundaries (features never import other features).
- [ ] lint-staged runs on staged files only (pre-commit currently lints the whole project).
- [ ] CI: Node 22, fix `dist/` vs `www/` path in bundle analysis, cache Android step, coverage threshold, current action versions.
- [ ] Real specs: `GameService` persistence & solving, `LocationService` mock mode & watcher cleanup, geo utils, station quiz flow.

## 5. Design system

Existing tokens (spacing, type, radius, shadow) are barely used; ~5.5k lines of SCSS, 50+ hard-coded colors, `Kalam` font referenced but never loaded.

- [ ] Two-layer tokens: primitives (forest green, gold, bark, cream) → semantic (`--tt-surface`, `--tt-surface-glass`, `--tt-text-muted`, `--tt-accent`, `--tt-state-*`); Ionic colors mapped onto semantic tokens.
- [ ] Self-hosted fonts (offline use on the trail): one handwritten accent, one readable sans.
- [ ] `src/theme/` partials: mixins (glass, card, focus ring, safe area) and global Ionic overrides.
- [ ] Small primitives in `shared/ui`: card, section header, status badge, empty state.
- [ ] Stylelint: no raw colors outside `theme/`; contrast and ≥44px touch-target checks.
- [ ] Dev-only `/styleguide` route showing tokens and components.

## 6. Map experience

- [ ] Bottom sheet (breakpoint `ion-modal`) with station preview: image, title, distance, state, "Navigieren" / "Details". Navigation only starts on request.
- [ ] Station carousel synced with the map.
- [ ] Numbered `divIcon` markers with open / active / solved states and solve animation.
- [ ] Progress on the route (walked segments colored, shortcuts distinct).
- [ ] Three-state locate button: center → follow → follow + compass rotation; GPS accuracy feedback.
- [ ] Elevation profile from existing altitude data.
- [ ] Offline indicator and visible tile-prefetch progress.
- [ ] `TrailMapComponent` with declarative inputs/outputs; Leaflet code in small helpers.
- Later option: MapLibre GL + self-hosted PMTiles if Leaflet remains limiting.

## 7. Content server & admin app

Station content moves to an own server (Node.js in Docker). Firebase remains only for player badges.

### Workspace

```
apps/app/               # Ionic app
apps/admin/             # Angular admin app (never in the mobile bundle)
server/                 # Node 22 + Hono + SQLite (Drizzle)
packages/trail-schema/  # zod schemas + types shared by app, admin, server
```

### API

Public (read-only):

- `GET /api/v1/trails/:id` — latest **published** version as one JSON snapshot, `ETag` / `304`.
- `GET /media/:hash.webp` — content-hashed images, immutable cache headers.

Admin (`/api/v1/admin/*`, authenticated):

- CRUD and reorder for draft stations / questions.
- Image upload: mime sniffing, re-encode to WebP (`sharp`), strip EXIF/GPS, ~5 MB limit.
- `POST /publish` → immutable new version; `POST /rollback/:version`.
- `GET /audit` — who changed what, when.

App: `HttpTrailRepository` caches the last version on the device; falls back to the bundled snapshot when offline or the server is unreachable.

### Security

- Admin login via Goslar-ID OIDC (authorization code + PKCE, server-side); session cookie `HttpOnly; Secure; SameSite=Strict`; admin allowlist. Fallback: local accounts with Argon2 + TOTP.
- Admin app served same-origin at `/admin` (no CORS); `Origin` check on mutating requests.
- zod validation on every write: coordinates inside the Goslar bounding box, radius 10–100 m, text length limits, valid correct-answer index.
- Rate limiting on login and upload; security headers incl. strict CSP; public API is GET-only.
- Migrations via drizzle-kit in the repo.

### Deployment & operations

Two independently deployed parts:

1. **Backend container** (API + `/admin` + `/media`)
   - Small multi-stage `Dockerfile` (Node 22 slim/alpine, non-root user, only production deps).
   - Runs on the same host on its own local port (e.g. `127.0.0.1:8080`); the host's existing proxy forwards a path or subdomain (e.g. `api.wald.goslar.app`) to it and terminates TLS.
   - `docker-compose.yml`: one service, named volumes for the SQLite DB and media, `restart: unless-stopped`, `/healthz` healthcheck, memory limit.
   - Admin app stays inside the container so admin login cookies remain same-origin.
   - Continuous SQLite backup (Litestream to S3-compatible storage) plus nightly snapshot with rotation.
   - CI builds and pushes the image to GHCR; the host pulls and restarts (`docker compose pull && docker compose up -d`).
2. **Web app** (Ionic/Angular build)
   - Built in CI, deployed separately via buddy.works to the existing web root.
   - API base URL injected per environment at build time.
   - Because app and API live on different origins, the public read-only API allows CORS `GET` for the web app origin and the Capacitor origins (`capacitor://localhost`, `https://localhost`). Admin routes allow no cross-origin access.

### Admin app

- Map with draggable stations, trigger radius and distance to the route.
- Question editor with live preview (same quiz card as the app).
- Image upload with crop.
- Draft vs. published view, "Veröffentlichen", version history. Built on the Phase 5 design system.

### Migration

- One-off script imports current `dataset.ts` and station images as **version 1**.
- The bundled snapshot in the app is regenerated from the server on each release.

### Tests

- API integration tests (Vitest, temporary DB).
- Auth tests: every admin route rejects unauthenticated requests.
- Contract test: public payload validates against `trail-schema`.

## 8. Docs

- [ ] One README (setup, architecture, contributing); details in `docs/`.
- [ ] Merge/remove the loose root `*.md` files.
- [ ] Committed `CLAUDE.md` with conventions (currently git-ignored).
