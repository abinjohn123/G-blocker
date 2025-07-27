# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gaayamma Blocker is a Chrome browser extension that blocks entertainment and social media sites during focused study sessions. It implements a Pomodoro-style timer system with automatic site blocking functionality.

## Architecture

This is a Manifest V3 Chrome extension with a simple vanilla JavaScript architecture:

- **`background.js`** - Service worker that handles site blocking logic, timer management, and tab monitoring
- **`popup.html/js/css`** - Extension popup interface for timer control and status display
- **`manifest.json`** - Extension configuration with permissions for tabs, storage, and specific site access

## Core Functionality

### Site Blocking System
- Blocked sites are hardcoded in `background.js` in the `blockedSites` array (lines 1-9)
- The `isBlockedSite(url)` function handles domain matching with www. prefix removal
- Tab monitoring via `chrome.tabs.onUpdated` and `chrome.tabs.onCreated` listeners
- Blocked tabs are automatically closed during active study sessions

### Timer Management
- Uses `chrome.storage.sync` for persistent state across browser sessions
- Storage keys: `studyMode`, `timerEndTime`, `focusMinutes`
- Timer expiration checked every second via `setInterval` in background script
- Auto-activation when visiting manifoldkerela.com study platform

### UI States
- **Setup Mode**: Timer input and toggle switch visible
- **Active Mode**: Countdown display and status banner, setup hidden
- Input validation prevents activation with empty/invalid timer values

## Development

### No Build Process
This extension uses vanilla JavaScript with no build tools, bundlers, or package managers. Changes can be tested directly by:
1. Loading the extension in Chrome developer mode
2. Refreshing the extension after code changes
3. Testing functionality manually in browser

### Adding Blocked Sites
To add new sites to the blocklist, you must update THREE locations:

1. **`background.js`** - Add domain to the `blockedSites` array (lines 1-9) for blocking logic
2. **`manifest.json`** - Add `"https://*.domain.com/*"` to `host_permissions` array for extension permissions
3. **`popup.html`** - Add display name to the blocked sites list (around line 42-49) for UI

The domain matching automatically handles www. prefixes.

### Storage Architecture
The extension uses Chrome's sync storage API for cross-device persistence:
- All timer state survives browser restarts
- Changes to storage immediately sync across Chrome instances
- Storage is cleared when timer expires or is manually stopped

### Commit Message Convention
Follow the Conventional Commits standard for all commit messages:

**Format:**
```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes  
- `refactor`: Code restructuring without changing behavior
- `style`: Code formatting changes
- `test`: Test-related changes
- `docs`: Documentation updates
- `build`: Build system or dependency changes
- `chore`: Miscellaneous tasks

**Guidelines:**
- Use imperative, present tense ("add" not "added" or "adds")
- Do not capitalize first letter of description
- Do not end description with a period
- Use `!` after type/scope for breaking changes
- Keep description under 50 characters when possible

**Examples:**
- `feat: add myntra.com to blocklist`
- `fix: prevent timer activation with empty input`
- `docs: update blocklist instructions in CLAUDE.md`
- `refactor(popup): simplify timer display logic`

### Key Code Patterns
- URL validation and hostname extraction in `isBlockedSite()`
- Message passing between popup and background script for state updates
- Dynamic UI state management in popup.js with show/hide logic
- Real-time countdown updates using setInterval with proper cleanup