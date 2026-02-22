# BBM Admin Dashboard

Admin dashboard for managing job postings and gallery/albums. Built with Next.js, React, Prisma, and Supabase.

## Features

- **Dashboard** – Overview with job stats (total, published, draft, closed), charts, and recent activity (jobs, albums, images)
- **Job Postings** – Create, edit, delete jobs; manage status (published/draft/closed); job types (Permanent, Part-time, Internship)
- **Gallery** – Manage albums and images; upload, delete (single/bulk); set album cover images; edit album name/description
- **Settings** – Change password, create admins
- **Authentication** – NextAuth with credentials; protected dashboard routes

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Credentials Provider)
- **Storage:** Supabase (S3-compatible API or REST) for images
- **UI:** Tailwind CSS, Radix UI, shadcn components, TanStack Form & Table, Recharts
- **Validation:** Zod

## Project Structure

```
bbm-admin-dashboard/
├── app/
│   ├── api/                    # API routes
│   │   ├── admins/             # Admin CRUD
│   │   ├── albums/             # Album CRUD, PATCH/DELETE by id
│   │   ├── auth/               # NextAuth handler
│   │   ├── dashboard/          # Stats, jobs-by-date
│   │   ├── gallery/            # Images GET/DELETE, upload
│   │   ├── jobs/               # Job CRUD
│   │   └── settings/           # Change password
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── admins/
│   │   ├── gallery/
│   │   ├── job-postings/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── jobs/                   # addJobs, editJobs, data-table, columns
│   ├── dashboard/              # sectionCard
│   ├── ui/                     # shadcn components
│   └── ...
├── lib/
│   ├── prisma.ts               # Prisma client (pg adapter)
│   ├── schema/                 # Zod schemas
│   ├── supabase.ts
│   └── supabase-storage-s3.ts  # S3-compatible upload/delete
├── prisma/
│   ├── schema.prisma           # Admin, Job, JobApplication, Album, Image
│   ├── migrations/
│   ├── seed.ts                 # Seed 12 jobs
│   └── prisma.config.ts
├── auth.ts                     # NextAuth config
└── providers/
```

## Database Models (Prisma)

| Model | Description |
|-------|-------------|
| **Admin** | Dashboard admins (email, password, active) |
| **Job** | Job postings (title, description, jobType, location, salary, jobStatus, jobTime) |
| **JobApplication** | Applications for jobs |
| **Album** | Image albums (name, description, coverUrl) |
| **Image** | Images (url, path, filename; optional albumId) |

## API Overview

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/jobs` | GET, POST | List/create jobs |
| `/api/jobs/[id]` | GET, PATCH, DELETE | Job by id |
| `/api/albums` | GET, POST | List/create albums |
| `/api/albums/[id]` | PATCH, DELETE | Update/delete album |
| `/api/gallery` | GET, DELETE | Images (optional `?albumId=`) |
| `/api/gallery/upload` | POST | Upload image (FormData) |
| `/api/dashboard/stats` | GET | Job counts (total, published, draft, closed) |
| `/api/admins` | GET, POST | List/create admins |
| `/api/admins/[id]` | PATCH, DELETE | Update/delete admin |
| `/api/settings/change-password` | POST | Change password |
| `/api/auth/[...nextauth]` | * | NextAuth handler |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Supabase project (for image storage)

### Environment Variables

Create `.env` in the project root:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (for gallery image storage)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Optional: S3-compatible storage (Supabase)
SUPABASE_S3_ENDPOINT="https://xxx.supabase.co/storage/v1/s3"
SUPABASE_S3_REGION="ap-southeast-2"
SUPABASE_S3_ACCESS_KEY_ID=""
SUPABASE_S3_SECRET_ACCESS_KEY=""
```

### Install & Run

```bash
npm install
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed 12 sample jobs (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Access

Use these credentials to access the demo:

- **Email:** `test@test.com`
- **Password:** `Senario@123`

### Build

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma db seed` | Seed database with sample jobs |

## Related Documentation

- [Jobs API response structure](./types/jobs-api.ts)
- [Albums & Gallery API structure](./docs/albums-gallery-api.md)
