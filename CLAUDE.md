# Spiritual Skills — Claude Code Memory Architecture

## Project Overview

**Spiritual Skills** is a vanilla JavaScript Progressive Web App (PWA) for tracking daily spiritual practices: meditation, affirmations, quotes/contemplations, and skill cultivation with streak tracking.

## Architecture

```
index.html     — Minimal shell, loads db.js then app.js
db.js          — IndexedDB storage layer (7 object stores, CRUD helpers, date utils)
app.js         — UI rendering engine, routing, event handling, settings, export/import
style.css      — Complete CSS design system (indigo + gold theme)
sw.js          — Service Worker for offline caching
manifest.json  — PWA manifest (standalone, portrait, deep indigo theme)
icons/         — App icons (192px, 512px)
```

## Data Stores (IndexedDB: SpiritualSkillsDB)

| Store | Key Pattern | Purpose |
|-------|-----------|---------|
| meditations | `{date}-{session}` | Morning/evening meditation logs |
| skills | `{id}` | Skill definitions |
| skillCheckins | `{date}-{skillId}` | Daily skill practice tracking |
| quotes | `q-{timestamp}` | Quotes/contemplations |
| affirmations | `aff-{timestamp}` | Affirmation definitions |
| affirmationLogs | `{date}-{affirmationId}` | Daily affirmation logs |
| settings | `{key}` | App settings (userName, etc.) |

## Key Patterns

- **Rendering**: Template literal HTML → innerHTML replacement. Full page re-renders on state change.
- **Routing**: `navigate(page, sub, data)` sets globals `currentPage/subPage/subPageData`, then calls `render()`.
- **Event handling**: `attachEventListeners()` binds `[data-action]` and `[data-nav]` attributes after each render.
- **Dates**: Always ISO `YYYY-MM-DD` strings. Parsed via `parseDate()` with validation. `T12:00:00` appended to avoid timezone issues.
- **IDs**: Composite keys like `{date}-{skillId}` for daily records, timestamp-based for definitions.

## DB Migration Strategy

- `DB_VERSION` is incremented for schema changes
- `onupgradeneeded` handler checks `e.oldVersion` and runs migrations sequentially
- Each migration block is guarded by `if (oldVersion < N)`
- Current version: 2

## Validation & Safety

- `escHtml()` for XSS prevention on all user-generated content
- `validateLength()` enforces max character limits per field type
- `maxlength` HTML attributes on all text inputs
- `_actionInProgress` flag prevents double-submit on mutating actions
- `showToast()` for user-facing error/success feedback
- `try/catch` wrapping on `render()` and `handleAction()`

## Settings

- User name: stored in settings store under key `userName`
- Data export: full JSON backup of all 7 stores
- Data import: validates backup structure before overwriting

## Development Notes

- No build step — edit files directly
- No external dependencies — all vanilla
- Service Worker caches all assets — bump `CACHE_NAME` in sw.js after changes
- DOM selectors `app()` and `nav()` are lazily cached
- Mobile-first design with iOS safe area support
