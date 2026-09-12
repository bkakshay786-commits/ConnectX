---
name: ConnectX Modern Social
colors:
  surface: '#11131a'
  surface-dim: '#11131a'
  surface-bright: '#373941'
  surface-container-lowest: '#0c0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#282a31'
  surface-container-highest: '#33343c'
  on-surface: '#e2e2ec'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#e2e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#938ea1'
  outline-variant: '#484555'
  surface-tint: '#cabeff'
  primary: '#cabeff'
  on-primary: '#31009a'
  primary-container: '#947dff'
  on-primary-container: '#2a0088'
  inverse-primary: '#603ce2'
  secondary: '#aec6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0061d1'
  on-secondary-container: '#dbe4ff'
  tertiary: '#35d7fd'
  on-tertiary: '#003641'
  tertiary-container: '#009ebc'
  on-tertiary-container: '#002e39'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4816cb'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#b1ecff'
  tertiary-fixed-dim: '#35d7fd'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5e'
  background: '#11131a'
  on-background: '#e2e2ec'
  surface-variant: '#33343c'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 23px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 1.75rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a dark-first, fluid consumer social environment built around dynamic interaction, spatial immersion, and contextual intelligence. Designed for community connection, expressive identity, and rich media distribution, it rejects the dense utilitarian clutter of enterprise SaaS in favor of spacious, breathable layouts that prioritize visual artifacts, dynamic conversation threads, and ambient micro-interactions.

The emotional signature is electric yet calm—a twilight atmosphere ("deep cosmic charcoal") illuminated by crisp, jewel-toned accents: luminous violet, electric blue, vivid cyan, and neon pink. Layering, subtle glassmorphism, and colored edge diffusion give physical presence to digital objects. Media and user attachments are treated not as utility files, but as vibrant social tokens intended to be shared, reacted to, and transformed.

## Colors

The palette is rooted in low-noise, deep-spectrum darkness, enabling interactive elements and creative media to emerge effortlessly without ocular fatigue.

### Core Architecture
- **Canvas Base (`#090A0F`):** Deep cosmic charcoal, grounding the root viewport and immersive feeds.
- **Surface Muted (`#11131A`):** Low-contrast structural foundation for lists, thread backgrounds, and secondary panels.
- **Surface Elevated (`#171923`):** Floating container surface for cards, modals, sheets, and popovers.
- **Surface Border (`#232736`):** Delicate 1px structural separator providing optical delineation without harsh division.

### Accents & Dynamic Role
- **Primary Violet (`#7C5CFF`):** Main interactive anchor, user self-expression, primary CTA, and active social states.
- **Electric Blue (`#4C8DFF`):** Signals secondary actions, contextual intelligence, message links, and active delivery indicators.
- **Fresh Cyan (`#38D9FF`):** Real-time presence indicators, dynamic audio waves, live rooms, and unread pings.
- **Neon Pink (`#FF4FA3`):** Reactions, heart states, trending bursts, and creator-level badges.

### Text & Iconography Hierarchy
- **On-Dark High-Emphasis:** `#F5F6FA` (96% opacity) for titles, active handles, and direct conversation text.
- **On-Dark Medium-Emphasis:** `#9EA5B9` (68% opacity) for metadata, inactive states, and timestamps.
- **On-Dark Subtle:** `#5B6275` (40% opacity) for placeholders, inactive outlines, and divider glyphs.

## Typography

The typography scale utilizes **Plus Jakarta Sans** throughout all functional levels to sustain a clean, approachable, and geometric posture. 

### Implementation Principles
- **Atmospheric Leading:** Paragraph text and long-form conversation feeds preserve open line-heights (1.5x–1.6x) to avoid visual crowding and support comfortable scanning.
- **Rhythmic Weights:** Display headers enforce deliberate letter-tracking (`-0.02em` to `-0.03em`) and high weights (700 to 800) to balance against dark backgrounds without optical blurring.
- **Contextual Monospace:** Uniquely applied to numerical counts, audio timestamps, and social crypto/creator addresses via native tabular figures (`tnum`).

## Layout & Spacing

Spacing across this system is intentionally relaxed, maintaining approximately 15% to 20% lower density than typical analytical platforms. This deliberate negative space frames rich photography, motion video, voice waves, and reactive social copy.

### Grid & Form Factors
- **Mobile (< 768px):** Single-column stream with edge-to-edge media integration. Uses an outer margin of `1rem` and compact internal padding (`0.75rem` - `1rem`). Floating actions anchor dynamically to bottom utility zones.
- **Tablet (768px - 1024px):** 8-column layout with pinned or collapsible navigation rails and a responsive central content thread.
- **Desktop (> 1024px):** 12-column asymmetric structure. Navigation occupies a slim 280px left rail, main feeds flow through an expansive 640px–720px center spine, and social context / contextual assistance resides in a 340px right panel.

## Elevation & Depth

Spatial separation is achieved through low-noise surface contrast, hairline borders, and localized ambient illumination rather than harsh, opaque drop shadows.

### Elevation Hierarchy
1. **Level 0 (Canvas):** Pure `#090A0F`. Non-interactive background substrate.
2. **Level 1 (Sub-Containers):** `#11131A` with a soft 1px border of `#232736`. Used for conversation streams, nested comments, and input track areas.
3. **Level 2 (Floating Cards & Posts):** `#171923` paired with `box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.6)`. Outlined with a top-weighted gradient border (from `rgba(255, 255, 255, 0.08)` to `transparent`).
4. **Level 3 (Overlays & Modals):** Translucent backdrop blur (`backdrop-filter: blur(20px); background: rgba(23, 25, 35, 0.85);`). Box-shadow combines dark occlusion with a subtle, diffused violet cast (`0 20px 48px -12px rgba(124, 92, 255, 0.15)`).

### Interactive Ambient Glow
Active interactive elements (focused inputs, play states, trending pill badges) cast low-intensity perimeter halos matching their respective accent tones with an opacity of 18% to 28% and a blur radius between 16px and 24px.

## Shapes

The design system relies on softened, organic architecture that signals fluidity and comfort.

- **Primary Cards & Modals:** Radii range from `16px` to `20px`, softening structural edges and naturally accommodating rounded media inside.
- **Media & Embedded Objects:** Image carousels, video players, and rich previews adhere consistently to `14px`–`16px` rounding.
- **Chips, Pills, and Avatars:** Complete full-radius pill styling (`9999px`) for touch targets, action tags, filter segments, and user status indicators.

## Components

### Buttons
- **Primary Action:** Full pill radius (`rounded-full`), solid `#7C5CFF` fill, `#FFFFFF` text, subtle upward inner reflection (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2)`). On hover, blooms with a 16px violet ambient halo.
- **Secondary Action:** Pill radius, elevated surface `#171923`, 1px border `#232736`, text `#F5F6FA`. Hover triggers border transition to `rgba(124, 92, 255, 0.4)`.
- **Tertiary / Ghost:** No border or fill. Accent text color. Faint surface tint on hover.

### Chips & Badges
- **Status & Filter Chips:** Full pill geometry. Inactive: `#11131A` with `#232736` border. Active: Translucent tint (`rgba(124, 92, 255, 0.16)` fill, `#7C5CFF` border, `#7C5CFF` typography).
- **Social Metric Badges:** Compact pills embedding micro-icons with tabular figures for reaction, share, and audio listener counts.

### Input Fields & Search Bars
- Background set to `#11131A` with a 1px border of `#232736` and a generous `14px` border-radius.
- Placeholder text rendered in `#5B6275`. Focus elevates border to `#7C5CFF` accompanied by a localized 3px outer glow ring (`rgba(124, 92, 255, 0.25)`).

### Social Cards & Post Units
- Framed in `#171923` with a 1px border (`#232736`) and `18px` corner radius.
- Includes distinct, uncrowded zones: author row with status ring, media stage with 14px nested corner rounding, body copy with relaxed line-height, and an expansive bottom action row with generous tap targets (44px minimum touch boundaries).

### Social Objects & Attachments
- Non-text files, snippets, links, and shared content render as interactive social cards featuring rich metadata chips, vibrant micro-thumbnails, and direct one-click reaction triggers rather than static download items.

### Lists & Messaging Rows
- Borderless rows separated by soft padding intervals (`space-sm` to `space-md`). Active threads highlight with a delicate `#171923` background fill, an illuminated left indicator accent line, and subtle glow states.