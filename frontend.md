# DOCIT - Frontend Implementation Plan

## 🏗️ Architecture Overview

```
Next.js App (App Router)
    ├── Pages/Routes
    ├── Components (ShadCN UI)
    ├── State Management (React Context / Zustand)
    ├── API Client (Axios/Fetch)
    ├── Form Handling (React Hook Form + Zod)
    └── Styling (Tailwind CSS)
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard layout
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx            # Document list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx        # Document detail
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx        # Upload page
│   │   │   │
│   │   │   ├── workspaces/
│   │   │   │   ├── page.tsx            # Workspace list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Workspace detail
│   │   │   │
│   │   │   ├── search/
│   │   │   │   └── page.tsx            # Search page
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx            # Analytics dashboard
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx            # User settings
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts        # OAuth callback
│   │   │
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   │
│   ├── components/
│   │   ├── ui/                         # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentDetail.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   └── DocumentFilters.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── AISummary.tsx
│   │   │   ├── AITags.tsx
│   │   │   ├── ConflictDetection.tsx
│   │   │   ├── RiskIndicator.tsx
│   │   │   └── AIQuery.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── AdvancedSearch.tsx
│   │   │
│   │   ├── workspaces/
│   │   │   ├── WorkspaceCard.tsx
│   │   │   ├── WorkspaceList.tsx
│   │   │   └── WorkspaceMembers.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── DocumentChart.tsx
│   │   │   ├── RiskChart.tsx
│   │   │   └── ActivityTimeline.tsx
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── Pagination.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # Axios instance
│   │   │   ├── auth.api.ts
│   │   │   ├── documents.api.ts
│   │   │   ├── workspaces.api.ts
│   │   │   ├── search.api.ts
│   │   │   ├── ai.api.ts
│   │   │   └── analytics.api.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDocuments.ts
│   │   │   ├── useWorkspaces.ts
│   │   │   ├── useSearch.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts           # Date, file size formatters
│   │   │   ├── validators.ts           # Zod schemas
│   │   │   └── constants.ts
│   │   │
│   │   └── store/
│   │       ├── authStore.ts            # Auth state (Zustand)
│   │       └── documentStore.ts        # Document state
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── document.types.ts
│   │   ├── workspace.types.ts
│   │   └── api.types.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── images/
│   └── icons/
│
├── components.json                     # ShadCN config
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

## 🎨 UI/UX Features

### 1. Authentication Pages

**Login Page:**
- Email/password form
- Google OAuth button
- "Remember me" checkbox
- Forgot password link
- Link to register page

**Register Page:**
- Name, email, password fields
- Password strength indicator
- Terms & conditions checkbox
- Google OAuth option
- Link to login page

### 2. Dashboard Home

**Overview Cards:**
- Total documents
- Recent uploads
- High-risk documents count
- Policy conflicts count

**Quick Actions:**
- Upload document button
- Quick search bar
- Recent documents list
- Activity feed

**Charts:**
- Documents by category (pie chart)
- Uploads over time (line chart)
- Risk distribution (bar chart)

### 3. Document Management

**Document List Page:**
- Grid/List view toggle
- Filters (date, category, risk level, tags)
- Sort options (date, name, size)
- Search bar
- Pagination
- Bulk actions (delete, move to workspace)

**Document Card Component:**
- Thumbnail/preview
- Title
- Upload date
- File size
- Tags
- Risk indicator badge
- Quick actions (view, download, delete)

**Document Detail Page:**
- Document preview (PDF viewer)
- Metadata panel
- AI Summary section
- Tags display
- Conflict detection results
- Risk analysis
- Activity log
- Download button
- Edit metadata button

**Upload Page:**
- Drag & drop file upload
- File list with progress
- Workspace selection
- Category selection
- Auto-processing indicator
- Success/error notifications

### 4. AI Features

**AI Summary Component:**
- Expandable summary card
- Key points list
- Loading state during generation

**AI Tags Component:**
- Tag chips display
- Add/remove tags
- Tag suggestions

**Conflict Detection:**
- List of conflicting documents
- Comparison view
- Conflict details

**Risk Indicator:**
- Color-coded badges (low/medium/high)
- Risk factors list
- Risk score visualization

**AI Query Interface:**
- Chat-like interface
- Query input
- Results display
- Source document references
- Follow-up questions

### 5. Search & Discovery

**Search Page:**
- Large search bar
- Recent searches
- Popular searches
- Search filters sidebar
- Results list with highlights
- Advanced search modal

**Search Results:**
- Relevance score
- Highlighted snippets
- Document preview
- Quick actions

### 6. Workspace Management

**Workspace List:**
- Workspace cards
- Create workspace button
- Member count
- Document count

**Workspace Detail:**
- Workspace info
- Member list with roles
- Document list
- Settings (for admins)
- Invite members

### 7. Analytics Dashboard

**Overview Metrics:**
- Total documents
- Documents by category
- Risk distribution
- Conflict count
- Upload trends

**Charts:**
- Document uploads over time (Line chart)
- Category distribution (Pie chart)
- Risk levels (Bar chart)
- Activity heatmap
- Top tags (Word cloud)

**Reports:**
- Exportable reports
- Date range selection
- Custom filters

### 8. Settings Page

**User Profile:**
- Avatar upload
- Name, email
- Password change
- Notification preferences

**Workspace Settings:**
- Workspace name, description
- Member management
- Permissions

## 🎯 Component Library (ShadCN UI)

**Core Components:**
- Button
- Input
- Card
- Dialog/Modal
- Dropdown Menu
- Select
- Checkbox
- Radio Group
- Switch
- Tabs
- Table
- Badge
- Avatar
- Toast/Notification
- Skeleton (loading states)
- Progress
- Tooltip
- Popover
- Sheet (mobile sidebar)

**Custom Components:**
- DocumentCard
- RiskBadge
- ConflictAlert
- AISummaryCard
- SearchBar
- FileUpload
- PDFViewer
- Chart components (using Recharts)

## 🔧 Technology Stack Details

### Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.1.6",
  "tailwindcss": "^3.3.3",
  "axios": "^1.5.0",
  "react-hook-form": "^7.45.4",
  "zod": "^3.22.2",
  "@hookform/resolvers": "^3.3.2",
  "zustand": "^4.4.1",
  "recharts": "^2.8.0",
  "react-pdf": "^7.5.1",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.263.1",
  "clsx": "^2.0.0",
  "tailwind-merge": "^1.14.0"
}
```

### Dev Dependencies
```json
{
  "@types/node": "^20.5.0",
  "@types/react": "^18.2.20",
  "@types/react-dom": "^18.2.7",
  "autoprefixer": "^10.4.15",
  "postcss": "^8.4.29",
  "eslint": "^8.47.0",
  "eslint-config-next": "^14.0.0"
}
```

## 🎨 Design System

### Color Palette
- Primary: Blue (documents, actions)
- Success: Green (success states)
- Warning: Yellow/Orange (warnings)
- Danger: Red (risks, errors)
- Neutral: Gray (text, backgrounds)

### Typography
- Headings: Inter/Sans-serif
- Body: Inter/Sans-serif
- Monospace: For code/technical content

### Spacing
- Consistent spacing scale (4px base)
- Tailwind spacing utilities

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile navigation (hamburger menu)
- Responsive tables/cards

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Next.js project setup
- [ ] Tailwind CSS + ShadCN UI setup
- [ ] Project structure
- [ ] Root layout & navigation
- [ ] Authentication pages (login/register)
- [ ] API client setup
- [ ] Auth context/store

### Phase 2: Core Features (Week 2)
- [ ] Dashboard home page
- [ ] Document list page
- [ ] Document detail page
- [ ] Document upload functionality
- [ ] Basic document card component
- [ ] File upload with drag & drop

### Phase 3: AI Integration (Week 3)
- [ ] AI summary component
- [ ] Tag display & management
- [ ] Conflict detection UI
- [ ] Risk indicator components
- [ ] AI query interface
- [ ] Loading states for AI operations

### Phase 4: Advanced Features (Week 4)
- [ ] Search page & functionality
- [ ] Advanced search filters
- [ ] Workspace management pages
- [ ] Analytics dashboard
- [ ] Charts & visualizations
- [ ] Settings page

### Phase 5: Polish & Optimization (Week 5)
- [ ] Responsive design refinement
- [ ] Loading states & skeletons
- [ ] Error handling & boundaries
- [ ] Toast notifications
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] SEO optimization

## 🔐 State Management

**Auth State (Zustand):**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void,
  refreshToken: () => Promise<void>
}
```

**Document State:**
- Server state: React Query or SWR
- Local state: useState/useReducer
- Form state: React Hook Form

## 📱 Responsive Design

**Mobile (< 768px):**
- Hamburger menu
- Stacked layouts
- Bottom navigation
- Simplified cards

**Tablet (768px - 1024px):**
- Sidebar can be collapsible
- Grid layouts (2 columns)

**Desktop (> 1024px):**
- Full sidebar
- Multi-column layouts
- Hover states
- Keyboard shortcuts

## 🎯 Key User Flows

1. **Upload Document Flow:**
   - Click upload → Select file → Choose workspace → Upload → View processing → View document

2. **Search Flow:**
   - Enter query → View results → Click result → View document detail

3. **AI Query Flow:**
   - Enter question → View AI response → Click source documents → View details

4. **Workspace Flow:**
   - Create workspace → Add members → Upload documents → View workspace

## 🧪 Testing Strategy

- Component testing (React Testing Library)
- Integration testing
- E2E testing (Playwright/Cypress)
- Visual regression testing

## 🚢 Deployment

- Platform: Vercel
- Environment variables
- Build optimization
- Image optimization
- API route handling
- Analytics integration

## 📊 Performance Optimization

- Code splitting
- Lazy loading components
- Image optimization
- API response caching
- Debounced search
- Virtualized lists for large datasets
- Service worker for offline support (future)

## ♿ Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management
- Semantic HTML

## 🌐 Internationalization (Future)

- i18n support
- Multi-language support
- Date/time localization
