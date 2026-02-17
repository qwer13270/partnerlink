# HomeKey 房客 — Full Project Specification

## Overview

**HomeKey 房客** is a real estate affiliate marketing platform for Taiwan's apartment market. It connects apartment developers with KOLs (Key Opinion Leaders) who earn commissions by referring potential buyers through trackable affiliate links.

**Current Phase**: Visual prototype / demo for investors and partners. All data is mock/hardcoded — no real backend, auth, or database yet. However, the project structure should be **production-ready and scalable** so we can plug in a real backend later.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Icons**: Lucide React
- **i18n**: next-intl (for bilingual support — Traditional Chinese + English)
- **Package Manager**: pnpm (preferred) or npm
- **Deployment Target**: Vercel

---

## Project Structure

```
homekey/
├── public/
│   └── images/                     # Placeholder images, logos
├── src/
│   ├── app/
│   │   ├── [locale]/               # i18n dynamic segment (en, zh-TW)
│   │   │   ├── layout.tsx          # Root layout with header, locale provider
│   │   │   ├── page.tsx            # Landing/home page (public marketing page for the platform itself)
│   │   │   │
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx        # Property listing (optional, could be future)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # Individual apartment landing page (public-facing, shared by KOLs)
│   │   │   │
│   │   │   ├── kol/
│   │   │   │   ├── layout.tsx      # KOL dashboard layout (sidebar nav)
│   │   │   │   ├── page.tsx        # KOL dashboard overview
│   │   │   │   ├── links/
│   │   │   │   │   └── page.tsx    # Affiliate links management
│   │   │   │   ├── performance/
│   │   │   │   │   └── page.tsx    # Performance analytics & charts
│   │   │   │   └── commissions/
│   │   │   │       └── page.tsx    # Commission tracking
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx      # Admin dashboard layout (sidebar nav)
│   │   │   │   ├── page.tsx        # Admin overview / stats
│   │   │   │   ├── projects/
│   │   │   │   │   └── page.tsx    # Manage apartment projects
│   │   │   │   ├── kols/
│   │   │   │   │   └── page.tsx    # Manage KOLs
│   │   │   │   ├── referrals/
│   │   │   │   │   └── page.tsx    # All referrals & conversions
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx    # Platform settings
│   │   │   │
│   │   │   └── developer/          # "developer" = apartment company/developer
│   │   │       ├── layout.tsx      # Developer dashboard layout (sidebar nav)
│   │   │       ├── page.tsx        # Developer overview
│   │   │       ├── projects/
│   │   │       │   └── page.tsx    # Their projects' performance
│   │   │       ├── leads/
│   │   │       │   └── page.tsx    # Leads & referrals table with "Confirm Sale" action
│   │   │       └── kols/
│   │   │           └── page.tsx    # KOL performance for their projects
│   │   │
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (button, card, table, badge, etc.)
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Global header with logo, nav, role switcher, lang toggle
│   │   │   ├── Sidebar.tsx         # Dashboard sidebar (reused across kol/admin/developer)
│   │   │   └── Footer.tsx          # Global footer
│   │   ├── property/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HighlightsBar.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── FloorPlans.tsx
│   │   │   ├── NearbyAmenities.tsx
│   │   │   ├── ConstructionTimeline.tsx
│   │   │   └── BookTourCTA.tsx
│   │   ├── kol/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── AffiliateLinksTable.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── CommissionTable.tsx
│   │   ├── admin/
│   │   │   ├── OverviewStats.tsx
│   │   │   ├── ProjectsTable.tsx
│   │   │   ├── KolsTable.tsx
│   │   │   ├── ActivityLog.tsx
│   │   │   └── QuickActions.tsx
│   │   └── developer/
│   │       ├── ProjectPerformanceCards.tsx
│   │       ├── LeadsTable.tsx       # Includes "Confirm Sale" button
│   │       ├── KolComparison.tsx
│   │       └── CommunicationPanel.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts                # Utility functions (cn helper for shadcn, formatters)
│   │   ├── constants.ts            # App-wide constants
│   │   └── types.ts                # TypeScript type definitions (see below)
│   │
│   ├── data/
│   │   ├── mock-properties.ts      # Mock apartment project data
│   │   ├── mock-kols.ts            # Mock KOL profiles and stats
│   │   ├── mock-referrals.ts       # Mock referral/lead data
│   │   └── mock-activity.ts        # Mock activity feed data
│   │
│   ├── hooks/
│   │   ├── useLocale.ts            # Locale/language helper hook
│   │   └── useMockData.ts          # Hook to simulate data fetching (easy to swap for real API later)
│   │
│   └── i18n/
│       ├── config.ts               # next-intl configuration
│       ├── en.json                  # English translations
│       └── zh-TW.json              # Traditional Chinese translations
│
├── middleware.ts                    # next-intl middleware for locale routing
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## TypeScript Types

Define these in `src/lib/types.ts`:

```typescript
// ---- Property / Apartment Project ----
type PropertyStatus = 'pre-sale' | 'selling' | 'sold-out' | 'completed'

interface UnitType {
  id: string
  name: string                    // e.g., "Type A"
  rooms: string                   // e.g., "2房1廳"
  size: number                    // in 坪 (ping)
  price: number                   // in TWD
}

interface Amenity {
  category: 'mrt' | 'school' | 'park' | 'shopping' | 'hospital'
  name: string
  distance: string                // e.g., "步行5分鐘"
}

interface TimelineMilestone {
  label: string
  date: string
  completed: boolean
}

interface Property {
  id: string
  slug: string
  name: string                    // e.g., "璞真建設 — 光河"
  nameEn: string                  // e.g., "PureCity — Light River"
  developer: string
  developerEn: string
  location: string                // e.g., "新北市板橋區"
  locationEn: string
  nearestMrt: string
  status: PropertyStatus
  priceRange: { min: number; max: number }
  totalUnits: number
  floors: number
  completionDate: string
  unitTypes: UnitType[]
  amenities: Amenity[]
  timeline: TimelineMilestone[]
  galleryImages: { label: string; labelEn: string }[]
}

// ---- KOL ----
interface KOL {
  id: string
  name: string
  email: string
  avatar?: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  activeProjects: number
  totalClicks: number
  totalBookings: number
  totalSales: number
  joinedDate: string
}

interface AffiliateLink {
  id: string
  kolId: string
  propertyId: string
  propertyName: string
  link: string                    // e.g., "homekey.tw/p/light-river?ref=sarah_chen"
  clicks: number
  bookings: number
  confirmedSales: number
  commissionStatus: 'pending' | 'confirmed' | 'paid'
}

// ---- Referral / Lead ----
type LeadStatus = 'pending-tour' | 'toured' | 'negotiating' | 'sale-confirmed' | 'cancelled'

interface Referral {
  id: string
  leadName: string                // Partially masked: "王○明"
  leadPhone?: string              // Partially masked
  kolId: string
  kolName: string
  propertyId: string
  propertyName: string
  referralDate: string
  tourDate?: string
  status: LeadStatus
  salePrice?: number
  commissionRate?: number         // TBD for now
  commissionAmount?: number       // TBD for now
}

// ---- Activity ----
type ActivityType = 'click' | 'booking' | 'tour-completed' | 'sale-confirmed' | 'commission-paid'

interface Activity {
  id: string
  type: ActivityType
  message: string
  messageEn: string
  timestamp: string
  kolId?: string
  propertyId?: string
}
```

---

## Page-by-Page Specifications

### Page 1: Public Apartment Landing Page (`/[locale]/properties/[slug]`)

This is the page KOLs share with their audience. It should feel like a **premium real estate listing** — think Airbnb listing meets luxury property brochure.

**URL structure**: `/zh-TW/properties/light-river?ref=sarah_chen`  
The `ref` query param simulates affiliate tracking. If present, show a subtle "您是由 Sarah Chen 推薦" / "Referred by Sarah Chen" note near the CTA.

**Sections (top to bottom):**

1. **Hero Section**
   - Large gradient placeholder area (since no real images) with a subtle home/building icon
   - Project name prominently displayed
   - Location with pin icon + nearest MRT station + walking distance
   - Price range in large text: "NT$ 1,680萬 ~ 3,200萬"
   - Status badge using shadcn Badge component: "預售中 Pre-sale"

2. **Key Highlights Bar**
   - Horizontal row of 4-5 stat cards using shadcn Card
   - Stats: Total Units (戶數), Size Range (坪數), Floors (樓層), Completion (交屋日期)
   - Each with a Lucide icon

3. **Photo Gallery / Renders**
   - CSS grid (2 columns on mobile, 3-4 on desktop) of placeholder cards
   - 6-8 items labeled: "客廳 Living Room", "主臥 Master Bedroom", "廚房 Kitchen", "浴室 Bathroom", "公設 Amenities", "外觀 Exterior", "中庭 Courtyard", "頂樓 Rooftop"
   - Each card: subtle gradient background + Camera icon + label
   - Hover effect: slight scale + shadow

4. **Floor Plans & Unit Layouts**
   - 3-4 cards in a row using shadcn Card
   - Each shows: Unit type name, Room configuration (房廳), Size in 坪, Price, placeholder floor plan icon
   - Highlight the most popular unit type

5. **Nearby Amenities**
   - Grid layout grouped by category with icons:
     - 🚇 捷運 MRT: Station name + walking time
     - 🏫 學校 Schools: 2-3 nearby schools
     - 🌳 公園 Parks: 2-3 parks with distance
     - 🛍️ 商圈 Shopping: Nearby shopping areas
     - 🏥 醫院 Hospitals: Nearest hospital
   - Use Lucide icons (Train, School, Trees, ShoppingBag, Hospital)

6. **Construction Timeline**
   - Horizontal progress/stepper component
   - Milestones: 動工 Groundbreaking (completed) → 基礎工程 Foundation (completed) → 結構體 Structure (in progress) → 裝修 Interior (upcoming) → 交屋 Handover (upcoming)
   - Expected completion date highlighted

7. **Book a Tour CTA**
   - Visually prominent section with a different background color
   - Two side-by-side options:
     - **LINE Button**: Green branded button, "透過LINE預約看屋 / Book via LINE", links to `#`
     - **Contact Form**: Using shadcn Input, Select, Textarea, Button — fields: Name, Phone, Email, Preferred Date (date picker), Message
   - If `ref` param exists, show: "您是由 [KOL Name] 推薦 / Referred by [KOL Name]" with a subtle badge
   - Form submit is non-functional (just show a toast/alert: "感謝您的預約！/ Thank you for your booking!")

8. **Footer**
   - HomeKey 房客 branding
   - Disclaimer: "本頁面資訊僅供參考 / Information on this page is for reference only"
   - Copyright line

---

### Page 2: KOL Dashboard (`/[locale]/kol`)

The KOL's control center. Dashboard layout with a **left sidebar** for navigation.

**Sidebar Navigation:**
- 總覽 Overview (`/kol`)
- 推廣連結 My Links (`/kol/links`)
- 成效分析 Performance (`/kol/performance`)
- 佣金紀錄 Commissions (`/kol/commissions`)

**Overview Page (`/kol`):**

1. **Welcome Header**
   - "歡迎回來，Sarah Chen" / "Welcome back, Sarah Chen"
   - KOL tier badge (e.g., Gold 金牌) using shadcn Badge
   - Member since date

2. **Summary Stats** (4 cards in a row):
   - 合作案件 Active Projects: 3 (with Building icon)
   - 總點擊數 Total Clicks: 1,247 (with MousePointerClick icon)
   - 預約成功 Bookings: 38 (with CalendarCheck icon)
   - 累計佣金 Commission: "待定 TBD" (with DollarSign icon)
   - Each card: shadcn Card with icon, number, label, and a subtle trend indicator (+12% ↑)

3. **Affiliate Links Quick View**
   - shadcn Table showing top 3 active links
   - Columns: Project, Link (truncated with Copy button), Clicks, Bookings
   - "View All Links →" link to `/kol/links`

4. **Performance Chart**
   - Recharts AreaChart or LineChart
   - 30-day view of clicks (line) vs bookings (area)
   - Toggle between projects using shadcn Select

5. **Recent Activity Feed**
   - 5 most recent activities
   - Each item: icon + message + relative timestamp ("2小時前 / 2 hours ago")
   - Activity types: new click, new booking, tour completed, sale confirmed

**My Links Page (`/kol/links`):**
- Full table of all affiliate links
- Columns: Property Name, Status (Active/Paused), Link (with copy button + "Copied!" feedback), Clicks, Bookings, Confirmed Sales, Commission Status
- Search/filter bar

**Performance Page (`/kol/performance`):**
- Larger, more detailed charts
- Breakdown by property
- Date range picker
- Conversion funnel visualization: Clicks → Bookings → Tours → Sales

**Commissions Page (`/kol/commissions`):**
- Commission structure notice: "佣金結構將於正式上線後公布 / Commission structure will be announced at launch"
- Table: Property, Sale Date, Sale Price, Commission Rate (TBD), Amount (TBD), Status (Pending → Confirmed → Paid)
- Summary card showing total earned, pending, and paid

---

### Page 3: Admin Dashboard (`/[locale]/admin`)

Master control panel for platform operators.

**Sidebar Navigation:**
- 總覽 Overview (`/admin`)
- 建案管理 Projects (`/admin/projects`)
- KOL管理 KOLs (`/admin/kols`)
- 推薦紀錄 Referrals (`/admin/referrals`)
- 系統設定 Settings (`/admin/settings`)

**Overview Page (`/admin`):**

1. **Platform Stats** (5-6 metric cards):
   - Total Projects: 8
   - Active KOLs: 24
   - Referrals This Month: 342
   - Bookings This Month: 56
   - Confirmed Sales: 12
   - Commission Payable: TBD
   - Each with trend indicator vs. last month

2. **Quick Charts Row**:
   - Referrals trend (line chart, 7 days)
   - Top KOLs (horizontal bar chart, top 5)

3. **Recent Activity Log**
   - Combined feed of all platform activities
   - Filter tabs using shadcn Tabs: All | Referrals | Bookings | Sales

4. **Quick Actions**
   - Button group: "新增建案 Add Project", "邀請KOL Invite KOL", "匯出報表 Export Reports"

**Projects Page (`/admin/projects`):**
- shadcn Table with columns: Project Name, Developer, Location, Status, KOLs Assigned, Referrals, Bookings, Sales
- Row actions: Edit, Pause, View Landing Page
- "Add New Project" button opens a placeholder dialog/modal

**KOLs Page (`/admin/kols`):**
- Table: Name, Email, Tier, Active Projects, Clicks, Bookings, Sales, Commission Status, Joined Date
- Row actions: View Profile, Edit, Deactivate
- "Invite KOL" button

**Referrals Page (`/admin/referrals`):**
- Complete referrals table with all filters
- Filter by: Property, KOL, Status, Date Range
- Export button

**Settings Page (`/admin/settings`):**
- Placeholder sections: Commission Structure Settings, Platform Branding, Notification Settings
- All non-functional, just visual

---

### Page 4: Apartment Company Dashboard (`/[locale]/developer`)

What the apartment developer/company sees. Named "developer" in the URL for brevity (refers to the property developer, not software developer).

**Sidebar Navigation:**
- 總覽 Overview (`/developer`)
- 建案成效 Projects (`/developer/projects`)
- 客戶名單 Leads (`/developer/leads`)
- KOL表現 KOL Performance (`/developer/kols`)

**Overview Page (`/developer`):**

1. **Company Header**
   - Company name: "璞真建設 PureCity Development"
   - Active projects badge

2. **Summary Stats** (4 cards):
   - Active Projects: 2
   - Total KOL Referrals: 186
   - Tour Bookings: 42
   - Confirmed Sales: 8

3. **Project Performance Cards**
   - One card per project showing mini conversion funnel
   - Referrals → Bookings → Tours → Sales with numbers and percentages

4. **Recent Leads**
   - Top 5 most recent leads
   - "View All →" link to leads page

**Leads Page (`/developer/leads`) — CRITICAL PAGE:**
This is where the apartment company confirms sales.

- shadcn Table with columns:
  - Lead Name (masked: "王○明")
  - Referred By (KOL name)
  - Referral Date
  - Tour Date
  - Status: Badge with color coding
    - 待看屋 Pending Tour (yellow)
    - 已看屋 Toured (blue)
    - 議價中 Negotiating (orange)
    - 已成交 Sale Confirmed (green)
    - 已取消 Cancelled (red/gray)
  - Actions: **"確認成交 Confirm Sale"** button (only shown when status is "Negotiating")
- 8-10 rows of mock data in various statuses
- Clicking "Confirm Sale" should visually update the status to "已成交" with a success toast (this is the key interaction that triggers KOL commission)
- Filter by: Status, KOL, Date Range

**KOL Performance Page (`/developer/kols`):**
- Recharts BarChart comparing KOLs by referrals and conversion rate
- Table breakdown per KOL

---

## Internationalization (i18n)

Use `next-intl` for all text content.

**Supported Locales**: `en`, `zh-TW`  
**Default Locale**: `zh-TW`  
**URL Structure**: `/zh-TW/kol/links`, `/en/admin/projects`

**Language Toggle**: In the header — a simple button/dropdown that switches between "中文" and "EN". Switching should update the URL locale segment.

All visible text should come from translation files. This includes:
- Navigation labels
- Page titles and headings
- Button text
- Table headers
- Status labels
- Stat labels
- Placeholder text
- Toast messages
- Mock data display names should have both `name` and `nameEn` fields

---

## Mock Data Guidelines

Create realistic data in `src/data/` files:

**Properties (5-6 projects):**
| Project | Developer | Location | Price Range (萬) | Status |
|---------|-----------|----------|-----------------|--------|
| 璞真光河 | 璞真建設 | 新北市板橋區 | 1,680 ~ 3,200 | Pre-sale |
| 遠雄新未來 | 遠雄建設 | 桃園市中壢區 | 980 ~ 1,800 | Selling |
| 國泰禾 | 國泰建設 | 台北市信義區 | 3,500 ~ 6,800 | Pre-sale |
| 興富發天匯 | 興富發建設 | 台中市西屯區 | 1,200 ~ 2,500 | Selling |
| 潤泰敦峰 | 潤泰建設 | 台北市大安區 | 4,200 ~ 8,500 | Pre-sale |

**KOLs (6-8):**
- Sarah Chen (陳莎拉) — Gold tier, 450 clicks, 15 bookings
- Mike Wang (王大明) — Silver tier, 320 clicks, 8 bookings
- Lisa Lin (林佳慧) — Platinum tier, 890 clicks, 32 bookings
- Jason Huang (黃俊傑) — Bronze tier, 120 clicks, 3 bookings
- Amy Wu (吳美玲) — Gold tier, 560 clicks, 18 bookings
- David Tsai (蔡大衛) — Silver tier, 280 clicks, 10 bookings

**Currency**: Always use TWD with format `NT$ X,XXX萬` (萬 = 10,000)  
**Unit sizes**: In 坪 (ping), typically 15-60坪  
**Locations**: Use real Taiwan district names  

---

## Design System

### Colors (CSS Variables in globals.css)
- **Primary**: Deep teal (#0D9488 or similar) — for CTAs, active states, links
- **Secondary**: Warm gold (#D4A853 or similar) — for highlights, premium badges
- **Background**: Clean white (#FFFFFF) and light warm gray (#F9FAFB)
- **Text**: Dark charcoal (#1A1A2E) for headings, medium gray (#6B7280) for body
- **Success**: Green (#22C55E)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **LINE Green**: #06C755 (for LINE CTA buttons)

### Typography
- **Headings**: `Playfair Display` (serif, elegant) — imported from Google Fonts
- **Body / UI**: `DM Sans` or `Outfit` (clean sans-serif) — imported from Google Fonts
- **Chinese**: `Noto Sans TC` — imported from Google Fonts
- Set in Tailwind config with proper fallbacks

### Component Usage (shadcn/ui)
Install and use these shadcn components:
- `Button`, `Badge`, `Card`, `Table`, `Tabs`, `Input`, `Select`, `Textarea`
- `Dialog` (for modals), `Sheet` (for mobile sidebar)
- `DropdownMenu` (for role switcher, actions)
- `Toast` / `Sonner` (for copy confirmation, form submission)
- `Avatar` (for KOL profiles)
- `Separator`, `Skeleton` (for loading states)

### Responsive Design
- Mobile-first approach
- Sidebar collapses to hamburger menu on mobile
- Tables become scrollable or switch to card layout on small screens
- Property landing page is fully responsive

### Interactions & Animations
- Smooth page transitions (CSS or Framer Motion, keep it subtle)
- Hover effects on cards: slight lift + shadow
- Copy button feedback: "Copied!" toast or inline text change
- "Confirm Sale" button: Confirmation dialog → success toast → status update
- Chart hover tooltips
- Skeleton loading states on dashboard pages (even though data is instant, it demonstrates the pattern)

---

## Demo Navigation

Since this is a prototype, include a **role switcher** in the header for easy navigation between views:

- Use a shadcn `DropdownMenu` or `Select` in the header
- Options: "🏠 Public View" | "📱 KOL Dashboard" | "⚙️ Admin Panel" | "🏢 Developer Portal"
- Selecting a role navigates to that dashboard
- Current role is highlighted/active
- This makes it easy for investors to click through all perspectives during a demo

---

## README.md

Include a README with:
- Project description
- Tech stack
- Setup instructions (`pnpm install` → `pnpm dev`)
- Project structure overview
- Screenshots placeholder section
- Roadmap section mentioning: Real authentication, Supabase integration, Real affiliate tracking, Payment/commission system, LINE Official Account integration
- License (MIT or your choice)

---

## Important Notes for the Agent

1. **This is a visual prototype** — focus on making it look polished and professional. No real backend logic needed.
2. **All data is mock** — import from `src/data/` files. Structure the data access through hooks (`useMockData`) so it's easy to swap for real API calls later.
3. **shadcn/ui setup** — Initialize shadcn/ui properly with `npx shadcn-ui@latest init` and install needed components. Use the "New York" style variant for a cleaner look.
4. **Bilingual is critical** — Every piece of visible text must come from translation files. Test both languages.
5. **The "Confirm Sale" flow on the developer leads page is the most important interactive demo** — Make sure clicking it shows a confirmation dialog and updates the UI.
6. **Copy affiliate link interaction** — Must feel polished with proper feedback.
7. **Charts** — Use Recharts with the same color palette. Make them look professional.
8. **Mobile responsive** — The property landing page especially needs to look great on mobile since KOLs will share it with their followers who are mostly on phones.
9. **Code quality** — Use proper TypeScript types, consistent naming, clean component structure. This will go on GitHub and should look professional.
10. **Git-ready** — Include proper `.gitignore`, `README.md`, and clean commit-ready structure.
