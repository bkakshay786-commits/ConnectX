---
name: ConnectX Universe
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
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e2e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#bf2076'
  on-tertiary-container: '#ffdde7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#11131a'
  on-background: '#e2e2ec'
  surface-variant: '#33343c'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
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
    fontSize: 10px
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
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system defines a next-generation social, communication, and universal media/file-sharing ecosystem. Designed for digital natives, creators, and modern teams, it merges consumer social vibrancy with high-performance communication infrastructure. 

The visual identity relies on **Deep Cyber Dark Mode** paired with **Electric Luminous Glassmorphism**. Dark space canvas layers create infinite depth, while luminous electric violet, cyber blue, and neon magenta accents drive immediate visual hierarchy. The emotional response is immersive, hyper-modern, fluid, and secure—evoking the tactile precision of futuristic OS interfaces combined with the engaging warmth of interactive consumer social platforms.

## Colors

The color palette is built upon a high-contrast dark foundation optimized for OLED screens, media immersion, and luminous neon accents.

### Color Roles & Ramps
- **Background & Canvas (`#0B0D14`)**: Deepest cosmic space, used for root views and full-screen media environments.
- **Surface Elevation 1 (`#121624`)**: Primary structural panels, navigation sidebars, and chat threads.
- **Surface Elevation 2 (`#1B2036`)**: Interactive cards, input shells, modal sheets, and file preview tiles.
- **Surface Highlight / Glass Borders (`rgba(255, 255, 255, 0.08)`)**: Fine 1px perimeter boundaries providing crisp definition against dark backdrops.
- **Primary Accent (`#7C3AED` to `#8B5CF6`)**: Electric Purple; represents the primary brand signature, core action states, active navigation pills, and dynamic stories.
- **Secondary Accent (`#3B82F6` to `#06B6D4`)**: Cyber Blue and Vibrant Cyan; drives data transmission, verified status rings, file transfer states, and connected device nodes.
- **Tertiary Accent (`#EC4899`)**: Neon Magenta; used for reactions, live event indicators, badges, and attention-drawing highlights.
- **Text & Foreground**:
  - `Text-Primary`: `#F8FAFC` (98% high-contrast contrast on deep dark surfaces).
  - `Text-Secondary`: `#94A3B8` (subtle metadata, time stamps, secondary captions).
  - `Text-Muted`: `#64748B` (disabled states, inactive placeholder text).

## Typography

The type system blends the energetic geometry of **Plus Jakarta Sans** with the structural legibility of **Inter**.

- **Display & Headlines (Plus Jakarta Sans)**: Used across hero modules, user display names, feed card headers, and navigation destinations. High weight contrast (600 to 800) and tight letter-spacing give feed headers a snappy, contemporary magazine feel.
- **Body & Continuous Text (Inter)**: Built for micro-messaging, direct message feeds, and dense file metadata logs. Inter ensures crisp rendering at 12px to 16px sizes across high-DPI and mobile displays.
- **Labels & Microcopy (Plus Jakarta Sans)**: Applied to pill buttons, badge counters, status indicators, and file extension tags to maintain typographic identity even at 10px–12px scales.

## Layout & Spacing

The system uses a fluid responsive column structure coupled with an 8pt base grid for component internals and negative space.

### Breakpoints & Grid Composition
- **Desktop / Ultra-wide (>= 1280px)**: 3-column ecosystem (Left narrow app dock/sidebar at 80px or 240px, primary dynamic feed at 640px–720px width, contextual utility/file stream at 360px–420px). Standard margin is `2rem`, gutters at `1.25rem`.
- **Tablet / Compact Desktop (768px - 1279px)**: 2-column layout (Collapsible rail navigation + adaptive feed with overlay utility drawers). Gutters scale to `1rem`.
- **Mobile (< 768px)**: Single-column fluid stack with bottom pill navigation bar. Margins contract to `1rem` and internal component padding leverages `space-sm` and `space-md` to maximize screen real estate.

## Elevation & Depth

Visual hierarchy uses a multi-layered glassmorphic depth system composed of progressive luminous backdrops, frosted acrylic blurs, and perimeter light edges.

1. **Level 0 (Canvas Base)**: `#0B0D14` solid background. Holds subtle ambient radial gradients of `#7C3AED15` and `#3B82F610` positioned strategically behind feed anchors.
2. **Level 1 (Dock & Structural Rails)**: `#121624` with `backdrop-filter: blur(20px)` and an inner 1px border `rgba(255, 255, 255, 0.05)`.
3. **Level 2 (Feed Cards & Media Modules)**: `#1B2036` background at 85% opacity, combined with a 1px border stroke of `rgba(255, 255, 255, 0.08)` and an ambient shadow: `0 8px 32px -4px rgba(0, 0, 0, 0.5)`.
4. **Level 3 (Modals, Overlays & Drag-and-Drop Trays)**: High-translucency glass (`rgba(27, 32, 54, 0.92)`) overlaid with dynamic drop shadow `0 20px 48px rgba(0, 0, 0, 0.75)` and an ambient violet rim glow `0 0 24px -2px rgba(124, 58, 237, 0.25)`.
5. **Interactive Glow**: Active/focused interactive elements receive an outer luminescence `0 0 16px rgba(124, 58, 237, 0.45)`.

## Shapes

The design system employs a rounded geometric profile balancing friendly modern consumer software with architectural balance.

- **Base Corner Radius (`rounded-md` / 0.5rem - 8px)**: Small controls, nested badges, tooltips, and file type icons.
- **Card & Surface Radius (`rounded-lg` / 1rem - 16px to `rounded-xl` / 1.5rem - 20px)**: Feed media containers, chat bubbles, explore modules, and modal window frames.
- **Pill & Full Radius (`rounded-full` / 9999px)**: Avatar rings, status indicators, action buttons, search bars, tag chips, and audio wave pills.

## Components

### Buttons
- **Primary Action**: Pill-shaped (`rounded-full`), electric purple background gradient (`linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`), text in white `#FFFFFF`, paired with an ambient soft violet glow on hover.
- **Secondary / Ghost**: Semi-translucent dark surface (`rgba(255, 255, 255, 0.05)`) with a 1px white border stroke (`rgba(255, 255, 255, 0.12)`) and text `#F8FAFC`. On hover, transitions to `rgba(255, 255, 255, 0.1)`.
- **Icon Buttons**: Circle pills (`40px x 40px`) centered in `#1B2036` with subtle white rim borders.

### Chips & Filter Tags
- Compact pill-shaped modules (`height: 32px`, `padding: 0 14px`) utilizing `label-md` typography.
- Inactive state: `#121624` surface with muted slate text `#94A3B8`.
- Active state: Linear gradient fill (`#7C3AED` to `#3B82F6`) with bold white text and a cyan indicator dot.

### Cards & Media Feed Tiles
- Engineered with `16px–20px` corners, `#1B2036` backing, and 1px crisp outline `rgba(255, 255, 255, 0.08)`.
- Top header showcases rounded avatar (40px) surrounded by an active gradient story ring (Magenta-to-Purple).
- Media containers inside cards use edge-to-edge 12px nested corner radius with subtle dark vignette overlays for embedded controls.

### Input Fields & Search Bars
- Pill-shaped (`rounded-full`) search bars and `12px` rounded inputs with background `#121624`.
- Subtle internal inset shadow with `1px solid rgba(255, 255, 255, 0.07)`.
- Focused state transforms border color to `#7C3AED` accompanied by a `3px` diffuse violet aura (`rgba(124, 58, 237, 0.25)`).

### Universal File-Sharing Badges
- Floating glassmorphic badges displaying file extensions (`.fig`, `.mov`, `.pdf`, `.zip`) anchored with neon status accents (Cyan for transfer ready, Electric Violet for encrypted, Magenta for live syncing).
- Incorporates linear progress track bars with glowing gradient fills and real-time upload/download velocity indicators.

### Checkboxes & Radio Controls
- Checkboxes feature `6px` rounded square silhouettes; radios are circular.
- Unchecked: `#121624` with 1.5px border `#64748B`.
- Checked: `#7C3AED` fill featuring a crisp white micro checkmark and outer neon pulse animation.