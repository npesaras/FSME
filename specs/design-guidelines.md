# FSMES Brand Guidelines

## 1. Brand Foundation

### Brand Keywords
- Institutional
- Clear
- Trustworthy
- Disciplined
- Modern
- Calm
- Workflow-first

### Visual Tone
- Professional internal academic operations platform
- Quietly confident, structured, and clarity-focused
- Dense enough for real work and calm for document-heavy tasks
- Avoid consumer-social styling and generic dashboard clone aesthetics

## 2. Color System

### Core Palette
| Token | Hex | Usage |
| --- | --- | --- |
| Primary 700 | `#115E59` | Hover states, active controls, strong emphasis |
| Primary 600 | `#0F766E` | Primary buttons, active nav, links, status accents |
| Primary 500 | `#14B8A6` | Highlights, focus accents, interactive support |
| Primary 100 | `#CCFBF1` | Soft panels, subtle highlights, chips |
| Primary 50 | `#F0FDFA` | Tinted backgrounds and section fills |
| Neutral 950 | `#0F172A` | Main text |
| Neutral 700 | `#334155` | Secondary text |
| Neutral 500 | `#64748B` | Muted text |
| Neutral 200 | `#E2E8F0` | Borders and dividers |
| Neutral 100 | `#F1F5F9` | Card backgrounds and muted surfaces |
| Neutral 50 | `#F8FAFC` | Page background |
| Success | `#15803D` | Success state |
| Warning | `#B45309` | Needs attention, revision state |
| Error | `#B91C1C` | Error state |
| Info | `#0369A1` | Informational accents |

### Status Chip Colors
| Status | Background | Text |
| --- | --- | --- |
| Draft | `#F1F5F9` | `#334155` |
| Submitted | `#E0F2FE` | `#075985` |
| Under Review | `#CCFBF1` | `#115E59` |
| Returned for Revision | `#FEF3C7` | `#92400E` |
| Resubmitted | `#DBEAFE` | `#1D4ED8` |
| Decision Recorded | `#DCFCE7` | `#166534` |
| Closed | `#E5E7EB` | `#374151` |

### Color Rules
- Teal is the primary brand color.
- Status must not rely on color alone; always pair with visible labels.
- Meet WCAG AA contrast targets.
- Avoid purple-led palettes and overly flashy visual treatments.

## 3. Typography

### Font Stack
- Headings and UI text: `Manrope`
- Data labels, reference numbers, timestamps, file metadata: `IBM Plex Mono`

### Typography Rules
- Use mono type only for technical/reference content.
- Keep hierarchy clear and scannable for workflow-heavy screens.

## 4. Spacing (4-Point Grid System)

### Grid Rules
- Use a strict 4-point grid system for all spacing.
- Base spacing unit: `4px`
- All margins, paddings, gaps, inset spacing, and offsets must be divisible by `4`.

### Approved Spacing Scale
- `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

### Component and Layout Spacing
- Section gap: `24px` or `32px` (based on density)
- Card padding: `20px` or `24px`
- Form field vertical gap: `16px`
- Grid gutter: `24px` desktop, `16px` tablet/mobile
- Table cell padding: `12px` vertical, `16px` horizontal
- Default page padding: `24px` desktop, `16px` mobile
- Minimum touch target: `44px`

### Off-Grid Values to Avoid
- Do not use off-grid values such as `10px`, `14px`, `18px`, `22px`, or any non-divisible-by-4 spacing.

## 5. Radius and Shape
- Card radius: `12px`
- Input radius: `12px`
- Button radius: `12px`
- Modal and drawer radius: `16px`

## 6. Elevation and Surface Style
- Use soft shadows only on cards, drawers, and modals.
- Prefer border + shadow combinations over heavy floating effects.
- Avoid glossy gradients and noisy neumorphism.

## 7. Consistency Rules
- Keep spacing steps consistent; do not visually guess values.
- Keep typography, spacing, and color tokens centralized before development.
- Reuse shared patterns for status chips, timelines, forms, tables, cards, filters, and uploads.
- Maintain a calm, formal, supportive UI voice in labels and messages.
