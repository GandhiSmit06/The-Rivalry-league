# The Rivalry League — Frontend Design Brief

Hand this whole file to another AI/designer. It describes every screen, component, state, interaction and the current visual language, so the UI can be redesigned without reading the code.

## 1. Product in one paragraph
A **live cricket player auction** for a friends/college tournament. One person (the **Auctioneer**, protected by a 4+ digit PIN) runs the show on a laptop/projector: a wheel randomly draws a player, franchises (teams) bid in increments, the auctioneer "hammers" the player to a team at a price, or marks them **Unsold**. Unsold players get a **re-auction round** automatically. Afterwards the app shows rosters/results, a match **schedule** (round-robin generator) and a 3D **coin-toss** simulator. Single page app, 6 "pages" switched by state (no URL routing), dark "stadium at night" theme with gold accent. Mobile-first usable (bottom tab bar).

Stack: Next.js 16 (App Router), React 19, Tailwind v4 imported but almost all styling is hand-written in `app/globals.css` (~2,650 lines, plain class names), lucide-react icons, Google fonts (Bebas Neue display, DM Sans body, JetBrains Mono numbers). All state lives in `app/page.tsx` and is passed down as props; data is fetched from `/api/*`, and the page polls every 4s.

## 2. Domain data (what the UI shows)
- **League**: name ("The Rivalry League"), season ("01".."07"), defaultPurse (₹20,000), maxSquadSize (3–11, default 5).
- **Team** (franchise): name, short code (2–3 letters), color (hex), owner, tagline, purse (remaining ₹), spent, players (count).
- **Player**: sequential `number` (#1, #2…), name, base price (default ₹500), status `Upcoming | Sold | Unsold`, soldTo (team name), soldPrice, initials.
- **Match**: matchNumber, stage, teamA, teamB, date, time, venue, status `Scheduled | Toss Done | Live | Completed`, tossWinner, tossDecision (`Bat|Bowl`), result.
- **Auction state**: current player, current top bid, leading team.
- Currency is Indian rupees `₹`, formatted with `toLocaleString()`.

## 3. Design tokens (current)
Colors: bg `#070b14`, elevated `#0d1424`, panel `#111a2d`, panel-hover `#16223b`, card `#0f182a`, line `#1e2c45`, line-strong `#2a3d60`, muted `#8292ab`, text `#f8fafc`, **gold `#ffc83d`** (primary accent, glow `rgba(255,200,61,.25)`), red `#ef4444` (live/unsold/locked), cyan `#06b6d4`, green `#22c55e` (unlocked/sold/success), purple `#a855f7`. Team colors are user-chosen hexes.
Radii 6/10/14px. Typography: Bebas Neue for big headings (clamp 38–56px page titles, up to 120px hero), DM Sans UI, JetBrains Mono for ₹ amounts. Small uppercase letter-spaced "kicker" labels (10px, gold, 2px tracking) above every heading. Background: fixed animated SVG cricket stadium (floodlight beams swaying, floating embers, hawk-eye dashed arcs, rotating ball seam, bail blink). Gradient gold primary buttons with glow; ghost buttons = dark panel + 1px border; icon buttons 36px square.
Reusable class vocabulary: `.primary-btn`, `.ghost-btn`, `.text-btn`, `.icon-btn`, `.chip-btn`, `.section-kicker`, `.page-heading`, `.live-dot` (pulsing red), `.toast`, `.modal-backdrop/.modal/.setup-modal`, `.card-label`, `.status upcoming|sold|unsold`.

## 4. App shell
- **Topbar** (sticky, 72px, blurred): animated logo + league name + "SEASON · 01" (click → Home); centered pill nav with icons (Home, Auction, Teams, Players, Schedule, Results); right controls: Season dropdown (S01–S07), Squad-limit dropdown (3–11/team), **Auctioneer lock pill** (green "AUCTIONEER" unlocked / red "LOCKED"; clicking when locked opens PIN modal, clicking when unlocked locks), mute toggle, settings (league setup modal).
- **Mobile**: nav becomes a fixed **bottom tab bar** with the same 6 items; auction page gets a 3-way switcher (Stage / Bids & Teams / Pool).
- **Toast**: single bottom message, auto-dismiss ~3s, used for every action result.
- Every mutating action is gated: if locked, the PIN modal opens and the toast says "Auctioneer authorization required".
- Sound effects (WebAudio, synthesized): hammer, spinner tick, cheer (on sale/toss), coin flip; mute toggle in topbar.

## 5. Pages

### 5.1 Home
Hero with big logo, live-dot eyebrow "THE RIVALRY LEAGUE · AUCTIONEER COMMAND" + season pill, giant title "THE RIVALRY LEAGUE / DREAM XI DRAFT." (second line gold), short copy, two CTAs (**Enter Auction Room**, **Tournament Schedule & Toss**), decorative concentric orbit rings, and a stat row: franchises, players in pool, fixtures, squad limit, default purse. Below: 4 feature cards (₹500 base price, select squad size, hammer down, match toss) and a "Your room. Your tournament." section with two quick-link tiles (Schedules & Toss, Franchise Roster & Budgets).

### 5.2 Auction (the core screen — highest priority to get right)
Header: kicker "AUCTIONEER ARENA · BASE PRICE ₹500", title "The *Gavel* is in your hands.", right side: **Direct Sell / Assign** button, squad-limit select, LIVE ROOM indicator, keyboard-shortcut hint (S spin · 1-9 bid · Enter sell · U unsold), and an "Unlock Auctioneer Controls" button when locked.
Three-column layout (stacked tabs on mobile):
1. **Player Pool (left)**: header "PLAYER POOL — N UPCOMING" (turns red "RE-AUCTION POOL — N UNSOLD" in round 2, with a "Reset all unsold to upcoming" button). Search by name or #number. Scrollable list of player rows: `#num` badge, name, ₹base, and two buttons: **Nominate** (put on block) and **⚡ Sell** (direct sell modal). Selected player highlighted gold. Empty states with "Add Player" button.
2. **Stage (center)**: status chip ("N REMAINING" / "🔥 RE-AUCTION"), round-2 banner, the **tournament wheel**: SVG pie with one wedge per remaining player labelled `#number` (8 dark jewel-tone wedges cycling; red/violet in re-auction), gold bezel rim with 24 brass studs, center hub that doubles as the spin button (states: SPIN (N) / DRAWING… / DRAWN #n / ALL SOLD / RE-SPIN), fixed pointer needle on top. Spin = ~2.8s ease-out rotation of 5–7 turns, then the server picks randomly. Below it: **Player spotlight card** (avatar with #number, "ACTIVE NOMINATION"/"RE-AUCTION NOMINATION", big name, base-price badge) or an empty-state message (no players / completed / re-auction / prompt). Full-width **SPIN THE WHEEL** button (red/orange gradient in re-auction).
3. **Live Bidding (right)**: "CURRENT TOP BID" large ₹ amount + "Leader: TEAM (SHORT)" in the team's color. List of **bid rows**, one per team: color dot, "SHORT (Name)", "₹purse left · players/limit [FULL]", and a button "BID +₹100/250/500" (increment grows with price; disabled if no player, can't afford, or squad full). Below, the **Auctioneer Decision Desk** (only when a player is on the block): "Selling: #n Name", team select (full teams disabled), price number input, quick chips +₹100/+₹250/+₹500/+₹1000, big green **Sell to TEAM (₹price)** and red **Unsold** buttons.
Bottom: **team budget strip** — one chip per franchise (logo square in team color with short code, name, ₹purse · players/limit, "Purse" button → adjust-budget modal).

### 5.3 Teams
Heading "The …" with "Add Franchise". Grid of **team cards**: color monogram logo, name, owner/tagline, purse left & total spent, squad progress bar (players/limit), mini roster of players (empty slots shown), buttons: adjust budget, delete (confirm). Empty state "No Franchises Registered".

### 5.4 Players
Heading "Player *Directory.*"; buttons: Direct Sell / Assign, Bulk Import, Add Player. Search box ("Search players or #number…") + filter chips ALL / UPCOMING / SOLD / UNSOLD. Grid of **player cards**: number pill, avatar initials, name, status chip, BASE PRICE, SOLD TO + sold price; card actions by status — Nominate (Upcoming), ⚡ Sell, Re-auction (↺ for Sold/Unsold), delete (trash). Empty state "No Players Registered".

### 5.5 Schedule
Heading "Match *Schedule*"; buttons: Quick Toss, Generate Round-Robin, Add Match. Filter chips by status. Grid of **match cards**: "MATCH n · STAGE", big Bebas team names with VS, date/time/venue, status chip, toss result ("X won toss, chose to Bat/Bowl"), buttons: Toss, delete. Empty state "No Matches Scheduled Yet".

### 5.6 Results
Heading "Tournament …". Stat grid, a gold **marquee card** for the most expensive buy ("RECORD BID", trophy, price tag; fallback "Awaiting the first hammer strike"). **Confirmed Squads** section: roster card per franchise (monogram, name, owner, count badge, list of players with #number/price, spent progress bar, footer totals). **Unsold Players Pool**: cards with UNSOLD badge. "Reset auction" button (confirm dialog) restores all purses/players.

## 6. Modals (all share `.modal-backdrop` + header with kicker, Bebas title with gold word, X icon button, Cancel/primary footer)
Auctioneer PIN (password-style 4+ digit input, error line) · League Setup (name, season, default purse, squad size, change PIN: current + new) · Add Team (name, short, owner, color picker, purse, tagline) · Adjust Budget (mode set/add/subtract + amount) · Add Player (name, base price; shows next #number) · Bulk Import (textarea, one name per line or "Name, BasePrice") · Direct Sell (player select, team select with full teams disabled, price + chips ₹500/1,000/2,500/5,000/+100) · Add Match (team 1, team 2, date, time, venue, stage) · Coin Toss (3D coin flip animation, pick caller team, Bat/Bowl decision, result saved to match).

## 7. States the redesign must cover
Locked vs unlocked (all admin buttons visible but gated); empty (no teams / players / matches); squad full; insufficient purse; spinning; re-auction round; auction completed (all sold); loading (initial fetch has no skeleton today — add one); error toasts; mobile (≤480px), tablet (≤820/1080px), desktop (max content width 1400px).

## 8. Known UX weaknesses / redesign opportunities
- Heavy inline styles in AuctionView; inconsistent button sizing; many tiny (9–11px) labels.
- No URL routing (refresh returns to Home); no loading skeletons; native `confirm()` dialogs for destructive actions.
- Bid buttons only add fixed increments — no custom bid entry beside the team row.
- Auction page is dense; on projector use the hierarchy should be: current player + current bid + leader (huge) > wheel > everything else.
- No undo for a wrong sale; no spectator (read-only) view distinct from locked mode.
- Auctioneer mode defaults to unlocked on load.

## 9. Constraints for any new design
Keep the data/handler props and API untouched (components receive plain props; handlers are `onXxx` callbacks). Keep dark theme + gold accent identity unless intentionally rebranding. Must stay responsive with a bottom tab bar on phones. Keep the keyboard shortcuts (S, 1-9, Enter, U) on the Auction page.
