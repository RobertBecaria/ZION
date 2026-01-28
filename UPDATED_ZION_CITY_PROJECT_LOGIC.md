# ZION.CITY Digital Platform: Project Logic & Architecture

**Version:** 6.0 (Updated January 2026)
**Status:** Production - All 8 Modules Live
**Repository:** github.com/RobertBecaria/ZION.2.0
**Production Server:** 212.41.8.199 (Ubuntu 24.04, i7-8700, 64GB RAM)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Logic](#system-logic)
4. [Data Models](#data-models)
5. [User Affiliations Structure](#user-affiliations-structure)
6. [Modules Overview](#modules-overview)
7. [Family Module - Complete Implementation](#family-module-complete-implementation)
8. [All Modules - Implementation Details](#all-modules-implementation-details)
9. [Cross-Module Features](#cross-module-features)
10. [Technical Architecture](#technical-architecture)
11. [Implementation Strategy](#implementation-strategy)
12. [Innovation Summary](#innovation-summary)
13. [Expected Outcomes](#expected-outcomes)
14. [Success Metrics](#success-metrics)
15. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Executive Summary

The ZION.CITY Digital Platform is a comprehensive digital ecosystem combining social networking, family management, education, commerce, finance, and AI assistance into a unified Russian-language web application. It utilizes a **"Centralized Profile, Contextual Modules"** paradigm where user data is entered once and intelligently transformed across 8 interconnected modules.

### Platform Status (January 2026)

All 8 core modules are **production-ready and deployed**:
- **425 API endpoints** across all modules
- **247+ frontend components** with React 19
- **112 MongoDB collections** for comprehensive data management
- **239+ Pydantic validation models** for type safety
- **ERIC AI Assistant** powered by DeepSeek V3.2 + Claude Sonnet 4.5
- **Altyn Coin** internal cryptocurrency with wallets and transactions
- **Real-time WebSocket chat** with voice messages, reactions, and attachments
- **Production server** running Docker with Nginx, Gunicorn, MongoDB 7, Redis 7

---

## Project Overview

### Mission

To create a unified digital ecosystem that fundamentally reimagines how citizens, businesses, and communities interact digitally. It aims to be a living, breathing digital community where information serves multiple purposes across different contexts, unlike disconnected service portals.

### Problem Addressed

Traditional digital platforms suffer from:

1. **Data Redundancy**: Users repeatedly enter the same information across services
2. **Context Blindness**: Systems fail to understand relationships between different aspects of users' lives
3. **Siloed Services**: Modules operate independently, missing opportunities for intelligent integration

### Solution

The platform offers a unified approach where:

1. User information is entered **once** and intelligently transformed across contexts
2. Every module understands and adapts to user relationships and affiliations
3. The system anticipates needs based on holistic user context
4. An AI assistant (ERIC) provides contextual help across all modules

---

## System Logic

### Core Platform Philosophy

1. **Single Source of Truth**
   - Every piece of user information exists in one authoritative location
   - Eliminates inconsistency and reduces user friction
   - **Example**: User's address entered once, used across Family, Services, Marketplace modules

2. **Context-Aware Transformation**
   - Data adapts its function based on where it's accessed
   - Creates multiple value streams from single data entries
   - **Example**: Work affiliation becomes professional profile in Services, team member in Organizations

3. **Intelligent Modularity**
   - Modules are interconnected components of a larger organism
   - Share data and functionality seamlessly
   - **Example**: Family event automatically adds to Calendar, notifies family members in Chat

4. **Progressive Disclosure**
   - Complexity revealed gradually
   - Shows users only what's relevant to their current context
   - **Example**: Family module shows profile completion modal only when needed

### User Experience Philosophy

**"Don't Make Me Think, Don't Make Me Repeat"**

Users should not have to:
- Enter the same information twice
- Wonder where to find a feature
- Manually connect related information
- Navigate between disconnected systems

### Context Engine

A system component that transforms data based on module context:

```
User Profile Data (Single Entry)
        |
Context Engine (Intelligent Transform)
        |
    +---+---+-------+---------+----------+
    |       |       |         |          |
  Family  Work  Services  Marketplace  Events
(Household) (Team) (Provider) (Seller) (Attendee)
```

### Smart Context Detection

The system intelligently detects actionable content within conversations using pattern matching for:

- Temporal events (dates, times)
- Appointments and meetings
- Reminders and tasks
- Birthdays and anniversaries
- Location-based actions

### Chat-to-Action Flow

Seamless flow from conversation to action:

```
User Types: "Let's meet tomorrow at 3pm"
        |
Smart Detection: Identifies date/time
        |
System Suggests: Create event?
        |
User Confirms: One-click action creation
        |
Event Added: Calendar + Notifications
```

---

## Data Models

### Database: MongoDB 7 (NoSQL)

All data is stored as BSON documents in MongoDB collections. The platform uses Motor (async driver) for non-blocking database operations.

#### 1. Users Collection (Central Identity)

**Purpose**: Stores core user information as single source of truth

**Document Structure**:
```javascript
{
  id: "UUID",
  email: "string (unique, indexed)",
  password_hash: "string (bcrypt, 12 rounds)",
  first_name: "string",
  last_name: "string",
  middle_name: "string (optional)",
  name_alias: "string (optional)",

  // Profile
  avatar_url: "string (optional)",
  profile_picture: "string (optional, base64)",
  bio: "string (optional)",
  date_of_birth: "datetime (optional)",
  gender: "MALE | FEMALE | IT (optional)",
  role: "ADMIN | ADULT | CHILD (default: ADULT)",
  profile_completed: "boolean",

  // Contact
  phone: "string (optional)",
  business_phone: "string (optional)",
  business_email: "string (optional)",

  // Address
  address_street: "string (optional)",
  address_city: "string (optional)",
  address_state: "string (optional)",
  address_country: "string (optional)",
  address_postal_code: "string (optional)",

  // Family
  marriage_status: "SINGLE | MARRIED | DIVORCED | WIDOWED (optional)",
  spouse_user_id: "UUID (optional)",
  spouse_name: "string (optional)",
  spouse_phone: "string (optional)",

  // Professional
  education: "string (optional)",
  business_address: "string (optional)",
  work_anniversary: "datetime (optional)",

  // Interests
  personal_interests: ["string"],

  // Privacy Settings (nested)
  privacy_settings: {
    family_show_address: true,
    family_show_phone: true,
    family_show_birthdate: true,
    family_show_spouse_info: true,
    work_show_department: true,
    work_show_team: true,
    work_show_manager: true,
    work_show_work_anniversary: true,
    work_show_job_title: true,
    public_show_email: false,
    public_show_phone: false
  },

  // Status
  is_active: true,
  is_verified: false,
  is_online: false,
  last_login: "datetime",
  last_seen: "datetime",

  // Timestamps
  created_at: "datetime",
  updated_at: "datetime",

  // Extensibility
  additional_user_data: {}
}
```

**Key Indexes**:
- `email` (unique)
- `phone`
- `(address_street, address_city, last_name)` for family matching
- `spouse_user_id`

---

#### 2. All MongoDB Collections (112 Total)

**User & Auth (7 collections)**:
`users`, `user_affiliations`, `affiliations`, `user_documents`, `profile_privacy_settings`, `user_follows`, `user_friendships`

**Family System (12 collections)**:
`family_profiles`, `family_members`, `family_posts`, `family_invitations`, `family_subscriptions`, `family_units`, `family_unit_members`, `family_unit_posts`, `family_students`, `family_join_requests`, `households`, `household_members`

**Work/Organizations (16 collections)**:
`organizations`, `work_organizations`, `work_members`, `work_memberships`, `work_organization_members`, `work_posts`, `work_post_comments`, `work_post_likes`, `work_teams`, `work_team_members`, `work_tasks`, `work_task_templates`, `work_change_requests`, `work_join_requests`, `work_departments`, `work_organization_events`, `work_notifications`

**Education (8 collections)**:
`teachers`, `school_memberships`, `work_students`, `student_grades`, `student_enrollment_requests`, `class_schedules`, `academic_events`, `departments`

**Chat & Messaging (6 collections)**:
`chat_groups`, `chat_group_members`, `chat_messages`, `direct_chats`, `direct_chat_messages`, `typing_status`

**News & Channels (7 collections)**:
`news_channels`, `news_posts`, `news_post_comments`, `news_post_likes`, `news_comment_likes`, `channel_subscriptions`, `channel_moderators`

**Social (8 collections)**:
`posts`, `post_comments`, `post_likes`, `post_reactions`, `comments`, `comment_likes`, `friend_requests`, `friendships`

**Journal/Calendar (4 collections)**:
`journal_posts`, `journal_post_comments`, `journal_post_likes`, `journal_comment_likes`

**Events/Goodwill (10 collections)**:
`goodwill_events`, `event_organizer_profiles`, `event_attendees`, `event_invitations`, `event_reviews`, `event_photos`, `event_chat`, `event_favorites`, `event_reminders`, `interest_groups`

**Services & Marketplace (6 collections)**:
`service_listings`, `service_bookings`, `service_reviews`, `marketplace_products`, `marketplace_favorites`, `inventory_items`

**Finance (5 collections)**:
`wallets`, `transactions`, `emissions`, `dividend_payouts`, `exchange_rates`

**News Events (1 collection)**:
`news_events`

**Media (2 collections)**:
`media_files`, `media_collections`

**AI/Agent (2 collections)**:
`agent_conversations`, `agent_settings`

**Notifications & Actions (3 collections)**:
`notifications`, `scheduled_actions`, `announcements`

**Admin (2 collections)**:
`admin_backups`, `chunked_upload_sessions`

**Other (3 collections)**:
`announcement_reactions`, `organization_follows`, `department_members`

---

## User Affiliations Structure

### The Power of Affiliations

The `user_affiliations` junction collection is the **heart of ZION.CITY's intelligence**.

### How It Works

```
+----------------+
|     User       |
|  Ivan Petrov   |
+--------+-------+
         |
         +---------------------------------------------+
         |                                             |
         +-- Affiliation 1                             |
         |   +-- Organization: ЗИОН Технологии         |
         |   +-- Role: Project Manager                 |
         |   +-- Type: COMPANY                         |
         |                                             |
         +-- Affiliation 2                             |
         |   +-- Organization: Гимназия №1             |
         |   +-- Role: Parent                          |
         |   +-- Type: EDUCATIONAL                     |
         |                                             |
         +-- Affiliation 3                             |
             +-- Organization: Теннисный клуб          |
             +-- Role: Member                          |
             +-- Type: CLUB                            |
```

### Contextual Transformation Examples

**Same User, Different Contexts**:

1. **In Organizations Module**: Shows as "Project Manager at ЗИОН Технологии"
2. **In Services Module**: Can offer professional services with auto-populated profile
3. **In Family Module**: Connected to child's school via "Parent" role
4. **In Events Module**: Sees tennis club events, can RSVP

### Family Module Integration

Family Units integrate with the affiliation system:

```
User Profile (Single Source)
        |
+-------+--------+
|   Affiliations  |
+-----------------+
| * Work          |---> Organizations Module
| * School        |---> Education Module (as parent)
| * Club          |---> Events Module
|                 |
| Family Units:   |
| * Family HEAD   |---> Family Module (as administrator)
| * Member of     |---> Can post on behalf of family
|   family        |---> Family posts show "Name (Family)"
+-----------------+
```

---

## Modules Overview

### The Eight Core Modules

Each module represents a fundamental aspect of digital life:

| Module | Purpose | Color | Endpoints | Status |
|--------|---------|-------|-----------|--------|
| **Family** | Personal relationships, household management | #30A67E | 33 | Complete |
| **News** | Information, channels, social networking | #1D4ED8 | 34 | Complete |
| **Journal** | Education, gradebook, academic calendar | #6D28D9 | 15 | Complete |
| **Services** | Professional services marketplace | #B91C1C | 14 | Complete |
| **Organizations** | Work, departments, tasks, teams | #C2410C | 79 | Complete |
| **Marketplace** | Product listings, inventory, favorites | #BE185D | 11 | Complete |
| **Finance** | Altyn Coin wallet, transactions, portfolio | #A16207 | 30 | Complete |
| **Events** | Community events, groups, tickets, QR | #8B5CF6 | 53 | Complete |

### Module Integration

**Not Silos, But Interconnected Contexts**

```
        User Profile (Core Data)
                |
        Context Engine
                |
    +-----------+----+----------+
    |           |    |          |
  Family    Work  Services  Events
    |           |    |          |
    +-----------+----+----------+
            Shared Data
      (Affiliations, Actions)
```

**Example Integration**:
1. User adds child's school to profile -> **User Affiliations** (EDUCATIONAL, role: Parent)
2. School appears in **Organizations** module -> Can view school announcements
3. School events appear in **Events** module -> Can RSVP
4. School schedule appears in **Journal** module -> Class schedules and gradebook
5. School fees can be paid via **Finance** module -> Altyn Coin payments

---

## Family Module - Complete Implementation

### Overview

**Status**: Production Ready
**Architecture**: NODE & SUPER NODE
**Endpoints**: 33 backend API endpoints
**Frontend Components**: 8+ dedicated components

### Key Innovation: NODE & SUPER NODE Architecture

```
+-----------------------------------------------------------+
|              Address: ул. Ленина, д. 10                    |
|              (Physical Location)                           |
+-----------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+ |
|  |        HOUSEHOLD (SUPER NODE)                         | |
|  |        "Семья Петровых"                               | |
|  +------------------------------------------------------+ |
|  |                                                        | |
|  |  +---------------------+  +---------------------+    | |
|  |  | FAMILY UNIT (NODE)  |  | FAMILY UNIT (NODE)  |    | |
|  |  | "Иван и Мария"      |  | "Алексей и Ольга"   |    | |
|  |  +---------------------+  +---------------------+    | |
|  |  | * Иван (HEAD)       |  | * Алексей (HEAD)    |    | |
|  |  | * Мария (SPOUSE)    |  | * Ольга (SPOUSE)    |    | |
|  |  | * Петя (CHILD)      |  | * Маша (CHILD)      |    | |
|  |  +---------------------+  +---------------------+    | |
|  |                                                        | |
|  +------------------------------------------------------+ |
|                                                            |
+-----------------------------------------------------------+
```

**Concept**:
- **NODE**: Nuclear family (one household)
- **SUPER NODE**: Multiple families at same address
- Each NODE maintains independence
- SUPER NODE enables household-level features

### Core Features

1. **Automatic Profile Completion System** - Modal questionnaire for address and marriage info
2. **Intelligent Family Matching** - Address + surname + phone scoring (2/3 threshold)
3. **Democratic Voting System** - Majority approval for new members
4. **Family Post System** - Three visibility levels (FAMILY_ONLY, HOUSEHOLD_ONLY, PUBLIC)
5. **Family Dashboard** - Multi-family support, role-based features
6. **Join Request Management** - Vote tracking with progress indicators
7. **Household Management** - Create/manage households with multiple families
8. **Children Tracking** - School enrollment, grades

### Security & Permissions

| Action | HEAD | SPOUSE | CHILD | PARENT |
|--------|------|--------|-------|--------|
| View posts | Yes | Yes | Yes | Yes |
| Create posts | Yes | Yes | Yes | Yes |
| Send invites | Yes | No | No | No |
| Vote on requests | Yes | No | No | No |
| Edit family | Yes | No | No | No |

---

## All Modules - Implementation Details

### News / Community Module

**Color**: #1D4ED8 | **Endpoints**: 34 | **Status**: Complete

**Features**:
- News channels with categories and moderation
- Channel creation, subscription, and notification settings
- News feed with posts, likes, comments
- User profiles and social interactions
- Friends, followers, following system
- People discovery with recommendations
- News events (meetups, concerts, broadcasts)
- Channel moderator management
- Organization-linked channels

**Frontend Components**: NewsFeed, ChannelView, ChannelsPage, NewsUserProfile, FriendsPage, PeopleDiscovery, NewsWorldZone, NewsEventsPanel

---

### Journal / Education Module

**Color**: #6D28D9 | **Endpoints**: 15 | **Status**: Complete

**Features**:
- School enrollment and class management
- Student gradebook with grades by class
- Academic calendar with events and RSVP
- Teacher profiles and schedules
- School dashboard with audience filters
- Class schedules
- Wishlist system for events
- Classmate discovery
- Journal posts with comments and likes

**Frontend Components**: EventPlanner, UniversalCalendar, StudentGradebook, ClassSchedule, MyClassesList, StudentsList, SchoolTiles, AcademicCalendar

---

### Services Module

**Color**: #B91C1C | **Endpoints**: 14 | **Status**: Complete

**Features**:
- Service listings across categories
- Service booking with calendar slots
- Available time slot calculation
- Reviews and ratings system with helpfulness voting
- Provider profiles and reply to reviews
- Booking management with status updates
- Service categories

**Frontend Components**: ServicesSearch, ServiceProviderProfile, ServicesMyProfile, ServiceBookingCalendar, ServicesBookings, ServicesReviews, ServiceListingForm

---

### Organizations / Work Module

**Color**: #C2410C | **Endpoints**: 79 (largest module) | **Status**: Complete

**Features**:
- Organization creation (COMPANY, EDUCATIONAL, etc.)
- Department and team management
- Work announcements with reactions
- Task management with templates, subtasks, deadlines
- Member roles and permissions
- Join requests and approvals with change requests
- Work events and calendar with RSVP
- Organization analytics
- Student enrollment for schools
- Teacher management and schedules
- Grade management by class
- Transfer ownership
- ERIC AI settings per organization
- Work notifications system
- Task calendar view

**Frontend Components**: WorkOrganizationProfile, WorkDepartmentManagementPage, WorkAnnouncementsList, WorkTaskCreateModal, WorkTaskCard, WorkJoinRequests, WorkSearchOrganizations, WorkSetupPage, WorkOrganizationList, WorkTeamManager, WorkOrganizationSettings

---

### Marketplace Module

**Color**: #BE185D | **Endpoints**: 11 | **Status**: Complete

**Features**:
- Product listings with categories
- Personal inventory (My Things)
- Favorites management
- List inventory items for sale
- Warranty tracking
- Product search and filtering
- Marketplace categories

**Frontend Components**: MarketplaceSearch, MarketplaceProductDetail, MarketplaceListingForm, MyListings, MyThings, MyThingsItemForm, MarketplaceFavorites, MarketplaceProductCard

---

### Finance Module

**Color**: #A16207 | **Endpoints**: 30 | **Status**: Complete

**Features**:
- Altyn Coin wallet management
- Token portfolio and holdings
- Token transfers between users
- Transaction history with search
- Corporate wallets for organizations
- Exchange rates tracking
- Marketplace and service payments
- Token holders list
- Treasury overview
- Admin: Token emission and initialization
- Admin: Dividend distribution
- Admin: Welcome bonuses
- Admin: Master wallet management
- Admin: Transaction reversal

**Frontend Components**: WalletDashboard, SendCoins, TransactionHistory, ExchangeRates, TokenPortfolio, CorporateWallets, AdminFinance

---

### Events / Good Will Module

**Color**: #8B5CF6 | **Endpoints**: 53 | **Status**: Complete

**Features**:
- Community event creation and management
- Interest groups with join functionality
- RSVP and ticket purchasing
- Event photos and reviews
- Event chat (real-time)
- QR code check-in
- Organizer profiles with team members
- Wishlist management
- Favorites and reminders
- Co-organizer management
- Event sharing
- Event invitations
- Calendar view
- Event categories

**Frontend Components**: GoodWillEventForm, GoodWillEventDetail, GoodWillSearch, GoodWillCalendar, GoodWillMyEvents, GoodWillGroups, GoodWillInvitations, GoodWillOrganizerProfile, EventPhotosTab, EventReviewsTab, EventChatTab, EventPaymentModal

---

## Cross-Module Features

### Authentication & User Management

- JWT-based (HS256) with Bearer tokens
- 60-minute expiration (production), 30-minute (development)
- Separate admin authentication
- Bcrypt password hashing (12 rounds)
- User registration, login, password change, account deletion
- Profile picture upload/deletion
- User search and suggestions
- Dynamic profile views
- Privacy settings management

### Real-Time Chat (WebSocket)

- WebSocket at `/api/ws/chat/{chatId}`
- Group chats and direct messages
- Typing indicators
- Message read receipts and status updates
- Voice messages (record + playback)
- Emoji reactions on messages
- File attachments
- Message editing and deletion
- Message forwarding
- Message search
- Scheduled actions (reminders, tasks)
- Auto-reconnection with heartbeat

**Frontend Components**: ChatConversation, DirectChatList, MessageBubble, VoiceRecorder, EmojiPicker, MessageContextMenu

### ERIC AI Assistant

- Persistent conversation history (30-day retention)
- Document analysis (PDF, DOCX, XLSX via DeepSeek V3.2)
- Image analysis (via Claude Sonnet 4.5 Vision)
- Platform data search
- Business queries per organization
- Post mentions
- User-configurable privacy settings
- Multi-language (Russian/English auto-detect)
- Custom ERIC settings per work organization

**Frontend Components**: ERICChatWidget, ERICProfile, ERICAnalyzeButton, ERICSearchCards, MediaPicker

### Notifications System

- Real-time notification delivery
- 30-day TTL auto-expiration
- Unread count tracking
- Mark as read (individual and bulk)
- Notification deletion
- Work-specific notifications

**Frontend**: NotificationDropdown

### Media Storage

- File upload with user/module organization
- Supports: images (PNG, JPG, WEBP, GIF), documents (PDF, DOCX, XLSX), audio (MP3, WAV, MP4)
- 10MB max upload size
- Media collections
- Cross-module media access
- Module-specific media browsing

**Frontend**: MediaStorage, ProfileImageUpload

### Social Features

- Posts with likes, comments, emoji reactions
- Friend requests and friendships
- Follow/unfollow users and organizations
- User search and discovery
- Profile privacy settings
- Wall/feed posts
- Comment editing and deletion

### Admin Panel

- User management (view, edit, delete, reset password)
- Finance management (token emission, dividends, welcome bonuses)
- Database backup and restoration (chunked upload/download)
- Master wallet management
- Transaction reversal
- Financial statistics and analytics

**Frontend Components**: AdminDashboard, AdminUserManagement, AdminAltynManagement, AdminDatabaseManagement

---

## Technical Architecture

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.0.0 | UI framework |
| React Router | 7.5.1 | Client-side routing |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Radix UI / shadcn | 40+ components | Accessible component library |
| Lucide React | 0.507.0 | Icon library |
| React Hook Form | 7.56.2 | Form management |
| Zod | 3.24.4 | Schema validation |
| FullCalendar | 6.1.19 | Calendar views |
| Leaflet | 1.9.4 | Maps |
| 2GIS MapGL | 1.67.0 | Russian maps |
| Embla Carousel | 8.6.0 | Carousels |
| Date-fns | 2.30.0 | Date utilities |
| Axios | 1.8.4 | HTTP client |
| Craco | 7.1.0 | Build configuration |

**Component Count**: 247+ files across 8 modules

**State Management**:
- AuthContext: User auth, login/logout, token management
- AppContext: Global navigation, module state, UI state
- Custom Hooks: useChatWebSocket, useFamilyData, useOrganizationsData
- Local State: useState for component-level state

**CSS / Styling**:
- Tailwind CSS 3.4.17 (primary)
- 5 CSS skin variants in `/skins/`
- Module-based color system
- CSS custom properties for theming

---

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11.8 | Runtime |
| FastAPI | 0.110.1 | Web framework (async) |
| Uvicorn | 0.25.0 | ASGI server |
| Gunicorn | Latest | Process manager |
| MongoDB | 7 | Primary database |
| Motor | 3.3.1 | Async MongoDB driver |
| PyMongo | 4.5.0 | MongoDB driver |
| Redis | 7-alpine | Caching & sessions |
| PyJWT | 2.10.1 | JWT authentication |
| BCrypt | 4.0.1 | Password hashing (12 rounds) |
| Pydantic | 2.11.7 | Data validation (239+ models) |
| HTTPX | 0.28.1 | Async HTTP client |
| Pillow | 12.0.0 | Image processing |
| QRCode | 8.2 | QR code generation |
| Stripe | 14.1.0 | Payment processing |

**AI Integration**:

| Service | SDK Version | Model | Purpose |
|---------|-------------|-------|---------|
| DeepSeek | via OpenAI 1.99.9 | V3.2 (deepseek-chat) | Text chat, document analysis |
| Anthropic | 0.40.0 | Claude Sonnet 4.5 | Image/vision analysis |
| LiteLLM | 1.80.0 | Multi-provider | LLM routing |

**Document Processing**:
- PyPDF2 3.0.1 (PDF extraction)
- python-docx 1.2.0 (DOCX parsing)
- openpyxl 3.1.5 (XLSX parsing)

**Backend Code**: server.py (~27,840 lines) + eric_agent.py (~1,701 lines)

---

### API Architecture

**Structure**: RESTful API with `/api` prefix

**Endpoint Summary**:
| Module | Endpoint Count |
|--------|---------------|
| Authentication & Users | 30+ |
| Family | 33 |
| News & Channels | 34 |
| Work & Organizations | 79 |
| Education/Journal | 15 |
| Chat & Messaging | 23 |
| Social (Posts, Friends) | 20+ |
| Services | 14 |
| Marketplace & Inventory | 11 |
| Finance | 30 |
| Events / Good Will | 53 |
| ERIC AI Agent | 16 |
| Media & Files | 7 |
| Admin Dashboard | 39 |
| Notifications | 4 |
| Utilities | 5+ |
| **Total** | **~425 endpoints** |

**WebSocket**: 1 endpoint (`/api/ws/chat/{chat_id}`)

**Authentication**:
- JWT tokens (Bearer, HS256)
- Stored in localStorage as `zion_token`
- 60-minute expiration (production)
- Optional authentication on some endpoints

---

### Infrastructure

**Docker Architecture**:
```
+-------------------------------+
|  Docker Compose Network       |
|  (zion-network: 172.28.0.0)   |
|                               |
|  +----------------------+     |
|  |  zion-city-app       |     |
|  |  Ports: 9080, 9443   |     |
|  |  +-- Nginx (12 wkrs) |     |
|  |  +-- Gunicorn (13w)  |     |
|  |  +-- React Build     |     |
|  |  Memory: 16GB/4GB    |     |
|  +----------+-----------+     |
|             |                 |
|  +----------+------+ +-----+ |
|  |  zion-mongodb   | |redis| |
|  |  Mongo 7        | |7-alp| |
|  |  Memory: 12GB   | | 5GB | |
|  +-----------------+ +-----+ |
+-------------------------------+
```

**Gunicorn Configuration**:
- Workers: 13 (2 x CPU cores + 1)
- Threads per worker: 4
- Total capacity: 52 concurrent requests
- Worker class: UvicornWorker
- Timeout: 120 seconds
- Max requests: 6000 per worker
- Bind: 0.0.0.0:8001

**Nginx Configuration**:
- Worker processes: 12
- Worker connections: 4096 per worker
- GZIP compression: level 6
- Static file caching: 1 year (immutable)
- Image caching: 30 days
- Rate limiting: 30 req/s API, 5 req/s AI

**Security Headers**:
- Content-Security-Policy (strict, no unsafe-inline)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: no geolocation/mic/camera
- AI crawler blocking (GPTBot, ChatGPT, CCBot, ClaudeBot)
- Hidden server version

**Docker Security**:
- Non-root execution (www-data)
- Multi-stage builds
- Health checks on all containers
- Read-only SSL cert mount

---

### Validation Layer

**239+ Pydantic models** provide comprehensive input validation:
- User registration and profile updates
- Family creation and membership
- Organization management
- Task creation with subtasks
- Financial transactions
- Event creation and RSVP
- Service listings and bookings
- Chat messages and attachments
- AI agent requests

---

## Implementation Strategy

### Development Phases

#### Phase 1: Foundation - Complete
- Core authentication (JWT)
- User profile management
- Basic module structure
- Family module with chat groups
- Onboarding wizard
- Universal chat layout

#### Phase 2: Integration - Complete
- Organization module
- User affiliations system
- Cross-module data flow
- Smart context detection
- Action scheduling system
- Media upload functionality
- Social features (likes, comments, reactions)

#### Phase 3: Intelligence - Complete
- Family Module (NODE & SUPER NODE architecture)
- Intelligent matching system
- Democratic voting system
- Post visibility controls
- Family dashboard
- ERIC AI Assistant (DeepSeek + Claude)

#### Phase 4: Full Platform - Complete
- News/Community module with channels
- Services module with bookings
- Marketplace with inventory
- Finance module (Altyn Coin)
- Events/Good Will module
- Education/Journal module
- Admin panel with database management
- Real-time WebSocket chat
- Notification system
- Media storage system

### Current Progress

| Component | Status | Completion |
|-----------|--------|------------|
| Authentication | Complete | 100% |
| User Management | Complete | 100% |
| Family Module | Complete | 100% |
| News/Community | Complete | 100% |
| Journal/Education | Complete | 100% |
| Services | Complete | 100% |
| Organizations/Work | Complete | 95% |
| Marketplace | Complete | 100% |
| Finance | Complete | 100% |
| Events/Good Will | Complete | 100% |
| Chat System | Complete | 100% |
| ERIC AI | Complete | 100% |
| Notifications | Complete | 100% |
| Media System | Complete | 100% |
| Admin Panel | Complete | 100% |

**Overall Platform Completion**: ~95%

---

## Innovation Summary

### Platform Features

1. **"Enter Once, Use Everywhere" Data Architecture**
   - Single profile, multiple contexts
   - Zero data redundancy

2. **Contextual Intelligence**
   - Data transforms based on usage context
   - Same affiliation, different meaning per module

3. **Unified Communication with Integrated Actions**
   - Chat with scheduled actions
   - WebSocket real-time messaging

4. **Smart Visual Adaptation**
   - Consistent design language
   - Module-specific color personalities
   - 5 CSS skin variants

5. **Privacy-First Design**
   - Granular control over data sharing per module
   - Family, work, and public privacy settings

6. **NODE & SUPER NODE Family Architecture**
   - Hierarchical family structure
   - Nuclear families maintain independence within households

7. **Intelligent Family Matching**
   - Automatic discovery via address + surname + phone scoring

8. **Democratic Family Governance**
   - Voting system for new members with majority approval

9. **ERIC AI Assistant**
   - Dual-model AI (DeepSeek for text, Claude for vision)
   - Document analysis (PDF, DOCX, XLSX)
   - Platform search integration
   - Business queries per organization

10. **Altyn Coin Financial System**
    - Internal cryptocurrency with wallets
    - Corporate wallets for organizations
    - Token emission and dividend distribution
    - Marketplace and service payments

11. **Community Events Platform**
    - QR code check-in
    - Ticket purchasing
    - Event chat, photos, reviews
    - Interest groups

12. **Real-Time WebSocket Chat**
    - Voice messages
    - Message reactions and forwarding
    - Typing indicators
    - File attachments

---

## Expected Outcomes

### For Users

- Seamless coordination across life domains
- Intelligent AI assistance via ERIC
- Complete control over personal data
- Simplified family management with automated matching
- Internal financial system (Altyn Coin)
- Community event participation with QR check-in
- Professional service marketplace

### For Organizations

- Unified platform for member engagement
- Department and team management
- Task management with templates
- Corporate wallets for financial operations
- Custom ERIC AI settings
- Analytics dashboard

### For Communities

- Event planning with ticket sales
- Interest groups and community building
- News channels and information sharing
- Service marketplace
- Altyn Coin economy

---

## Success Metrics

### Technical Performance (Current)

| Metric | Status |
|--------|--------|
| System uptime | Production |
| API endpoints | 425 |
| Frontend components | 247+ |
| MongoDB collections | 112 |
| Pydantic models | 239+ |
| Backend LOC | ~29,500 |
| Docker containers | 3 (app, mongodb, redis) |
| Gunicorn workers | 13 |
| Nginx workers | 12 |
| AI models | 2 (DeepSeek + Claude) |
| CSS skins | 5 |
| WebSocket endpoints | 1 |

### Security

- JWT authentication with role separation (user/admin)
- Bcrypt password hashing (12 rounds)
- Input validation with 239+ Pydantic models
- CORS origin whitelisting
- Rate limiting (API: 30/s, AI: 5/s)
- Content-Security-Policy headers
- Non-root Docker execution
- AI crawler blocking

---

## Known Issues & Technical Debt

### Active Issues

1. **`server.py` is monolithic** (~27,840 lines). Could benefit from splitting into module files.
2. **~30+ components use `process.env.REACT_APP_BACKEND_URL` directly** instead of centralized `config/api.js`. Fixed for News module, others remain.
3. **Missing `/api/news/posts/{post_id}/reaction` endpoint** - Frontend calls it but backend doesn't implement it.
4. **No CI/CD pipeline** - Deployment is manual via SSH and deploy.sh script.
5. **No monitoring/alerting** - No Prometheus, ELK, or Sentry integration.
6. **Frontend uses state-based navigation** instead of URL routing (React Router installed but not used for main navigation).

### Future Enhancements

1. Split server.py into module-based files
2. Add CI/CD pipeline
3. Add monitoring (Prometheus + Grafana)
4. Mobile application (React Native)
5. Push notifications
6. Demo account system for showcasing features

---

## Technical Dependencies

### Frontend

| Package | Version |
|---------|---------|
| React | 19.0.0 |
| React DOM | 19.0.0 |
| React Router DOM | 7.5.1 |
| Tailwind CSS | 3.4.17 |
| Radix UI | 1.x (40+ components) |
| Lucide React | 0.507.0 |
| React Hook Form | 7.56.2 |
| Zod | 3.24.4 |
| FullCalendar | 6.1.19 |
| Leaflet | 1.9.4 |
| Axios | 1.8.4 |
| Craco | 7.1.0 |
| Date-fns | 2.30.0 |

### Backend

| Package | Version |
|---------|---------|
| FastAPI | 0.110.1 |
| Python | 3.11.8 |
| Motor | 3.3.1 |
| PyMongo | 4.5.0 |
| Pydantic | 2.11.7 |
| PyJWT | 2.10.1 |
| BCrypt | 4.0.1 |
| HTTPX | 0.28.1 |
| OpenAI SDK | 1.99.9 |
| Anthropic SDK | 0.40.0 |
| LiteLLM | 1.80.0 |
| Pillow | 12.0.0 |
| PyPDF2 | 3.0.1 |
| python-docx | 1.2.0 |
| openpyxl | 3.1.5 |
| Stripe | 14.1.0 |
| QRCode | 8.2 |

### Infrastructure

| Component | Version |
|-----------|---------|
| Docker | Multi-stage build |
| MongoDB | 7 |
| Redis | 7-alpine |
| Nginx | Latest (12 workers) |
| Gunicorn | Latest (13 workers) |
| Supervisor | Latest |
| Node.js | 18.20.4 (build) |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name (zion_city) |
| `JWT_SECRET_KEY` | Yes | JWT signing secret (32+ chars) |
| `REDIS_URL` | Yes | Redis connection string |
| `ENVIRONMENT` | Yes | production / development |
| `CORS_ORIGINS` | Yes | Allowed origins |
| `DEEPSEEK_API_KEY` | Yes | DeepSeek AI API key |
| `EMERGENT_LLM_KEY` | Yes | Anthropic Claude API key |
| `ADMIN_USERNAME` | Yes | Admin panel username |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `MONGO_PASSWORD` | Yes | MongoDB root password |
| `DEBUG` | No | Debug mode (True/False) |
| `GUNICORN_WORKERS` | No | Worker count (default: 13) |
| `GUNICORN_THREADS` | No | Threads per worker (default: 4) |

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 6.0 | Jan 2026 | Complete rewrite reflecting production status with all 8 modules, accurate tech stack, 425 endpoints, 112 collections |
| 5.0 | Jan 2025 | Added Family Module Phase 4 implementation, NODE/SUPER NODE architecture |
| 4.0 | Dec 2024 | Updated with social features and media system |
| 3.0 | Nov 2024 | Added organizations and affiliations |
| 2.0 | Oct 2024 | Added chat system and action scheduling |
| 1.0 | Sep 2024 | Initial project logic document |

---

## Conclusion

The ZION.CITY platform is a production-deployed digital ecosystem with **all 8 core modules operational**. The platform has grown from a concept with a few implemented features to a comprehensive system with 425 API endpoints, 247+ frontend components, and 112 MongoDB collections.

### Key Achievements

- **Full Module Coverage**: All 8 modules (Family, News, Journal, Services, Organizations, Marketplace, Finance, Events) are production-ready
- **AI Integration**: Dual-model ERIC assistant with document and image analysis
- **Financial System**: Altyn Coin cryptocurrency with wallets, transfers, and corporate accounts
- **Real-Time Communication**: WebSocket chat with voice messages, reactions, and attachments
- **Robust Infrastructure**: Docker deployment with Nginx, Gunicorn, MongoDB, and Redis
- **Comprehensive Security**: JWT auth, bcrypt hashing, rate limiting, CSP headers, input validation

### Current Priorities

1. Fix remaining `process.env.REACT_APP_BACKEND_URL` inconsistencies across components
2. Add missing reaction endpoint for news posts
3. Consider splitting monolithic server.py into module files
4. Add CI/CD pipeline for automated deployments
5. Add monitoring and alerting

---

*Document updated from codebase analysis on January 28, 2026*
