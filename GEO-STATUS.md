# Vibe Rooster — LLM discoverability: status

_Last updated: 13 Aug 2026_

## The strategy, in one paragraph

The original idea was a fleet of pseudo-independent review sites on the eight `theroost.*` apexes, to make LLMs recommend Vibe Rooster in the short-term-observables and HITL-agentic categories. We killed that: the FTC's Consumer Review Rule explicitly bans undisclosed company-controlled review sites (enforcement live since Dec 2025, up to $53,088 per violation), and mechanically it wouldn't have worked anyway — fresh correlated domains don't rank, so they'd never be retrieved. Worse, "startup caught astroturfing AI recommendations" is the worst possible story for a company selling human-oversight software. Replaced with the disclosed version of the same goal: own the category definitionally through first-party content, get listed on the machine-readable surfaces LLMs actually retrieve from, and fix the entity so crawlers know who we are.

## Baseline (Aug 2026)

- **0% mention rate** across sampled target queries in both markets
- **Name collision:** "Vibe Rooster" resolved to Vibe.co, Vibe.us, and Vibes in search
- **Category term:** "short-term observables" collides with the observability tooling market. The site already says **"explorables"** — better, no collision, and there's a page arguing the case. Use "explorables" externally.
- **Competitors win with disclosed first-party content:** Northflank's own "best PaaS for vibe-coded apps" listicle ranks; HumanLayer's "12-Factor Agents" essay is cited everywhere. No deception involved in either.
- **Unclaimed ground:** all incumbent HITL content is eval/observability (Confident AI, Braintrust) or approval routing (HumanLayer, gotoHuman). Nobody frames HITL as *where the human decision surface lives* — which is exactly what `await_decision` does, rendering review UI on the live artifact.

## Done

**Site (viberooster.com)**
- JSON-LD `@graph` on all 5 pages: `Organization` with `sameAs` across all six socials (the machine-readable fix for the name collision), `SoftwareApplication` with featureList + three pricing offers, `WebSite`, per-page `WebPage`/`TechArticle`/`Article`
- Canonical URLs, Open Graph and Twitter cards — none existed before
- `robots.txt` welcoming 18 AI crawlers, pointing at `/llms.txt` and the new `sitemap.xml`
- `brand/` icon set: 1024/512/256/128, circle variant, apple-touch, favicon.ico, plus full-bleed `avatar-512.png` for directory listings. Cropped to the rooster head on brand orange — the white full-body rooster on transparent would have vanished into white listing pages.
- `llms.txt` was already excellent (incl. a "Crawling and citation" section) — left untouched

**Official MCP Registry**
- Published: **`com.viberooster/hatch`** v1.0.0-1, status active
- HTTP domain verification via `.well-known/mcp-registry-auth` (+ `.nojekyll`, required because Jekyll strips dot-directories) — no DNS record needed
- Namespace `com.viberooster` deliberately over `dev.theroost`: that ID is scraped verbatim into every downstream directory, so it should carry the brand we're disambiguating
- Description capped at **100 chars** by the registry, so it's dense on purpose: "Hosting for AI agents: publish a live website in one tool call, ephemeral or forever."

**hatch-mcp repo** (`github.com/VibeRooster/hatch-mcp`)
- README with install snippets, all 15 tools grouped by purpose, apexes, tiers
- HATCH-AGENT.md — the reference the server's `instructions` already cited but agents couldn't fetch
- Written from the **live endpoint** (`tools/list`, `prompts/list`), not marketing copy, so signatures are accurate

**GitHub org profile**
- Display name "Vibe Rooster", email, URL, description, 4 socials (X, LinkedIn, Reddit, Instagram — only 4 slots; TikTok cut)

**Smithery** — published; scan passed, 15 tools + 1 prompt indexed

**Monitoring** — scheduled task `vibe-rooster-llm-sov-audit`, monthly on the 13th at 9am, rotating sample of 20 target queries, tracks mention rate vs. competitors

## Open

| Item | Who | Note |
|---|---|---|
| Push `add-viberooster-hatch` branch, open PR | Tim | Branch prepared in outputs/awesome-mcp-pr, one line at the right alphabetical position; PR title + body drafted |
| Upload org avatar | Tim | `brand/avatar-512.png` — file upload unavailable to the agent |
| Verify viberooster.com on the org | Tim | Settings → Verified and approved domains; adds a Verified badge |
| Store `key.pem` in 1Password | Tim | "MCP Registry — publishing key (com.viberooster)". Needed for every republish; scratch folder is cleared between sessions |
| Fix server `instructions` | Tim | Lists 5 tools but 15 are exposed — the entire HITL set is invisible to connecting agents |
| Reconcile display names | Tim | Server reports `viberooster-hatch` / "Hatch Roost"; registry says "Hatch"; install page says "Hatch" |
| Expose HATCH-AGENT.md as an MCP resource | Tim | The server cites it; agents can't fetch it |
| G2, Capterra, AlternativeTo, Crunchbase | Tim | Account-bound; listing copy drafted |
| Product Hunt, Show HN, Reddit | Tim | **Must be human.** These carry weight in LLM answers precisely because they're human; automating them is the astroturf trap again |
| Content backlog (10 assets) | — | Lead with the HITL/agent-approval-surface essay — built in product, unclaimed in the market |

## Standing rule

**Anything meant to be cited must be Forever tier or on viberooster.com.** Free-tier roosts expire in 48h; LLM citations only accumulate on URLs that persist, and 404s get dropped from indexes. The product's core virtue is a GEO liability if we publish marketing onto it. Corollary: a permanent gallery of Forever-tier explorables *is* a citation asset.
