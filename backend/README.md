# DOCIT Backend

Automated Document Management System Backend API

## ✅ Backend Boilerplate Status

### 📁 Project Structure
```
backend/
├── src/
│   ├── config/          ✅ Complete
│   │   ├── database.ts          # MongoDB connection
│   │   ├── multer.ts            # File upload config
│   │   ├── backblaze-b2.ts      # Backblaze B2 storage config
│   │   └── env.ts               # Environment variables validation
│   │
│   ├── models/          ✅ Partial (User model ready)
│   │   └── User.ts              # User schema
│   │
│   ├── routes/          ⏳ Empty (ready for implementation)
│   ├── controllers/     ⏳ Empty (ready for implementation)
│   ├── services/        ✅ Partial
│   │   ├── file-storage.service.ts  # Backblaze B2 file operations
│   │   └── ai/                    # AI services (empty)
│   │
│   ├── middleware/      ⏳ Empty (ready for implementation)
│   ├── utils/           ✅ Complete
│   │   └── logger.ts            # Winston logger
│   │
│   ├── types/           ✅ Complete
│   │   ├── express.d.ts        # Express type extensions
│   │   └── index.ts            # Shared types
│   │
│   ├── app.ts          ✅ Complete
│   └── server.ts       ✅ Complete
│
├── logs/               ✅ Created
├── uploads/            ✅ Created
├── .env.example        ✅ Complete
├── .gitignore          ✅ Complete
├── package.json        ✅ Complete
├── tsconfig.json       ✅ Complete
└── nodemon.json        ✅ Complete
```

### ✅ Completed Components

1. **Core Setup**
   - ✅ Express.js application with TypeScript
   - ✅ Environment variable validation (Zod)
   - ✅ Error handling middleware
   - ✅ Request logging
   - ✅ Health check endpoint (`/health`)

2. **Database & Storage**
   - ✅ MongoDB connection (Mongoose)
   - ✅ Backblaze B2 configuration
   - ✅ Multer file upload configuration

3. **Services**
   - ✅ File Storage Service (Backblaze B2)
     - Upload files
     - Download files
     - Delete files
     - Generate signed URLs
     - List files
     - File metadata

4. **Models**
   - ✅ User model with schema

5. **Utilities**
   - ✅ Winston logger (file + console)
   - ✅ Type definitions

6. **Configuration**
   - ✅ TypeScript configuration
   - ✅ Nodemon configuration
   - ✅ Environment variables template
   - ✅ Git ignore rules

### ⏳ Pending Implementation

1. **Models** (to be created)
   - Document model
   - Workspace model
   - ActivityLog model
   - Tag model

2. **Routes** (to be created)
   - Auth routes (`/api/auth/*`)
   - Document routes (`/api/documents/*`)
   - Workspace routes (`/api/workspaces/*`)
   - Search routes (`/api/search/*`)
   - AI routes (`/api/ai/*`)
   - Analytics routes (`/api/analytics/*`)

3. **Controllers** (to be created)
   - Auth controller
   - Document controller
   - Workspace controller
   - Search controller
   - AI controller
   - Analytics controller

4. **Services** (to be created)
   - Auth service
   - Document service
   - Search service
   - Analytics service
   - AI services:
     - Gemini service
     - Summary service
     - Tag extraction service
     - Conflict detection service
     - Risk detection service

5. **Middleware** (to be created)
   - Auth middleware (JWT verification)
   - RBAC middleware
   - Rate limiting middleware
   - Validation middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Backblaze B2 account
- Google Gemini API key (free at https://aistudio.google.com/apikey)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB URI
   - Backblaze B2 credentials
   - Google Gemini API key (free at https://aistudio.google.com/apikey)
   - JWT secrets

### Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

### Health Check
```bash
curl http://localhost:5000/health
```

## 📦 Dependencies

### Production
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- zod - Schema validation
- multer - File upload handling
- pdf-parse - PDF text extraction
- @google/generative-ai - Google Gemini API (free tier)
- backblaze-b2 - Backblaze B2 SDK
- winston - Logging
- google-auth-library - Google OAuth

### Development
- typescript - TypeScript compiler
- ts-node - TypeScript execution
- nodemon - Development server
- @types/* - Type definitions

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 🤖 AI: Google Gemini (free tier)

- Backend uses **@google/generative-ai** with `gemini-1.5-flash` (or `gemini-1.5-pro`).
- Get a free API key: https://aistudio.google.com/apikey
- Frontend can use **Vercel AI SDK** (`@ai-sdk/google`) with the same Gemini models for streaming/chat UI.

## 📌 Phase 1 API (Implemented)

### Auth (Google OAuth2 + JWT)
- `GET /api/auth/google` – returns Google OAuth URL for frontend redirect
- `POST /api/auth/google/callback` – body `{ code }` – exchange code for user + JWT
- `GET /api/auth/me` – current user (requires `Authorization: Bearer <accessToken>`)
- `POST /api/auth/refresh` – body `{ refreshToken }` – new access token

### Workspaces (repo-style, org creates)
- `POST /api/workspaces` – create workspace (body: `name`, `description?`)
- `GET /api/workspaces` – list workspaces for user (query: `page`, `limit`)
- `GET /api/workspaces/:id` – get workspace (must be owner or member)
- `PATCH /api/workspaces/:id` – update (body: `name?`, `description?`)
- `DELETE /api/workspaces/:id` – delete (admin only)

### Collaboration
- `POST /api/workspaces/:id/members` – add member (body: `userId`, `role?` default viewer)
- `DELETE /api/workspaces/:id/members/:userId` – remove member (admin only)
- `PATCH /api/workspaces/:id/members/:userId/role` – set role (body: `role`: admin | editor | viewer)

### Documents (upload / download)
- `POST /api/documents/upload` – multipart: `file` (PDF), `workspaceId` – upload to B2
- `GET /api/documents/workspace/:workspaceId` – list documents (query: `page`, `limit`)
- `GET /api/documents/:id` – document metadata
- `GET /api/documents/:id/download` – download file
- `DELETE /api/documents/:id` – delete (admin/editor)

All workspace and document routes require `Authorization: Bearer <accessToken>`.

## 📝 Next Steps

1. ~~Create Workspace & Document models~~ ✅
2. ~~Auth (Google OAuth2), workspaces, file upload/download, collaboration~~ ✅
3. Implement AI services (summarize, tags, conflicts, risks, query)
4. Implement search functionality
5. Add analytics endpoints

## 🏗️ Architecture

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
    └── Backblaze B2 (File Storage)
```
