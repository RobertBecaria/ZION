# ZION.CITY Platform - Product Requirements Document

## Original Problem Statement
Build and enhance the ZION.CITY social platform - a family-focused social network with AI assistant (ERIC) integration, financial tools (Altyn Coin), services marketplace, and community features.

## Core Requirements

### ERIC AI Assistant (Phase 1 - COMPLETE)
- Personal AI assistant powered by DeepSeek V3.2
- Floating chat widget with sun baby avatar
- Full profile page in "Вещи" (Things) module
- @ERIC mention feature for auto-commenting on posts
- Context-aware responses using platform data
- Russian language UI

### Family & Social Features
- Family wall with posts, comments, reactions
- News feed with public/family visibility
- Family member management
- Profile customization

### Financial Tools
- Altyn Coin digital currency system
- Transaction tracking
- Budget planning (future)

## What's Been Implemented

### 2025-01-03: ERIC Widget & Prompt Fixes
- Fixed floating widget blinking issue (CSS transitions)
- Fixed ERIC hallucinating settings (updated system prompt)
- ERIC now correctly says settings "don't exist yet" instead of making up menus

### Previous Session: ERIC AI Phase 1
- Backend: `/app/backend/eric_agent.py` - DeepSeek integration
- Frontend chat widget: `/app/frontend/src/components/eric/ERICChatWidget.js`
- Frontend profile: `/app/frontend/src/components/eric/ERICProfile.js`
- @ERIC mention auto-commenting on posts
- Virtual "eric-ai" user for AI-authored comments

### Previous Session: NewsFeed Refactoring
- Reduced NewsFeed.js by ~44% using reusable wall components
- Shared components in `/app/frontend/src/components/wall/`

## Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main server
- `/app/backend/eric_agent.py` - ERIC AI logic
- DeepSeek API integration via OpenAI SDK

### Frontend (React)
- `/app/frontend/src/components/eric/` - ERIC components
- `/app/frontend/src/components/wall/` - Shared post components
- Shadcn UI components in `/app/frontend/src/components/ui/`

### Database Collections
- `agent_conversations` - ERIC chat history
- `agent_settings` - User AI preferences
- `posts`, `news_posts` - Social content
- `post_comments`, `news_post_comments` - Comments

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Add "ERIC AI" as post visibility option

### P2 (Medium Priority)
- Advanced Financial Advice features
- AI Assistant Settings Page (control data access)
- Drag-and-drop image upload for ERIC chat

### Completed (2025-01-03)
- ✅ Image & Document Processing with Claude Sonnet 4.5 via Emergent LLM Key
- ✅ Image upload in ERIC chat widget
- ✅ Backend APIs: analyze-image, analyze-document, chat-with-image
- ✅ Platform Media Picker - browse photos/documents from Journal storage

## Key Files Modified This Session
- `/app/backend/eric_agent.py` - Added vision capabilities with Claude Sonnet
- `/app/backend/server.py` - New endpoints for image/document analysis
- `/app/frontend/src/components/eric/ERICChatWidget.js` - Image upload + media picker
- `/app/frontend/src/components/eric/MediaPicker.js` - NEW: Platform media browser

### P3 (Low Priority)
- ERIC-powered platform search
- Linter warning cleanup (jsx prop false positives)

## 3rd Party Integrations
- **DeepSeek** - AI/LLM (User API key in backend/.env)
- **Exchange Rate API** - Currency conversion
- **OpenStreetMap/Leaflet** - Maps
- **FullCalendar** - Calendar UI

## Test Credentials
- Admin: `admin@test.com` / `testpassword123`
- User: `testuser@test.com` / `testpassword123`
