# DOCIT - Backend Implementation Plan

## 🏗️ Architecture Overview

```
Client (Next.js)
    ↓
API Layer (Express.js + JWT + Zod)
    ↓
Service Layer (Business Logic)
    ├── AI Service (Google Gemini - free tier)
    ├── Document Service
    ├── Search Service (MongoDB Text Index)
    ├── Analytics Service
    └── Auth Service
    ↓
Data Layer
    ├── MongoDB Atlas (Documents, Users, Workspaces, ActivityLogs)
    └── File Storage (Multer → Local/Backblaze B2)
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   ├── multer.ts            # File upload config
│   │   ├── backblaze-b2.ts      # Backblaze B2 storage config
│   │   └── env.ts               # Environment variables validation
│   │
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── Document.ts          # Document schema
│   │   ├── Workspace.ts         # Workspace schema
│   │   ├── ActivityLog.ts      # Activity log schema
│   │   └── Tag.ts               # Tag schema
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── document.routes.ts   # Document CRUD routes
│   │   ├── workspace.routes.ts  # Workspace routes
│   │   ├── search.routes.ts     # Search routes
│   │   ├── ai.routes.ts         # AI query routes
│   │   └── analytics.routes.ts  # Analytics routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── document.controller.ts
│   │   ├── workspace.controller.ts
│   │   ├── search.controller.ts
│   │   ├── ai.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── gemini.service.ts        # Google Gemini API integration
│   │   │   ├── summary.service.ts       # Document summarization
│   │   │   ├── tag-extraction.service.ts # Tag extraction
│   │   │   ├── conflict-detection.service.ts # Policy conflict detection
│   │   │   └── risk-detection.service.ts # Risk flagging
│   │   │
│   │   ├── document.service.ts          # Document business logic
│   │   ├── search.service.ts            # Search logic
│   │   ├── analytics.service.ts          # Analytics aggregation
│   │   └── file-storage.service.ts      # File upload/download (Backblaze B2)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts           # JWT verification
│   │   ├── rbac.middleware.ts           # Role-based access control
│   │   ├── rate-limit.middleware.ts     # Rate limiting
│   │   ├── validation.middleware.ts     # Request validation (Zod)
│   │   └── error-handler.middleware.ts  # Error handling
│   │
│   ├── utils/
│   │   ├── pdf-parser.ts                # PDF text extraction
│   │   ├── logger.ts                    # Logging utility
│   │   └── constants.ts                 # Constants
│   │
│   ├── types/
│   │   ├── express.d.ts                 # Express type extensions
│   │   └── index.ts                     # Shared types
│   │
│   └── app.ts                           # Express app setup
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts                            # Entry point
```

## 🔑 Core Features & Implementation

### 1. Authentication & Authorization

**Routes:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT)
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

**Implementation:**
- JWT tokens (access + refresh)
- Google OAuth 2.0 integration
- Password hashing (bcrypt)
- Role-based access control (Admin, Manager, Viewer, Editor)

### 2. Document Management

**Routes:**
- `POST /api/documents/upload` - Upload PDF document
- `GET /api/documents` - List documents (with pagination, filters)
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document
- `GET /api/documents/:id/preview` - Preview document

**Implementation:**
- Multer for file uploads (handles multipart/form-data)
- PDF text extraction (pdf-parse or pdfjs-dist)
- Automatic metadata extraction (filename, size, upload date)
- File storage: Backblaze B2 (production) - S3-compatible object storage
  - Direct upload to Backblaze B2 buckets
  - Secure file URLs with expiration
  - File versioning support
  - Local storage fallback for development
- Document versioning support

### 3. AI Intelligence Layer

**Routes:**
- `POST /api/ai/summarize/:documentId` - Generate summary
- `POST /api/ai/extract-tags/:documentId` - Extract tags
- `POST /api/ai/detect-conflicts/:documentId` - Detect policy conflicts
- `POST /api/ai/detect-risks/:documentId` - Flag risks
- `POST /api/ai/query` - Natural language query across documents

**Implementation:**
- Google Gemini API integration (free tier - gemini-1.5-flash / gemini-1.5-pro)
- Async processing for AI tasks (queue system)
- Batch processing for multiple documents

**AI Prompts:**
- Summary: "Summarize this document in 3-5 bullet points..."
- Tags: "Extract 5-10 key tags from this document..."
- Conflicts: "Compare this document with existing policies and detect conflicts..."
- Risks: "Identify compliance risks and high-risk language..."
- Query: "Answer this question based on the following documents..."

### 4. Search & Discovery

**Routes:**
- `GET /api/search` - Full-text search
- `GET /api/search/advanced` - Advanced search with filters
- `GET /api/search/suggestions` - Search suggestions

**Implementation:**
- MongoDB text indexes on document content
- Search by title, content, tags, metadata
- Fuzzy search support
- Search result ranking
- Search history tracking

### 5. Workspace Management

**Routes:**
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - List workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member
- `DELETE /api/workspaces/:id/members/:userId` - Remove member

**Implementation:**
- Multi-workspace support
- Workspace-level permissions
- Document-workspace association
- Member management

### 6. Analytics & Reporting

**Routes:**
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/documents` - Document statistics
- `GET /api/analytics/risks` - Risk analytics
- `GET /api/analytics/conflicts` - Conflict analytics
- `GET /api/analytics/activity` - Activity logs

**Implementation:**
- MongoDB aggregation pipelines
- Time-based analytics (daily, weekly, monthly)
- Document trends
- Risk distribution
- User activity tracking

### 7. Activity Logging

**Implementation:**
- Log all document operations (create, update, delete, view)
- Log AI operations
- Log user actions
- Store in MongoDB ActivityLog collection
- Queryable for audit trails

## 🗄️ Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  role: 'admin' | 'manager' | 'editor' | 'viewer',
  googleId?: string,
  avatar?: string,
  workspaces: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```typescript
{
  _id: ObjectId,
  title: string,
  filename: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  uploadedBy: ObjectId (User),
  workspace: ObjectId,
  summary?: string,
  tags: string[],
  extractedText: string,
  aiProcessed: boolean,
  riskLevel: 'low' | 'medium' | 'high',
  conflicts: ObjectId[] (Document references),
  metadata: {
    uploadDate: Date,
    lastModified: Date,
    category?: string,
    department?: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Workspace Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  owner: ObjectId (User),
  members: [{
    user: ObjectId,
    role: 'admin' | 'editor' | 'viewer'
  }],
  documents: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityLog Collection
```typescript
{
  _id: ObjectId,
  user: ObjectId,
  action: string,
  resourceType: 'document' | 'workspace' | 'user',
  resourceId: ObjectId,
  details: object,
  timestamp: Date
}
```

## 🔧 Technology Stack Details

### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "zod": "^3.22.2",
  "multer": "^1.4.5-lts.1",
  "pdf-parse": "^1.1.1",
  "@google/generative-ai": "^0.21.0",
  "backblaze-b2": "^1.7.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.10.0",
  "winston": "^3.10.0",
  "google-auth-library": "^8.8.0"
}
```

### Dev Dependencies
```json
{
  "@types/express": "^4.17.17",
  "@types/node": "^20.5.0",
  "@types/jsonwebtoken": "^9.0.2",
  "@types/bcryptjs": "^2.4.2",
  "@types/multer": "^1.4.7",
  "typescript": "^5.1.6",
  "ts-node": "^10.9.1",
  "nodemon": "^3.0.1",
  "jest": "^29.6.2",
  "@types/jest": "^29.5.3",
  "ts-jest": "^29.1.1",
  "supertest": "^6.3.3"
}
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (TypeScript, Express, folder structure)
- [ ] MongoDB connection & models
- [ ] Environment configuration
- [ ] Basic error handling & logging
- [ ] Authentication (JWT + Google OAuth)
- [ ] User registration/login

### Phase 2: Document Management (Week 2-3)
- [ ] File upload with Multer
- [ ] Backblaze B2 integration & configuration
- [ ] PDF text extraction
- [ ] Document CRUD operations
- [ ] File storage service (Backblaze B2 upload/download)
- [ ] Document listing with pagination
- [ ] Basic search functionality

### Phase 3: AI Integration (Week 3-4)
- [ ] Google Gemini API setup
- [ ] Document summarization service
- [ ] Tag extraction service
- [ ] Conflict detection service
- [ ] Risk detection service
- [ ] Natural language query service
- [ ] AI result caching

### Phase 4: Advanced Features (Week 4-5)
- [ ] Workspace management
- [ ] RBAC implementation
- [ ] Advanced search with MongoDB text indexes
- [ ] Activity logging
- [ ] Analytics & aggregation pipelines

### Phase 5: Optimization & Polish (Week 5-6)
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] Performance optimization
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Testing (unit, integration, e2e)
- [ ] Security hardening

## 🔒 Security Considerations

- JWT token expiration & refresh
- Password hashing (bcrypt, salt rounds: 10)
- Input validation (Zod schemas)
- File upload validation (type, size limits)
- Rate limiting per user/IP
- CORS configuration
- Helmet.js for security headers
- SQL injection prevention (MongoDB queries)
- XSS protection
- Environment variable security

## 📊 API Response Format

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## 🧪 Testing Strategy

- Unit tests for services & utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- Mock Gemini API calls in tests
- Test coverage target: 80%+

## 📝 API Documentation

- Swagger/OpenAPI documentation
- Postman collection
- API versioning (`/api/v1/...`)

## 🗄️ Backblaze B2 Configuration

**Environment Variables:**
```env
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_ID=your_bucket_id
B2_BUCKET_NAME=your_bucket_name
B2_ENDPOINT=https://s3.us-west-000.backblazeb2.com
```

**Features:**
- S3-compatible API for easy integration
- Cost-effective object storage
- Direct file uploads from client or server
- Secure file URLs with expiration
- File versioning support
- Automatic file organization by workspace/document ID

**Implementation Notes:**
- Use `backblaze-b2` SDK for Node.js
- Store file paths/keys in MongoDB Document model
- Generate signed URLs for secure file access
- Support both direct upload and server-side upload flows

## 🚢 Deployment

- Environment: Render (or similar)
- Environment variables management
- Database: MongoDB Atlas
- File storage: Backblaze B2 (production)
- CI/CD: GitHub Actions
- Monitoring: Logs & error tracking
