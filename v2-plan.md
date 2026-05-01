# quit.social v2 plan

## goals

- Keep the app 100% static and client-side, deployable to GitHub Pages (or similar HTTPS static host).
- Keep privacy strict: no analytics, no server storage, no tracking.
- Expand app selection:
  - keep built-in presets for popular apps
  - add custom app creation with PNG icon upload + fake app name
  - add app discovery via iTunes Search API (US storefront)
- Refresh design toward a minimal, calming, light palette with leafy green accents.
- Preserve core behavior: opening the fake app should provide a gentle “bump” that interrupts habitual opening.

## non-goals

- No backend, no auth, no user accounts.
- No cross-device sync.
- No non-US app-store support in v2.
- No icon formats beyond PNG for custom upload in v2.

## platform compatibility contract

This section defines what v2 must support on mobile home-screen install and what limitations are accepted.

### guaranteed in scope

- Works as a static HTTPS site with a valid web app manifest and service worker.
- Supports install/use via:
  - iOS Safari **Add to Home Screen** (manual share-sheet flow)
  - Android Chrome install/add-to-home-screen flow
- Launches from home screen into a standalone app-like experience where supported.
- Delivers the habit-interruption bump screen reliably after launch.
- Works offline for core fake-app resources after first successful load.

### accepted platform limitations

- iOS install UX is manual and less feature-complete than Android.
- Browser/platform differences in standalone window behavior and PWA APIs are expected.
- Some advanced PWA capabilities are intentionally out of scope for v2 if they reduce cross-platform reliability.

### implementation guardrails

- Build for the intersection of iOS Safari and Android Chrome capabilities first.
- Avoid relying on install prompts or APIs that are inconsistent across platforms.
- Keep install instructions explicit and platform-specific in UI copy.
- Keep all state local (`localStorage` and optional URL fragment only).

### validation gates before full buildout

- Early device verification in Phase 0/1 for:
  - iOS Safari add-to-home-screen + launch behavior
  - Android Chrome install + launch behavior
  - offline reopen behavior on both
- If either platform fails baseline install/launch reliability, pause and adjust architecture before continuing phases.

## product behavior

### setup paths

1. **preset path**: choose one of the built-in app templates.
2. **search path**: search iTunes API, pick an app, and auto-fill icon/name.
3. **custom path**: upload PNG + enter fake app name manually.

Each path ends in the same output flow: generate/install a home-screen shortcut PWA and show concise install steps for iOS/Android.

### bump interaction (habit interruption)

Keep current function, but polish tone:

- soft microcopy (supportive, not scolding)
- optional rotating short prompts
- subtle visual feedback/animation only (no aggressive flashes)
- fast load and offline-safe behavior

## architecture and technical approach

### static-only constraints

- Host as static files only.
- All logic in browser JS.
- No tracking scripts, no third-party analytics pixels, no remote logging.

### data model

Use a normalized object for selected app config:

- `source`: `"preset" | "itunes" | "custom"`
- `displayName`: fake app name shown to user
- `iconDataUrl`: PNG as data URL (for uploaded icon) or fetched URL converted/cached locally when needed
- `manifestFields`: name/short_name/icons/start_url/theme colors
- `bumpConfig`: optional copy variant choice

### persistence

Primary persistence: `localStorage`.

- Save recently used app configs and current draft.
- Keep a lightweight history of generated shortcuts (local only).
- Never transmit stored data anywhere.

Optional shareability mode:

- Encode config into URL fragment for portable links (fragment preferred over query).
- Use compact encoding and guard against oversize URLs.
- If too large (e.g., big icon), fall back to local-only with clear UI message.

### iTunes search integration (US)

- Endpoint: iTunes Search API from browser.
- Scope v2:
  - US storefront only
  - app results only
  - simple search by term
- UX:
  - debounced input
  - loading, empty, and error states
  - tap-to-select result to populate config

Technical notes:

- Verify CORS behavior in-browser; if blocked for a field/path, adjust request pattern while staying backend-free.
- Cache recent successful search results in-memory/session for snappy UX.

### icon handling

- Accept PNG uploads only.
- Validate:
  - mime type `image/png`
  - max file size limit (proposed: 1 MB)
  - minimum dimensions (proposed: 180x180)
- Normalize to square canvas for PWA icon usage.
- Store normalized icon as data URL for local persistence.

## ui/ux direction (light + calming)

### visual language

- Light neutral background (warm off-white).
- Leafy green as primary accent, with muted supporting tones.
- High readability and soft contrast (still accessible).
- Minimal surfaces, subtle borders/shadows, generous whitespace.

### typography and layout

- Single-column mobile-first layout.
- Clear, short sections: choose app -> customize -> install.
- Fewer competing CTAs, one primary action per step.
- Keep copy concise and reassuring.

### accessibility

- Target WCAG AA contrast.
- Keyboard/focus-visible states.
- Reduced-motion preference respected.
- Alt text and labels for all interactive controls.

## implementation phases

## phase 0: baseline audit

- Document current flow and shared assets.
- Identify reusable pieces vs one-off per-app pages.
- Confirm target browser support assumptions.

## phase 1: unify app config pipeline

- Refactor to one shared config-driven generator path.
- Keep existing preset behavior unchanged.
- Add tests for config-to-output mapping.

## phase 2: custom upload flow

- Build PNG uploader with validation + preview.
- Add fake name input and config persistence.
- Wire into shared generator path.

## phase 3: iTunes search flow

- Build search UI with debounce and selection.
- Map selected app metadata into config.
- Add robust empty/error handling and fallback messaging.

## phase 4: visual redesign

- Introduce updated design tokens (colors, spacing, radii, motion).
- Redo layout/components for minimal calming UI.
- Tune bump screen copy and interaction polish.

## phase 5: hardening and release

- Verify offline/install behavior on iOS and Android.
- Performance pass (icon size, load path, cache behavior).
- Privacy pass to ensure zero telemetry.
- Update README with new capabilities and clear privacy statement.

## testing strategy

- Unit tests for:
  - config normalization
  - icon validation/processing
  - URL fragment encode/decode
- Manual browser tests:
  - iOS Safari add-to-home-screen flow
  - Android Chrome add-to-home-screen flow
  - offline launch behavior
  - iTunes search success/failure states
- Regression checks for existing presets.

## risks and mitigations

- **iTunes API limitations/CORS variance**  
  Mitigation: validate early; keep graceful fallback to presets/custom upload.

- **Large icons causing URL/share issues**  
  Mitigation: cap size, downscale, and default to localStorage when needed.

- **PWA install behavior differences by platform**  
  Mitigation: platform-specific instructions and manual verification matrix.

## acceptance criteria for v2

- User can create a fake app using:
  - built-in preset, or
  - iTunes US search result, or
  - uploaded PNG + custom fake name.
- Generated experience remains fully static/client-only and works on free HTTPS static hosting.
- No user tracking/analytics/network logging is added.
- UI is noticeably calmer and lighter while preserving clarity and accessibility.
- Core “habit interruption bump” still works reliably from home-screen launch.
