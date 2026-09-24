# Add Counter-Strike tracking and clarify Gamer Score

## What will change
- Add a Counter-Strike 2 Steam tracker that accepts a Steam ID64 or vanity profile name and syncs publicly visible playtime through Steam's Web API.
- Keep match K/D, wins, and losses available through the existing match logger; Steam does not expose a reliable official public endpoint for those CS2 totals.
- Add clear sync feedback and make the current combined-stat and Gamer Score formulas visible in the app.
- Keep the Steam Web API key server-side; request it securely after the function is ready.

## Technical details
- Add an authenticated Lovable Cloud Edge Function with strict input validation, bounded rate limiting, and CORS handling.
- Resolve vanity names and fetch owned games for App ID 730; store synced hours without overwriting manually logged match totals.
- Wire the CS2 tracking and Sync All actions to the function; leave other game providers unchanged.
