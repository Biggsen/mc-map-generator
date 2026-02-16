# Overworld Dual View (Terrain + Biome) - Task Spec

## Overview

When `dimension === "overworld"`, the service will capture two map screenshots: terrain view (existing) and biome view. The biome view is obtained by toggling "Terrain estimation" off in mcseedmap.net's Map Settings, producing a biome-only visualization. Both images are processed identically and returned as `terrainUrl` and `biomeUrl`.

**Spec Reference:** See Overworld Dual View (Terrain + Biome) in the service spec.

## Tasks

### 1. Add `switchToBiomeView` helper in screenshot.js
- [x] Create `switchToBiomeView(page, jobId)` function
- [x] Click Map Settings tab: `button[title="Map settings"]`
- [x] Wait for panel to load (~2s)
- [x] Find and click label containing "Terrain estimation" (toggles terrain off)
- [x] Wrap in try/catch, log warnings if selectors fail (non-fatal)
- [x] Export or keep private as needed

### 2. Extend `generateMap` for overworld dual capture
- [x] After first screenshot is captured and processed (terrain view), check `dimension === 'overworld'`
- [x] If overworld: toggle sidebar (re-open), call `switchToBiomeView(page, jobId)`
- [x] Wait for map refresh (~10s)
- [x] Take second full-page screenshot
- [x] Process with same `processImage()` call (crop/resize)
- [x] Save with `-biome-` in filename: `seed-{seed}-overworld-{size}k-biome-{timestamp}.png`
- [x] Build `biomeUrl` via `getImageUrl()`

### 3. Update return shape in `generateMap`
- [x] Rename `imageUrl` → `terrainUrl` in success return (all dimensions)
- [x] Keep `filename` for terrain, add `biomeFilename` when overworld
- [x] For overworld: add `biomeUrl` and `biomeFilename` to return object
- [x] Ensure metadata remains consistent (single `fileSize`, `dimensions` apply to both)

### 4. Update server.js status response
- [x] When job is ready, include `terrainUrl` in status response
- [x] For overworld jobs: also include `biomeUrl` in status response
- [x] Add `imageUrl` as alias for `terrainUrl` for backward compatibility

### 5. Update documentation
- [x] Update `docs/API.md` with overworld response example (`terrainUrl`, `biomeUrl`)
- [x] Update nether/end response example (`terrainUrl` only)
- [x] Update Image Generation Process section with biome workflow steps
- [x] Update usage examples (JS/Python) to reference `terrainUrl` and `biomeUrl`
- [x] Update spec/task files if they reference `imageUrl`

### 6. Verify behavior
- [x] Manually test overworld request returns both URLs
- [x] Manually test nether/end request returns `terrainUrl` only
- [x] Confirm both images are correctly cropped and accessible via URLs
- [x] Confirm failure in `switchToBiomeView` does not break terrain capture (graceful degradation)

## Success Criteria

- [x] Overworld requests return `terrainUrl` and `biomeUrl` in status response
- [x] Nether/End requests return `terrainUrl` only
- [x] Both images use identical processing (crop, resize)
- [x] Biome view shows biome-only map (Terrain estimation off)
- [x] Documentation reflects new response shape

## UI Selectors (mcseedmap.net)

| Element            | Selector / Strategy                                                                 |
|-------------------|--------------------------------------------------------------------------------------|
| Map Settings tab  | `button[title="Map settings"]`                                                        |
| Terrain estimation| Label containing "Terrain estimation" — find via text, click to toggle (Mantine Switch) |

## Notes

- **Timing:** Biome capture adds ~12–15s (2s panel + 10s map refresh). Total overworld time ~40–75s (verified).
- **Error handling:** If Map Settings or Terrain toggle fails, log warning and return terrain-only. Do not fail entire job.
- **Backward compatibility:** `imageUrl` included as alias for `terrainUrl` in status response.
- **Debug mode:** If `debug` is true, only the terrain original is saved today; biome debug could be added later if needed.

---

## Status: Complete (2026-02-16)

Implemented and verified. Overworld requests return `terrainUrl` and `biomeUrl`; nether/end return `terrainUrl` only.
