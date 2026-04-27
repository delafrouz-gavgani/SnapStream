# SnapStream

*Stream your creativity. Discover theirs.*

**Scalable Advanced Software Solutions — Coursework**

---

SnapStream is a media platform that treats photos and videos as first-class content. Creators upload once; the platform handles discovery, engagement, and access control for them. Consumers get a clean, fast feed with real engagement tools — ratings, comments, bookmarks, follows.

The whole thing is wired to scale: stateless API, separated file storage, a caching layer, and a static frontend that can live anywhere.

---

## Roles

**Creator**
Registers, uploads media (photo or video) with structured metadata, and manages their library from a dashboard. Can delete their own posts. Cannot access consumer-only features.

**Consumer**
Registers, browses the feed, searches, rates, comments, bookmarks, and follows creators. Cannot upload media or access creator routes.

Role is set at registration and enforced by JWT middleware on every protected route.

---

## What's Built

### Core features
- Photo and video upload (up to 200MB via Multer multipart)
- Metadata fields: title, caption, location, people present
- Paginated public feed
- Full-text search across all metadata fields
- Individual post detail page
- Star ratings (1–5, one per user per post, upsert on repeat)
- Comments per post
- Like toggle
- Bookmark / save to collection
- Follow / unfollow creators

### Infrastructure features
- JWT-based stateless auth with role claims
- Separate filesystem storage for media (database holds only the URL)
- 60-second LRU in-memory cache on feed and search
- Automatic cache invalidation on upload
- Integration test suite (8 scenarios)

---

## Stack at a Glance

```
React 18   Vite   Tailwind CSS   React Router v6   Axios
     ↓            (frontend — static SPA)
Express.js   Node.js   Prisma   PostgreSQL
     ↓            (backend — REST API)
JWT   bcryptjs   Multer   In-memory LRU cache
     ↓            (cross-cutting concerns)
Jest   Supertest
     ↓            (testing)
```

---

## Architecture

SnapStream is split into three independently deployable pieces:

**1. Frontend (React SPA)**
Compiled to static files by Vite. No server-side rendering. Can be hosted on any CDN, object bucket, or static server. Communicates with the API exclusively over HTTP.

**2. API server (Express.js)**
Handles all business logic. Validates JWTs, enforces roles, reads and writes to the database via Prisma, stores files via Multer, and caches hot responses in memory. Fully stateless — no process-local user state.

**3. Data layer (PostgreSQL + filesystem)**
The database stores structured data: users, posts, comments, ratings, bookmarks, follows. Media files live in `uploads/` on disk. The two are kept separate intentionally — the filesystem can be swapped for object storage without touching the schema.

```
Browser  ──HTTP──▶  Express API  ──Prisma──▶  PostgreSQL
                         │
                      Multer──▶  uploads/ (filesystem)
```

---

## Scaling Strategy

| Concern | Current approach | Production path |
|---------|-----------------|-----------------|
| Auth | JWT signed with shared secret | Rotate secret; add refresh tokens |
| API instances | Single process | Multiple Node processes behind Nginx upstream |
| Cache | In-memory per process | Redis shared cache |
| Media storage | Local `uploads/` directory | OpenStack Swift / S3-compatible |
| Database reads | Single PostgreSQL instance | Add read replicas for feed queries |
| Frontend | Local Vite dev server | CDN-hosted static files |

---

## Data Schema

```
User
  id, name, email (unique), passwordHash, role, timestamps

Image
  id, creatorId, title, caption, location, peoplePresent,
  imageUrl, storageKey, timestamps

Comment
  id, imageId, userId, commentText, createdAt

Rating
  id, imageId, userId, ratingValue (1–5)
  unique constraint on (imageId, userId)

Bookmark
  id, imageId, userId

Follow
  id, followerId, followingId
```

---

## API Endpoints

**Auth**
```
POST  /api/auth/register   →  Create consumer account
POST  /api/auth/login      →  Authenticate, receive JWT
GET   /api/auth/me         →  [JWT] Current user
```

**Media**
```
POST    /api/images             →  [JWT:creator] Publish new post
GET     /api/images             →  Public paginated feed  (cached)
GET     /api/images/search?q=   →  Full-text search       (cached)
GET     /api/images/mine        →  [JWT:creator] Own posts
GET     /api/images/:id         →  Public post detail
DELETE  /api/images/:id         →  [JWT:creator] Delete own post
```

**Engagement**
```
POST  /api/images/:id/comments   →  [JWT:consumer] Add comment
POST  /api/images/:id/ratings    →  [JWT:consumer] Rate (upsert)
POST  /api/images/:id/likes      →  [JWT:consumer] Toggle like
POST  /api/images/:id/bookmarks  →  [JWT:consumer] Toggle bookmark
POST  /api/users/:id/follow      →  [JWT:consumer] Toggle follow
```

---

## Setup

**Requirements:** Node.js ≥ 18, PostgreSQL ≥ 14, npm

**Backend setup**

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL connection string
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
# Running at http://localhost:5000
```

**Frontend setup**

```bash
cd frontend
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000
npm install
npm run dev
# Running at http://localhost:5173
```

---

## Tests

```bash
cd backend
# .env.test should contain DATABASE_URL pointing to a test database
npm test
```

Eight integration tests run against a live database connection:

1. Consumer registration returns 201 with a JWT
2. Creator login returns 200 with a JWT
3. Creator upload returns 201 and persists the image record
4. Consumer upload attempt returns 403
5. Unauthenticated upload attempt returns 401
6. Consumer comment is stored and returned
7. Consumer rating is stored (upsert on repeat submit)
8. Search returns posts matching the query term

---

## Production Deployment

**Required environment variables**
```
DATABASE_URL=postgresql://user:pass@host:5432/snapstream
JWT_SECRET=minimum-32-character-random-string
PORT=5000
CLIENT_URL=https://your-frontend.com
```

**Start the API**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
node server.js
```

**Build and serve the frontend**
```bash
cd frontend
npm install
npm run build
# Point a static server or Nginx at dist/
```

**Nginx reverse proxy**
```nginx
server {
    listen 80;

    location /api      { proxy_pass http://localhost:5000; }
    location /uploads  { proxy_pass http://localhost:5000; }
    location /         {
        root /path/to/snapstream/frontend/dist;
        try_files $uri /index.html;
    }
}
```

**Hosting without a server**
- Database: Neon or Supabase (free PostgreSQL)
- API: Render or Railway (free Node.js hosting)
- Frontend: Netlify or Vercel (free static hosting)

---

## Default Accounts

```
creator@example.com  /  password123  →  Creator role
consumer@example.com /  password123  →  Consumer role
```

---

## Known Gaps

- In-memory cache is per-process and lost on restart. Redis needed for multi-instance.
- Media files are stored locally and lost on container rebuild. Object storage needed for persistence.
- No password reset flow.
- No image compression or format normalisation on upload.

---

## References

- https://expressjs.com — Express.js
- https://www.prisma.io/docs — Prisma ORM
- https://react.dev — React
- https://vitejs.dev — Vite
- https://tailwindcss.com — Tailwind CSS
- https://jwt.io — JSON Web Tokens
- https://github.com/expressjs/multer — Multer
- https://jestjs.io — Jest
- https://github.com/ladjs/supertest — Supertest
