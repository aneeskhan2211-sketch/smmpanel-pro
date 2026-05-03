# Design Brief: SMM Panel Pro — Premium Conversion Platform

## Tone & Differentiation
Premium SaaS positioning: velocity-first, conversion-optimized. Tier psychology drives "Recommended" and "Premium" selection through visual hierarchy, trust badges, and quality differentiation. Electric blue + emerald green create confidence; dark mode emphasizes sophistication.

## Color Palette (OKLCH)
| Token | Light | Dark | Purpose |
|---|---|---|---|
| Primary | N/A | `0.58 0.19 250` | Electric blue (#3B82F6): CTAs, active states |
| Success | N/A | `0.68 0.2 150` | Emerald: "Recommended" badge, confirmed orders |
| Warning | N/A | `0.62 0.19 56` | Amber: "Limited slots", urgency signals |
| Info | N/A | `0.52 0.17 254` | Muted blue: stats, secondary CTAs |
| Destructive | N/A | `0.6 0.22 29` | Red: cancel, errors |
| Background | N/A | `0.08 0.008 264` | Deep charcoal (#0B0F19): brand foundation |
| Foreground | N/A | `0.94 0.005 264` | Off-white: high-contrast text |
| Card | N/A | `0.12 0.008 264` | Elevated surfaces |
| Muted | N/A | `0.17 0.008 264` | Inactive, secondary text |

## Typography
| Layer | Font | Scale | Purpose |
|---|---|---|---|
| Display | Poppins Bold | 32–48px | Page headers, tier pricing values |
| Heading | Poppins SemiBold | 20–28px | Section titles, service card names |
| Body | Inter Regular | 14–16px | Copy, service descriptions |
| Label | Inter SemiBold | 12–14px | Form labels, badge text, tier names |
| Mono | JetBrains Mono | 12px | Transaction IDs, API keys |

## Structural Zones
| Zone | Background | Border | Purpose |
|---|---|---|---|
| Navbar | Card | Subtle border-b | Sticky: logo, search, currency, language, wallet, notifications |
| Sidebar | Sidebar | Border-r | Navigation: Dashboard, Services, Bundles, Calculator, Engagement, Admin |
| Content | Background | None | Main workspace, service grid, dashboard metrics |
| Service Card | Card | Subtle | 3-tier layout: Basic (muted), Recommended (success highlight), Premium (primary highlight) |
| Modal | Card | Subtle | Centered, backdrop blur, elevation shadow |
| Footer | Muted | Border-t | Trust badges, support, legal |

## Tier Card Patterns
- **Basic**: Muted background, neutral text, faded icons. Smallest touch target. Anchor positioning (left/bottom).
- **Recommended**: Success green highlight, "Most Popular" badge, slightly larger, pre-selected by default (opacity: 1, focus ring).
- **Premium**: Primary blue highlight, "Best Quality" badge, largest touch target, premium benefit callout (refill, priority, high retention).

## Trust & Urgency Signals
- **Badges**: 🔥 "Limited slots", 💎 "High retention", ⚡ "Fast delivery", 🛡️ "Refill guarantee", ✅ "Low drop rate"
- **Badges appear on**: Service cards, tier comparison, bundle headers
- **Success metrics visible**: Success rate %, refill availability, delivery speed label, user review count

## Component Patterns
- **Stats Cards**: Icon + label + value. Hover: `shadow-elevated`, primary icon tint.
- **Service Cards**: Platform icon, name, price/1k, delivery, retention score, 3-tier pricing below. Hover: shadow lift.
- **CTAs**: Primary (electric blue, full width), Secondary (muted border), Tertiary (text-only). All 44x44px minimum on mobile.
- **Tier Comparison Table**: Rows for delivery speed, retention, refill, priority, support level. Checkmarks = success, X = not included.
- **Forms**: Minimal labels, floating hints, focus ring primary.
- **Badges**: Inline (success/warning/info colors), Pill (muted bg). Animated pulse on urgency badges.

## Motion & Animation
- **Entrance**: Fade-in + slide-up (0.5s) for modals, tier cards, bundle reveals.
- **Hover**: Shadow lift + subtle color shift (0.2s) for service cards, CTAs.
- **Urgency Badge**: Pulse-soft (0.6s) to draw attention.
- **Loading**: Skeleton loader with pulse-soft animation.
- **State Change**: Smooth 0.3s transitions (toggle tier, expand comparison, select currency).

## Spacing & Density
- **Grid**: 4px base unit. Card padding: 16–24px. Gaps: 12px (desktop), 8px (mobile).
- **Tier Cards**: Full width on mobile (stacked), 3-column grid on desktop with equal widths.
- **Whitespace**: Generous margins between sections (2–3 base units) to reduce cognitive load.

## Currency & Language Selectors
- **Currency**: Flag icon + symbol + 3-letter code in navbar. Auto-converts all prices. Supported: INR ₹, USD $, AED د.إ, OMR ﷼, SAR ﷼, EUR €, GBP £.
- **Language**: Dropdown in navbar, Settings page. Supported: English, Hindi, Hinglish, Arabic. All labels, service names, microcopy translatable.

## Calculator & Bundles Page
- **Smart Calculator**: Platform dropdown → Service dropdown → Quantity slider → Tier tabs (Basic/Recommended/Premium) → Currency selector. Shows: price/1k, total, delivery time, premium benefits, wallet balance required.
- **Bundle Packs**: Grid of 5 packs (Starter, Reels Viral, YouTube Growth, Business Boost, Premium Brand). Each shows: original pricing (struck-through), bundle discount price, included services, delivery estimate, "Upgrade to Premium" CTA.

## AI Growth Tools (UI Mockups)
- **Interactive forms**: Caption Generator, Hashtag Generator, Bio Optimizer, Viral Hook Generator, Content Calendar, Competitor Analyzer. Each displays mock results (e.g., "Use trending keywords for max reach..."). Forms are functional UI, results are placeholder text.

## Engagement Dashboard
- **Daily Login Reward**: Card showing today's bonus, streak counter, next reward unlock.
- **Referral System**: Referral link, earned commission, leaderboard, commission rate % display.
- **User Levels**: Current level badge, progress bar to next level, level benefits (discount %, cashback rate).
- **Spin Wheel**: Animated wheel card, spin button, prize display (e.g., "10% off next order").
- **Coupons**: Active coupons grid, copy code button, expiry countdown.

## Constraints
- Dark mode only (brand foundation).
- No full-page gradients (maintains focus).
- Shadows: subtle (1px), elevated (8px), active (12px). Minimal opacity.
- High-contrast text (AA+ on all backgrounds).
- No animations > 0.5s (perceived speed).
- Icons: monochrome 1.5–2px stroke.
- Mobile-first responsive (sm, md, lg breakpoints). Touch targets ≥44x44px.

## Signature Detail
Electric blue highlight on tier selection + success green on "Recommended" create a signature "smart choice" affordance. Soft shadows + tier card elevation convey trustworthiness and premium positioning. Urgency badges (pulsing amber) drive premium conversion without aggression.

## Success Metrics
- Recommended tier selected by 60%+ of new users.
- Premium tier conversion ≥ 30% of orders.
- Order placement < 3 clicks (calculator exempted).
- Mobile conversion parity with desktop (≥90%).
- Currency/language toggle perceived as instant.
- Trust metrics always visible (success rate, refill guarantee, delivery speed).
- Bundle average order value +40% vs. single service.

