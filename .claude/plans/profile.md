# Plan: Custom Profile Selector

## Summary

Add an **optional** profile selector to the search screen that sends `profile_id` to the BFF's `POST /insights/request`. The field is optional — users can search a city without selecting any profile, in which case `profile_id` is omitted from the POST body entirely (matching `@IsOptional()` in the BFF DTO). The only current profile is `real_estate_agent` ("Corretor de imóveis"), but the implementation should be list-driven so adding more profiles requires no structural changes.

The `profile_id` must travel through the full chain:
`SearchScreen` → `SearchResult` (type) → URL query param → `MapPage` → `useInsightStream` → `requestInsight` (POST body)

---

## Steps

### 1. Define profiles constant — `src/types/profile.ts` (new file)

```ts
export interface AnalysisProfile {
  id: string;
  label: string;
}

export const ANALYSIS_PROFILES: AnalysisProfile[] = [
  { id: "real_estate_agent", label: "Corretor de imóveis" },
];
```

No `DEFAULT_PROFILE_ID` — the absence of a selection is a valid state. Adding a new profile is just a new list entry.

---

### 2. Extend `SearchResult` — `src/pages/Index.tsx`

Add `profileId?: string` (optional) to the `SearchResult` interface.

```ts
export interface SearchResult {
  name: string;
  ibgeCode: number;
  center: [number, number];
  bbox?: [number, number, number, number];
  profileId?: string;   // ← new, optional
}
```

---

### 3. Serialize `profileId` into URL — `src/pages/Index.tsx`

In `handleSearch`, only set the `profile` param when it is not empty:

```ts
if (result.profileId) params.set("profile", result.profileId);
```

---

### 4. Add profile selector to `SearchScreen` — `src/components/SearchScreen.tsx`

- Import `ANALYSIS_PROFILES` and the shadcn `Select` components.
- Add `useState<string>("")` for the selected profile (empty string = no selection).
- Render a `Select` below the search input with a placeholder "Nenhum perfil selecionado" and a "Perfil de análise" label. Include a "Nenhum" option that clears the selection back to `""`.
- Pass `profileId: selectedProfile || undefined` in the `onSearch` call inside `handleSelect`.

UI placement: below the search input, above the subtitle line.

---

### 5. Read `profile` from URL — `src/pages/MapPage.tsx`

```ts
const profile = searchParams.get("profile") ?? undefined;
```

Pass `profile` to `useInsightStream`. When the param is absent, `undefined` propagates naturally through the chain.

---

### 6. Thread `profileId` through the hook — `src/hooks/use-insight-stream.ts`

Change the hook signature to `useInsightStream(cityName, profileId?: string)`. Pass it to `requestInsight`.

---

### 7. Forward to API — `src/services/api.ts`

Change `requestInsight(cityName)` to `requestInsight(cityName, profileId?: string)`. Only include `profile_id` in the POST body when it has a value:

```ts
body: JSON.stringify({ name: cityName, ...(profileId ? { profile_id: profileId } : {}) }),
```

This ensures the BFF receives a clean payload with no `profile_id` key at all when unset, rather than `profile_id: undefined`.

---

## Files touched

| File | Change |
|---|---|
| `src/types/profile.ts` | **new** — profiles constant |
| `src/pages/Index.tsx` | add `profileId` to `SearchResult` interface + URL param |
| `src/components/SearchScreen.tsx` | add Select UI + state |
| `src/pages/MapPage.tsx` | read `profile` param, pass to hook |
| `src/hooks/use-insight-stream.ts` | accept + forward `profileId` |
| `src/services/api.ts` | add `profile_id` to POST body |

No new tests are strictly required for the `profile_id` plumbing (it's a pass-through of a plain string), but the `requestInsight` test in `api.test.ts` should be updated if one exists for that function. Currently `api.test.ts` only tests `connectInsightStream`, so no test changes are needed.
