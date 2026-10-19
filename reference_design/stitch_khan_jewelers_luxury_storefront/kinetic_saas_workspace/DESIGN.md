---
name: Kinetic SaaS Workspace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#0051b1'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f69dc'
  on-tertiary-container: '#edf0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  canvas-bg: '#F8FAFC'
  surface-card: '#FFFFFF'
  surface-sidebar: '#0F172A'
  surface-sidebar-card: '#1E293B'
  border-subtle: '#E2E8F0'
  border-sidebar: '#334155'
  status-won: '#10B981'
  status-won-bg: '#ECFDF5'
  status-pending: '#F59E0B'
  status-pending-bg: '#FFFBEB'
  status-lost: '#F43F5E'
  status-lost-bg: '#FFF1F2'
  status-contacted: '#0284C7'
  status-contacted-bg: '#F0F9FF'
  status-new: '#64748B'
  status-new-bg: '#F1F5F9'
  chart-1: '#2563EB'
  chart-2: '#10B981'
  chart-3: '#F59E0B'
  chart-4: '#6366F1'
  chart-5: '#0EA5E9'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  title-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
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
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system blends the mechanical precision, dense data utility, and keyboard-first elegance of Linear with the enterprise clarity and relationship-focused structure of HubSpot. Designed for high-velocity software engineering, digital agencies, and consultative tech operations, the interface prioritizes immediate clarity, high signal-to-noise ratios, and seamless pipeline acceleration.

### Aesthetic Persona
- **Disciplined Precision:** Sub-pixel alignment, hairline dividers, meticulous typography, and high-density information displays.
- **Dual-Surfacing:** A high-contrast split between deep navy command panels (representing infrastructure and administrative utility) and clean slate/white canvases (representing operative focus and deal management).
- **Engineered Calm:** Chromatic energy is reserved strictly for actionable state changes, pipeline statuses, and metric trends. Visual noise is aggressively suppressed in favor of crisp borders and subtle, diffused ambient depth.

## Colors

The palette operates under a calibrated light mode baseline anchored by deep slate-navy infrastructure surfaces.

### Functional Distribution
- **Primary & Interactive (`#2563EB`, `#3B82F6`):** Drives primary CTA buttons, selection states, active tab underscores, active pipeline breadcrumbs, and drag handles.
- **Structural Nav / Secondary (`#0F172A`, `#1E293B`):** Dedicated to global navigational chrome, primary headers, modal scuffs, and dark-mode data pods. This provides high-contrast ground truth framing for the main workspace.
- **Workspace Surfaces (`#F8FAFC`, `#FFFFFF`):** The general workspace uses `#F8FAFC` to eliminate screen glare, while modular cards, side sheets, and dropdowns sit crisp and clean on `#FFFFFF`.
- **Structural Grid Borders (`#E2E8F0`):** Hairline structural separation across tabular views, pipeline kanban columns, and detail drawers.

### Pipeline Status Taxonomy
- **Won / Qualified:** Emerald (`#10B981` text/icon on `#ECFDF5` fill)
- **Proposal / In Progress:** Amber (`#F59E0B` text/icon on `#FFFBEB` fill)
- **Lost / Archived:** Rose (`#F43F5E` text/icon on `#FFF1F2` fill)
- **Contacted / Engaged:** Sky (`#0284C7` text/icon on `#F0F9FF` fill)
- **New / Unassigned:** Slate (`#64748B` text/icon on `#F1F5F9` fill)

### Recharts & Data Visualization
Charts maintain high visual distinction with continuous color harmonies: `chart-1` (Vibrant Blue), `chart-2` (Emerald Conversion), `chart-3` (Amber Velocity), `chart-4` (Indigo Volume), and `chart-5` (Sky Net Revenue).

## Typography

The typography is built entirely upon Inter, optimized for screen clarity at micro-scales and extreme information density.

- **Numerics & Tables:** All numerical CRM metrics, pipeline currency values, and percentages use tabular figures (`font-variant-numeric: tabular-nums`) to maintain visual alignment across dense tables and charts.
- **Hierarchy & Tracking:** Display titles apply negative tracking (`-0.025em`) to balance larger display sizes. Micro-labels and uppercase table metadata headers employ wider tracking (`0.03em`) for immediate readability at 11px.
- **Dense Data Readability:** Default CRM copy sits at `body-md` (13px/20px), balancing compact data rows with prolonged visual comfort.

## Layout & Spacing

The layout is built around a hybrid productivity shell: an invariant 260px dark navy left navigation pane, paired with a dynamic fluid canvas that shifts between 12-column tabular grids and horizontal Kanban pipelines.

### Breakpoints & Layout Adaptations
- **Desktop (>= 1280px):** Permanent 260px sidebar navigation; 12-column responsive grid workspace with `1.25rem` gutters. Deal kanban columns maintain an unconstrained horizontal scroll format (minimum 300px column width).
- **Tablet (768px - 1279px):** Collapsed 64px icon-only sidebar. Tabular data preserves critical columns while secondary metadata transitions into expandable row drawers.
- **Mobile (< 768px):** Off-canvas slide-out navigation overlay. Kanban pipeline transforms into swipeable column tabs with vertical deal stacks. Margins pull in to `1rem`.

### Alignment Rhythm
All modular internal padding follows an 8px grid baseline (`space-xs` to `space-xl`), ensuring compact table cell heights (36px–40px) and clean pipeline card stacks.

## Elevation & Depth

Visual depth is achieved through ambient, cool-toned shadows paired with subtle borders rather than aggressive dark drop shadows.

- **Level 0 (Canvas Base):** Flat `#F8FAFC` surface with no shadow. Structural demarcations rely on `1px solid #E2E8F0`.
- **Level 1 (Cards & Data Pods):** Pure white `#FFFFFF` surface accompanied by a subtle border (`1px solid #E2E8F0`) and an ambient glow: `0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hovered Kanban Cards & Floating Controls):** Used during drag-and-drop or card hover states: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`, border color transitions to `#CBD5E1`.
- **Level 3 (Dropdowns, Overlays & Command Bar):** Used for Quick-Search (CMD+K), filters, and context menus: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)` with a hairline boundary of `1px solid #E2E8F0`.
- **Level 4 (Modals & Deep Drawers):** High-impact sheets with `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a `rgba(15, 23, 42, 0.4)` backdrop blur.

## Shapes

The design uses balanced, rounded corners (Level 2) that soften data-dense interfaces without losing spatial efficiency:

- **Interactive Controls (Inputs, Buttons, Dropdown triggers):** Standard `0.5rem` (8px) border-radius creates tactile target areas.
- **Containers & Surfaces (Cards, Panels, Modals):** Scaled to `0.75rem` - `1rem` (12px–16px) for distinct structural encapsulation.
- **Status Badges & Avatar Anchors:** Full-pill radiuses (`9999px`) to clearly separate micro-status tags from rectangular data buttons and input fields.

## Components

### Buttons
- **Primary:** Filled `#2563EB` background with `#FFFFFF` text. Subtle hover transition to `#1D4ED8`. Active state uses `transform: scale(0.99)`.
- **Secondary / Subtle:** `#FFFFFF` background, `1px solid #E2E8F0` border, `#0F172A` text. Hover brings `#F8FAFC` fill and `#CBD5E1` border.
- **Ghost / Utility:** Transparent fill, `#64748B` text; on hover: `#F1F5F9` fill and `#0F172A` text.
- **Sidebar Actions:** Set against `#0F172A` background; default text is `#94A3B8`, hovering produces a `#1E293B` background tile with `#FFFFFF` text.

### Status Badges & Chips
- Designed as compact pill shapes (`rounded-full`) with a height of 22px, font size 11px, weight 600, uppercase letter-spacing `0.03em`.
- Each badge features a 6px solid circular dot indicator before the text label.
- Color combinations strictly adhere to the Status Taxonomy tokens (e.g., Won uses `#ECFDF5` background, `#10B981` dot and text).

### Cards & Pipeline Tiles
- White canvas (`#FFFFFF`) framed with `1px solid #E2E8F0` and `rounded-lg` (12px).
- Internal padding is set to `space-md` (14px).
- Deals include client company tags, deal value highlighted in `title-sm` with tabular numerals, contact avatar clusters, and days-in-stage counters.

### Input Fields & Controls
- **Form Inputs:** 36px default height, `1px solid #E2E8F0`, `#FFFFFF` surface, `0.5rem` corner radius. Focused state applies a sharp `0 0 0 1px #2563EB` border ring with `0 0 0 3px rgba(37, 99, 235, 0.15)`.
- **Checkboxes & Radios:** 16px square/circle with `1px solid #CBD5E1`. Checked state transitions to `#2563EB` with an internal white checkmark or center pin.

### Data Tables
- Header rows use `#F8FAFC` with an uppercase `label-sm` style (`#64748B`), fixed 36px height, and hairline borders.
- Body rows maintain a compact 44px height, `#FFFFFF` surface, hover state tint of `#F8FAFC`, and inline status pills and action toolbars that appear on hover.

### Analytics Visualizations (Recharts)
- Minimalist Cartesian grids rendered with `stroke="#E2E8F0"` and `strokeDasharray="3 3"`.
- Custom tooltips use floating `#0F172A` cards with `#FFFFFF` text, `0.5rem` radius, and tabular metric rows.
- Line/Area charts use 2px stroke widths with soft vertical gradient fills fading down to 0% opacity.