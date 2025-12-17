# Design Guidelines: Provider Data Validation & Directory Management Agent

## Design Approach
**Design System**: Material Design 3 (optimized for data-heavy enterprise applications with excellent dashboard and data visualization patterns)

**Core Principles**:
- Data clarity and scanability over visual flair
- Trust and professionalism for healthcare context
- Efficient workflows for high-volume data processing
- Clear status communication through visual hierarchy

## Typography
- **Primary Font**: Inter via Google Fonts (excellent readability for data tables and dashboards)
- **Headers**: Font weights 600-700, sizes xl to 3xl for page titles
- **Body/Data**: Font weight 400-500, sizes sm to base for tables and forms
- **Monospace**: JetBrains Mono for NPI numbers, phone numbers, IDs

## Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Card spacing: p-6 internally
- Table cell padding: px-4 py-3

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Two-column layouts for data comparison views (provider profile split-screen)
- Single column with max-w-7xl for main content areas

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed header with logo, main nav items, user profile
- **Sidebar Navigation**: Collapsible left sidebar for main sections (Dashboard, Providers, Review Queue, Reports)
- **Breadcrumbs**: Show current location in data hierarchy

### Dashboard Components
- **KPI Cards**: Grid of stat cards (4-column on desktop) showing total providers, verified count, flagged count, validation accuracy percentage
- **Charts**: Bar charts for confidence score distribution, line charts for processing trends, donut chart for status breakdown
- **Recent Activity Feed**: List of recent validations with status badges

### Data Display
- **Provider Table**: Sortable, filterable table with inline status badges, confidence score indicators, action buttons
- **Status Badges**: Pill-shaped badges with distinct treatments for Verified (success), Flagged (warning), Pending (neutral), Error (danger)
- **Confidence Score Indicators**: Progress bars or numerical percentages with color coding (green >90%, yellow 70-90%, red <70%)
- **Data Comparison Cards**: Side-by-side cards showing source attribution for conflicting data fields

### Forms & Input
- **File Upload**: Drag-and-drop zone with file preview, progress indicators for CSV/PDF processing
- **Search & Filters**: Prominent search bar with advanced filter dropdowns (status, confidence range, specialty)
- **Inline Editing**: Editable fields with save/cancel actions for manual corrections

### Review Queue
- **Priority List**: Sortable list with priority badges (High/Medium/Low), expandable rows for detail view
- **Review Panel**: Split-screen layout with original data on left, validated data on right, approval actions at bottom
- **Bulk Actions**: Checkbox selection with batch approve/reject/flag options

### Overlays & Modals
- **Provider Detail Modal**: Full-screen or large modal showing complete provider profile with all data sources
- **Confirmation Dialogs**: Small centered modals for destructive actions
- **Email Draft Preview**: Modal showing auto-generated email templates with edit capability

### Reports & Export
- **Report Preview**: Table preview before download
- **Export Options**: Dropdown with CSV/PDF format selection
- **Date Range Picker**: For filtering report data

## Visual Hierarchy

**Status Color System**:
- Verified/Success: Green tones
- Flagged/Warning: Amber/Yellow tones
- Error/Critical: Red tones
- Pending/Neutral: Blue-gray tones
- Information: Blue tones

**Data Density**:
- Tables use compact row spacing (py-3) for maximum data visibility
- Cards provide breathing room (p-6) for focused information
- Dashboard balances density with whitespace for scannability

## Accessibility
- All status indicators include icon + text (not color alone)
- Form inputs maintain consistent 44px minimum touch target
- Focus states clearly visible on all interactive elements
- ARIA labels for icon-only buttons and status badges

## Animations
**Minimal, purposeful motion**:
- Smooth transitions for expandable rows (duration-200)
- Loading spinners for async operations
- Toast notifications for action confirmations
- NO decorative animations or scroll effects

## Images
**No hero images** - this is an enterprise data application. Use icons throughout:
- Dashboard: Icon library icons for KPI cards (Heroicons recommended)
- Status indicators: Check, warning, alert icons
- Empty states: Simple icon + text combinations for empty tables/queues