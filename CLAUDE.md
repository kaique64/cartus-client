# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:8080
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
npx vitest run src/features/insight/api.test.ts  # Single test file
```

**Environment:** create `.env` with `VITE_BFF_URL=http://localhost:3000/api/v1` (defaults to that if unset).

## Architecture

**Feature-sliced layout** — business logic lives under `src/features/<name>/` with consistent sub-folders: `api.ts`, `types.ts`, `hooks/`, `components/`, `schemas/`. Shared UI primitives are in `src/components/ui/` (shadcn/ui subset).

### Features

| Feature | Responsibility |
|---|---|
| `search` | Municipality autocomplete — fetches the full IBGE list once (cached forever), filters client-side |
| `municipality` | URL param parsing via Zod (`useMunicipalityParams`) — `/mapa?name=&ibge=&lat=&lon=&bbox=` |
| `insight` | SSE streaming — `useInsightStream` orchestrates `POST /insights/request` → `EventSource /insights/stream?job_id=` |
| `poi` | Points of interest — `usePois` fetches after `pois_imported` SSE event confirms availability |

### Data flow on `/mapa`

1. `useMunicipalityParams` parses URL search params via Zod and returns a `Result<T, E>`.
2. `useInsightStream(cityName)` POSTs to BFF, gets `job_id`, opens SSE, and advances through statuses: `idle → requesting → streaming → partial → complete` (or `error`).
3. On `processed_data` SSE event: demographic panel populates; mesh GeoJSON is fetched via TanStack Query (1h stale time, keyed by `["municipality-mesh", id]`).
4. On `pois_imported` SSE event: `usePois(ibgeCode)` fires to fetch POI markers.
5. On `generated_insight` SSE event: AI analysis panel completes and SSE closes.

### Key patterns

- **`Result<T, E>`** (`src/types/result.ts`) — used instead of throwing for expected failure paths. `useMunicipalityParams` returns `Result`; callers check `.ok` before use.
- **Leaflet is imperative** — `useLeafletMap` follows an init-once pattern; `react-leaflet` is not used. Boundary layer and POI markers are managed via separate hooks (`useBoundaryLayer`, `usePoiMarkers`).
- **SSE lifecycle** — `useInsightStream` uses `refs` (not state) for the cleanup function and timeout, avoiding stale-closure issues. It closes the stream automatically once all three event types are received.
- **`@` path alias** maps to `src/` — use it everywhere instead of relative paths.
- **shadcn/ui subset**: only `button`, `collapsible`, `resizable`, and `tooltip` are installed; do not assume other Radix components are available.
