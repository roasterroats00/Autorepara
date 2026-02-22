Car Service Finder - Frontend UI/UX & Navigation Plan
Overview
Dokumen ini menjelaskan arsitektur frontend, UI/UX design system, dan struktur navigasi untuk aplikasi Car Service Finder USA - direktori bilingual (EN/ES) untuk pencarian bengkel mobil berbasis lokasi.

User Review Required
IMPORTANT

Design Direction Confirmation Sebelum implementasi, konfirmasi preferensi visual:

Color Scheme: Professional blue/trust-based atau Modern orange/energetic?
Map Provider: Google Maps API atau Mapbox?
Animation Level: Minimal/subtle atau Rich micro-interactions?
1. Information Architecture
A. Sitemap & URL Structure
domain.com
/en - English
/es - Spanish
/en - Homepage
/en/[state] - State Page
/en/[state]/[city] - City Page
/en/[state]/[city]/[service] - Service in City
/en/[state]/[city]/[service]/[workshop] - Workshop Detail
/en/blog - Blog Listing
/en/blog/[slug] - Blog Article
/en/about - About Page
/en/contact - Contact Page
Same structure with /es prefix
B. Page Hierarchy
Level	Page Type	Purpose	Example URL
0	Homepage	Entry point, search, featured	/en, /es
1	State Landing	State overview, cities list	/en/texas
2	City Landing	City overview, services list	/en/texas/austin
3	Service Category	Workshops by service type	/en/texas/austin/brake-repair
4	Workshop Detail	Full workshop profile	/en/texas/austin/brake-repair/mikes-auto
2. UI/UX Design System
A. Color Palette
/* Primary - Trust & Reliability */
--primary-600: #2563EB;     /* Royal Blue */
--primary-500: #3B82F6;     /* Bright Blue */
--primary-100: #DBEAFE;     /* Light Blue BG */
/* Secondary - Energy & Action */
--secondary-600: #EA580C;   /* Deep Orange */
--secondary-500: #F97316;   /* Vibrant Orange */
/* Neutral */
--gray-900: #111827;        /* Headings */
--gray-700: #374151;        /* Body Text */
--gray-400: #9CA3AF;        /* Muted Text */
--gray-100: #F3F4F6;        /* Background */
/* Semantic */
--success: #10B981;         /* Open/Available */
--warning: #F59E0B;         /* Busy/Moderate */
--error: #EF4444;           /* Closed/Unavailable */
B. Typography Scale
Element	Font	Size	Weight	Usage
H1	Inter	48px/3rem	800	Page titles
H2	Inter	36px/2.25rem	700	Section headers
H3	Inter	24px/1.5rem	600	Card titles
Body	Inter	16px/1rem	400	Paragraphs
Small	Inter	14px/0.875rem	400	Captions, labels
Button	Inter	16px	600	CTAs
C. Component Library (Shadcn UI)
Components to Use:
├── Navigation
│   ├── NavigationMenu (Desktop nav)
│   ├── Sheet (Mobile drawer)
│   └── Breadcrumb
├── Search & Filter
│   ├── Command (Search dialog)
│   ├── Select (Dropdowns)
│   └── Input (Text fields)
├── Display
│   ├── Card (Workshop cards)
│   ├── Badge (Service tags)
│   ├── Avatar (Workshop logos)
│   └── Skeleton (Loading states)
├── Feedback
│   ├── Toast (Notifications)
│   └── Dialog (Modals)
└── Layout
    ├── Separator
    └── Accordion (FAQ)
3. Page Layouts & Wireframes
A. Homepage (/en, /es)
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [Logo]     [Home] [States▼] [Services▼] [Blog]    [EN|ES]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              HERO SECTION                            │    │
│  │  "Find Trusted Auto Repair Shops Near You"          │    │
│  │                                                      │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │ 🔍 Search by service, shop name, or city... │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  │  [📍 Use My Location]  [🔧 Browse Services]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  SERVICES AND REPAIRS IN THE UNITED STATES                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Row 1: Oil Change | Transmission Repair | Mobile AC  │    │
│  │ Row 2: Auto Locksmith | Hispanic Auto | Brake Repair │    │
│  │ Row 3: Window Tinting | Car Wash | Flat Tire Repair  │    │
│  │ Row 4: Tire Shop | Muffler & Exhaust | Wheel Align   │    │
│  │ Row 5: Car Inspection | Auto Electrician | Motorcycle│    │
│  │ Row 6: Auto Body & Paint | [View All Services →]     │    │
│  └──────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  FEATURED WORKSHOPS (Near You)                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐  │
│  │ [Img] Mike's Auto│ │ [Img] Best Brake │ │ [Img] ...   │  │
│  │ ⭐ 4.8 | Austin  │ │ ⭐ 4.7 | Austin  │ │ ...         │  │
│  │ Oil, Tire, Brake │ │ Brake Specialist │ │             │  │
│  └──────────────────┘ └──────────────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  BROWSE BY STATE                                             │
│  [Texas] [California] [Florida] [New York] [Illinois] ...   │
│                                              [View All →]    │
├─────────────────────────────────────────────────────────────┤
│  WHY CHOOSE US (Trust Signals)                              │
│  ✓ Verified Shops  ✓ Real Reviews  ✓ Direct Contact         │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  About | Contact | Privacy | Terms | Blog                   │
│  © 2025 CarServiceFinder. EN | ES                           │
└─────────────────────────────────────────────────────────────┘
B. City Landing Page (/en/texas/austin)
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Same as Homepage)                                   │
├─────────────────────────────────────────────────────────────┤
│ BREADCRUMB: Home > Texas > Austin                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CITY HERO                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🏙️ Auto Repair Shops in Austin, TX                  │    │
│  │ Find 127 trusted mechanics in the Austin area       │    │
│  │ ┌───────────────────────────────────────────┐       │    │
│  │ │ 🔍 Filter by service type...              │       │    │
│  │ └───────────────────────────────────────────┘       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  SERVICES IN AUSTIN                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ [Oil Change (45)] [Brake Repair (32)] [Tires (28)]│     │
│  │ [AC Service (21)] [Engine Repair (18)] [+12 more] │     │
│  └────────────────────────────────────────────────────┘     │
├──────────────────────────┬──────────────────────────────────┤
│  WORKSHOP LIST           │  MAP VIEW                        │
│  ┌────────────────────┐  │  ┌────────────────────────────┐  │
│  │ 📍 Mike's Auto     │  │  │                            │  │
│  │ ⭐ 4.8 (120 rev)   │  │  │      [Interactive Map]     │  │
│  │ 0.5 mi away        │  │  │                            │  │
│  │ [Oil] [Brake]      │  │  │    📍  📍                  │  │
│  │ [View Details →]   │  │  │       📍    📍             │  │
│  └────────────────────┘  │  │  📍       📍               │  │
│  ┌────────────────────┐  │  │                            │  │
│  │ 📍 Austin Auto Pro │  │  └────────────────────────────┘  │
│  │ ⭐ 4.6 (89 rev)    │  │                                  │
│  │ 1.2 mi away        │  │  [List View] [Map View]         │
│  └────────────────────┘  │                                  │
│  ... (pagination)        │                                  │
└──────────────────────────┴──────────────────────────────────┘
C. Workshop Detail Page (/en/texas/austin/brake-repair/mikes-auto)
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├─────────────────────────────────────────────────────────────┤
│ BREADCRUMB: Home > Texas > Austin > Brake Repair > Mike's   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ WORKSHOP HEADER                                       │   │
│  │ ┌────────┐  Mike's Auto Shop                         │   │
│  │ │ [Logo] │  ⭐ 4.8 (120 reviews) | Austin, TX        │   │
│  │ └────────┘  ✅ Verified Business                     │   │
│  │                                                       │   │
│  │ [📞 Call Now]  [📍 Get Directions]  [💬 Message]     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────────┬──────────────────────────────┤
│  LEFT COLUMN (65%)           │  RIGHT COLUMN (35%)          │
│                              │                              │
│  ABOUT                       │  📍 LOCATION & HOURS        │
│  AI-generated description    │  ┌────────────────────────┐  │
│  with local keywords...      │  │    [Static Map]        │  │
│                              │  │    📍                  │  │
│  SERVICES OFFERED            │  └────────────────────────┘  │
│  [Oil Change] [Brake Rep]    │  123 Main St, Austin TX     │
│  [Tire Service] [AC Repair]  │                              │
│                              │  Mon-Fri: 8AM - 6PM          │
│  GALLERY                     │  Sat: 9AM - 4PM              │
│  [img] [img] [img] [img]     │  Sun: Closed                 │
│                              │                              │
│  FAQ (AI Generated)          │  📞 CONTACT                  │
│  ▶ What services offered?    │  (512) 555-0123              │
│  ▶ How to book appointment?  │  info@mikesauto.com          │
│  ▶ Payment methods?          │                              │
│                              │  🔗 SHARE                    │
│                              │  [FB] [TW] [Copy Link]       │
└──────────────────────────────┴──────────────────────────────┘
│                                                              │
│  NEARBY WORKSHOPS (Related)                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Shop A  │ │ Shop B  │ │ Shop C  │ │ Shop D  │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
├─────────────────────────────────────────────────────────────┤
│  JSON-LD SCHEMA (LocalBusiness + Service)                   │
└─────────────────────────────────────────────────────────────┘
4. Admin Dashboard (Dark Theme)
Design Reference: Dark-themed admin panel with sidebar navigation, stats cards, and quick actions.

Admin Dashboard Reference
Review
Admin Dashboard Reference

A. Admin Layout Structure
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (Dark #0F172A)    │  MAIN CONTENT AREA                       │
│ ─────────────────────     │                                          │
│                           │  Good morning, Admin.                    │
│  MAIN                     │  Here's what's happening with your       │
│  ▶ Dashboard              │  directory today.        [● System Online]│
│    Pages                  │                                          │
│    Workshops              │ ┌─────────┐┌─────────┐┌─────────┐┌──────┐│
│    Services               │ │📊 Total ││👥 Active││🏪 Total ││⏳Pend││
│    Media Library          │ │Pageviews││ Users   ││Workshops││Review││
│                           │ │ 124.5k  ││  3.2k   ││  1,204  ││  14  ││
│  MANAGEMENT               │ │  ↑12%   ││  ↑5%    ││  ↑2%    ││  ↓1% ││
│    Bulk Import            │ └─────────┘└─────────┘└─────────┘└──────┘│
│    Users                  │                                          │
│    Settings               │  QUICK ACTIONS                           │
│                           │  ┌────────┐┌────────┐┌────────┐┌────────┐│
│  ─────────────────────    │  │➕ Add  ││📤Upload││📝 Edit ││👥Manage││
│  [Logout]                 │  │Workshop││ Media  ││ Home   ││ Users ││
│                           │  └────────┘└────────┘└────────┘└────────┘│
└───────────────────────────┴──────────────────────────────────────────┘
B. Bulk Import Page (/admin/bulk-import)
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  BULK IMPORT WORKSHOPS                                     │
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │  STEP 1: UPLOAD CSV FILE                           │   │
│         │  │  ┌──────────────────────────────────────────────┐  │   │
│         │  │  │                                              │  │   │
│         │  │  │     📁 Drag & drop your CSV file here       │  │   │
│         │  │  │         or click to browse                  │  │   │
│         │  │  │                                              │  │   │
│         │  │  │     Supported: .csv, .xlsx (max 10MB)       │  │   │
│         │  │  └──────────────────────────────────────────────┘  │   │
│         │  │  [📥 Download CSV Template]                        │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │  STEP 2: MAP COLUMNS                               │   │
│         │  │  ┌────────────────┬───────────────────────────┐    │   │
│         │  │  │ CSV Column     │ Map to Field              │    │   │
│         │  │  ├────────────────┼───────────────────────────┤    │   │
│         │  │  │ shop_name      │ [▼ Name]                  │    │   │
│         │  │  │ full_address   │ [▼ Address]               │    │   │
│         │  │  │ phone_number   │ [▼ Phone]                 │    │   │
│         │  │  │ services       │ [▼ Services (comma-sep)]  │    │   │
│         │  │  │ city           │ [▼ City]                  │    │   │
│         │  │  │ state          │ [▼ State Code]            │    │   │
│         │  │  └────────────────┴───────────────────────────┘    │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │  STEP 3: AI ENRICHMENT OPTIONS                     │   │
│         │  │  ☑ Generate unique descriptions (EN & ES)          │   │
│         │  │  ☑ Create SEO meta titles & descriptions           │   │
│         │  │  ☑ Generate FAQ from services                      │   │
│         │  │  ☑ Auto-translate to Spanish                       │   │
│         │  │  ☐ Geocode addresses (requires Google API)         │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  [Cancel]                    [▶ Start Import & Enrichment]│
└─────────┴────────────────────────────────────────────────────────────┘
C. Import Progress View
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  IMPORT IN PROGRESS                                        │
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │  📊 Processing 1,247 workshops...                   │   │
│         │  │  ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░  68%               │   │
│         │  │                                                     │   │
│         │  │  ✅ Parsed CSV: 1,247 rows                         │   │
│         │  │  ✅ Validated: 1,231 valid, 16 errors              │   │
│         │  │  🔄 AI Enrichment: 847 / 1,231                     │   │
│         │  │  ⏳ Database Insert: Waiting...                    │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │  ⚠️ VALIDATION ERRORS (16)              [View All] │   │
│         │  │  ├─ Row 23: Missing required field 'phone'         │   │
│         │  │  ├─ Row 156: Invalid state code 'Texas' use 'TX'   │   │
│         │  │  └─ Row 891: Duplicate entry detected              │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  [⏸ Pause]  [✕ Cancel Import]                             │
└─────────┴────────────────────────────────────────────────────────────┘
D. Workshop Management (/admin/workshops)
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  WORKSHOPS                          [+ Add Workshop]       │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │ 🔍 Search workshops...  │ State [▼] │ Status [▼]   │   │
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  ┌─────┬────────────────┬─────────┬────────┬──────────┐   │
│         │  │ ☐   │ Workshop Name  │ City    │ Status │ Actions  │   │
│         │  ├─────┼────────────────┼─────────┼────────┼──────────┤   │
│         │  │ ☐   │ Mike's Auto    │ Austin  │🟢 Live │ ✏️ 🗑️ 👁️ │   │
│         │  │ ☐   │ Best Brake TX  │ Houston │🟡 Draft│ ✏️ 🗑️ 👁️ │   │
│         │  │ ☐   │ Oil Pro Center │ Dallas  │🟢 Live │ ✏️ 🗑️ 👁️ │   │
│         │  │ ☐   │ Taller Mex     │ El Paso │🔴 Pend │ ✏️ 🗑️ 👁️ │   │
│         │  └─────┴────────────────┴─────────┴────────┴──────────┘   │
│         │                                                            │
│         │  Selected: 0  │ [Bulk Actions ▼]      Page 1 of 62 [<][>] │
└─────────┴────────────────────────────────────────────────────────────┘
E. Workshop Editor with Tiptap (/admin/workshops/[id])
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  EDIT WORKSHOP                      [Save Draft] [Publish] │
│         │                                                            │
│         │  ┌─────────────────────────────────┬──────────────────────┐│
│         │  │ MAIN INFO                       │ SEO PANEL            ││
│         │  │                                 │                      ││
│         │  │ Name:                           │ Meta Title (EN):     ││
│         │  │ [Mike's Auto Shop          ]    │ [                  ] ││
│         │  │                                 │                      ││
│         │  │ Slug (EN): [mikes-auto-shop]    │ Meta Desc (EN):      ││
│         │  │ Slug (ES): [taller-mikes   ]    │ [                  ] ││
│         │  │                                 │                      ││
│         │  │ Address:                        │ Meta Title (ES):     ││
│         │  │ [123 Main St, Austin TX    ]    │ [                  ] ││
│         │  │                                 │                      ││
│         │  │ Phone: [(512) 555-0123     ]    │ Meta Desc (ES):      ││
│         │  │                                 │ [                  ] ││
│         │  │ Services: [Oil][Brake][+Add]    │                      ││
│         │  └─────────────────────────────────┴──────────────────────┘│
│         │                                                            │
│         │  DESCRIPTION (ENGLISH)      [🤖 Generate with AI]          │
│         │  ┌────────────────────────────────────────────────────────┐│
│         │  │ [B] [I] [H1] [H2] [📷] [🔗] [/] Tiptap Toolbar         ││
│         │  │────────────────────────────────────────────────────────││
│         │  │ Mike's Auto Shop has been serving Austin...           ││
│         │  │ Type / for AI commands                                 ││
│         │  └────────────────────────────────────────────────────────┘│
│         │                                                            │
│         │  DESCRIPTION (SPANISH)      [🔄 Translate from English]    │
│         │  ┌────────────────────────────────────────────────────────┐│
│         │  │ El Taller Mike's ha estado sirviendo a Austin...      ││
│         │  └────────────────────────────────────────────────────────┘│
└─────────┴────────────────────────────────────────────────────────────┘
F. CMS Pages & Blog (/admin/pages)
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  PAGES & BLOG                              [+ New Page]    │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │ TYPE: [All ▼]  STATUS: [All ▼]  🔍 Search...         │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌─────┬────────────────────┬──────┬────────┬──────────┐  │
│         │  │ ☐   │ Title              │ Type │ Status │ Actions  │  │
│         │  ├─────┼────────────────────┼──────┼────────┼──────────┤  │
│         │  │ ☐   │ About Us           │ page │🟢 Live │ ✏️ 🗑️ 👁️ │  │
│         │  │ ☐   │ Privacy Policy     │ page │🟢 Live │ ✏️ 🗑️ 👁️ │  │
│         │  │ ☐   │ Oil Change Guide   │ blog │🟢 Live │ ✏️ 🗑️ 👁️ │  │
│         │  │ ☐   │ Winter Car Tips    │ blog │🟡 Draft│ ✏️ 🗑️ 👁️ │  │
│         │  └─────┴────────────────────┴──────┴────────┴──────────┘  │
└─────────┴────────────────────────────────────────────────────────────┘
G. Admin Color Palette (Dark Theme)
/* Admin Dashboard Colors */
--admin-bg: #0F172A;           /* Main background */
--admin-sidebar: #1E293B;      /* Sidebar background */
--admin-card: #1E293B;         /* Card backgrounds */
--admin-border: #334155;       /* Borders */
--admin-text: #F1F5F9;         /* Primary text */
--admin-muted: #94A3B8;        /* Secondary text */
/* Status Colors */
--status-online: #22C55E;      /* System online, Live */
--status-warning: #F59E0B;     /* Pending, Draft */
--status-error: #EF4444;       /* Offline, Error */
--status-info: #3B82F6;        /* Info badges */
/* Accent */
--admin-accent: #8B5CF6;       /* Purple accent */
--admin-hover: #334155;        /* Hover states */
5. Navigation System
A. Primary Navigation (Desktop)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [🚗 Logo]   Home   States ▼   Services ▼   Blog   |   EN | ES │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
              │         │           │
              │         │           └── Mega Menu: Oil Change,
              │         │               Brake Repair, Tire Service,
              │         │               AC Repair, Engine, Battery...
              │         │
              │         └── Mega Menu: States Grid (TX, CA, FL...)
              │             with city counts per state
              │
              └── Homepage
B. Mobile Navigation
┌───────────────────────────────────┐
│  [☰]  [🚗 Logo]           [🔍]   │
└───────────────────────────────────┘
   │
   └── Opens Slide-out Drawer:
       ┌─────────────────────────┐
       │  [✕ Close]              │
       ├─────────────────────────┤
       │  🏠 Home                │
       │  📍 States         [▸]  │  --> Expands to state list
       │  🔧 Services       [▸]  │  --> Expands to service list
       │  📝 Blog                │
       ├─────────────────────────┤
       │  🌐 Language            │
       │     ○ English           │
       │     ○ Español           │
       ├─────────────────────────┤
       │  📍 Use My Location     │
       └─────────────────────────┘
C. Breadcrumb Navigation
Implemented on all pages except homepage:

// Pattern
<Breadcrumb>
  <BreadcrumbItem href="/en">Home</BreadcrumbItem>
  <BreadcrumbItem href="/en/texas">Texas</BreadcrumbItem>
  <BreadcrumbItem href="/en/texas/austin">Austin</BreadcrumbItem>
  <BreadcrumbItem current>Brake Repair</BreadcrumbItem>
</Breadcrumb>
D. Footer Navigation
┌─────────────────────────────────────────────────────────────────┐
│  COMPANY          SERVICES           STATES           LEGAL    │
│  About Us         Oil Change         Texas            Privacy  │
│  Contact          Brake Repair       California       Terms    │
│  Blog             Tire Service       Florida          Cookie   │
│                   AC Repair          New York                  │
│                   View All →         View All →                │
├─────────────────────────────────────────────────────────────────┤
│  © 2025 CarServiceFinder  |  Made with ❤️ in USA  |  EN | ES   │
└─────────────────────────────────────────────────────────────────┘
5. Responsive Breakpoints
Breakpoint	Width	Layout Behavior
Mobile	< 640px	Single column, bottom nav, touch-optimized
Tablet	640-1024px	2-column grid, side navigation
Desktop	> 1024px	Full layout, mega menus, hover states
6. Component Structure (Next.js App Router)
src/
├── app/
│   ├── [lang]/                          # Dynamic language route
│   │   ├── page.tsx                     # Homepage
│   │   ├── layout.tsx                   # Lang-specific layout
│   │   ├── [state]/
│   │   │   ├── page.tsx                 # State landing
│   │   │   └── [city]/
│   │   │       ├── page.tsx             # City landing
│   │   │       └── [service]/
│   │   │           ├── page.tsx         # Service listing
│   │   │           └── [workshop]/
│   │   │               └── page.tsx     # Workshop detail
│   │   ├── blog/
│   │   │   ├── page.tsx                 # Blog listing
│   │   │   └── [slug]/page.tsx          # Blog article
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   └── api/                             # API routes
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── Breadcrumb.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchDialog.tsx
│   │   └── FilterSidebar.tsx
│   ├── workshop/
│   │   ├── WorkshopCard.tsx
│   │   ├── WorkshopDetail.tsx
│   │   ├── WorkshopMap.tsx
│   │   └── ServiceBadge.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── PopularServices.tsx
│   │   ├── FeaturedWorkshops.tsx
│   │   └── StateGrid.tsx
│   └── ui/                              # Shadcn components
├── lib/
│   ├── i18n/
│   │   ├── dictionaries/
│   │   │   ├── en.json
│   │   │   └── es.json
│   │   └── getDictionary.ts
│   └── utils.ts
└── middleware.ts                        # Language detection
7. SEO Implementation
A. Metadata Pattern per Page
// Example: Workshop Detail Page
export async function generateMetadata({ params }): Promise<Metadata> {
  const workshop = await getWorkshop(params.workshop);
  const lang = params.lang;
  
  return {
    title: lang === 'en' 
      ? `${workshop.name} - Auto Repair in ${workshop.city}, ${workshop.state}`
      : `${workshop.name} - Taller Mecánico en ${workshop.city}, ${workshop.state}`,
    description: workshop[`meta_desc_${lang}`],
    alternates: {
      canonical: `/${lang}/${params.state}/${params.city}/${params.service}/${params.workshop}`,
      languages: {
        'en-US': `/en/${params.state}/${params.city}/${workshop.slug_en}`,
        'es-US': `/es/${params.state}/${params.city}/${workshop.slug_es}`,
      },
    },
  };
}
B. JSON-LD Schema per Page Type
Page	Schema Types
Homepage	WebSite, Organization
State Landing	BreadcrumbList, ItemList
City Landing	BreadcrumbList, ItemList
Workshop Detail	LocalBusiness, Service, FAQPage, BreadcrumbList
Blog Article	Article, BreadcrumbList
8. Key User Flows
A. Primary Flow: Find a Workshop
Homepage
Search/Browse
City Page
Filter by Service
Workshop List
Workshop Detail
Call/Directions
B. Language Switch Flow
/en/texas/austin
Click 'ES' toggle
Middleware detects
Lookup ES equivalent slug
/es/texas/austin
Verification Plan
Manual Testing
Navigation Testing

Verify all navigation links work on desktop and mobile
Test language switcher preserves current page context
Confirm breadcrumbs display correctly at each level
Responsive Design

Test on Chrome DevTools at 375px, 768px, 1280px widths
Verify mobile menu opens/closes properly
Confirm touch targets are at least 44px
SEO Verification

Use browser DevTools to verify <link rel="alternate" hreflang="..."> tags
Check JSON-LD using Google Rich Results Test
Validate meta titles/descriptions per page
Next Steps
Setelah plan ini disetujui:

Initialize Next.js 15 project with TypeScript
Setup Tailwind CSS + Shadcn UI
Implement i18n middleware
Build core layout components (Header, Footer, Breadcrumb)
Create page templates for each level