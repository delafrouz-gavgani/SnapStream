# SnapStream — Scalable Cloud-Native Photo Sharing Platform

A coursework project for the module **Scalable Advanced Software Solutions**.

---

## Description

SnapStream is a simplified Instagram-style photo sharing web application demonstrating scalable cloud-native architecture principles. Creators upload photos with rich metadata; consumers browse, search, comment, and rate those photos.

---

## Features

| Feature | Description |
|---------|-------------|
| Creator upload | Upload photos with title, caption, location, people present |
| Consumer feed | Paginated grid of all photos |
| Image search | Full-text search across title, caption, location, people |
| Image detail | Full photo view with metadata |
| Comments | Consumers add comments to photos |
| Ratings | Consumers rate photos 1–5 stars (one rating per image per user) |
| JWT auth | Stateless authentication with role-based access control |
| Creator dashboard | Private view of creator's uploaded images with delete |
| Separate storage | Images stored on filesystem, not in the database |
| In-memory cache | 60-second TTL cache for feed and search results |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File upload | Multer |
| Testing | Jest, Supertest |

---

## Architecture

```
┌─────────────────┐     HTTP/REST      ┌──────────────────────┐
│   React Frontend │ ──────────────── │  Express.js Backend   │
│   (Vite / SPA)  │                   │  (Node.js REST API)   │
└─────────────────┘                   └──────────┬───────────┘
                                                  │
                               ┌──────────────────┴──────────────┐
                               │                                   │
                     ┌─────────▼──────────┐         ┌────────────▼────────┐
                     │   PostgreSQL DB     │         │  Local Uploads Dir  │
                     │  (users, images,   │         │  /backend/uploads/  │
                     │  comments, ratings)│         │  (object-storage-   │
                     └────────────────────┘         │   style)            │
                                                     └────────────────────┘
```

---

## Scalability Design

1. **Static frontend** — React + Vite outputs static files deployable to any CDN or static host.
2. **Stateless backend** — JWT auth means no server-side session state; backend can be horizontally scaled behind a load balancer.
3. **REST API** — Standard HTTP makes the backend replaceable and independently scalable.
4. **Separate image storage** — Images stored outside the database (local `uploads/` folder, or swappable with OpenStack Swift / S3-compatible store). Database stores only the URL/key.
5. **In-memory cache** — Feed and search results cached for 60 seconds to reduce database load. Cache is invalidated on new uploads. For production, replace with Redis.
6. **Database** — PostgreSQL with Prisma ORM; can run on managed free-tier hosts (Supabase, Neon, Railway).
7. **Load balancer ready** — Because the backend is stateless (JWT), multiple backend instances can sit behind a load balancer (e.g., Nginx on the module cloud platform).

---

## Database Schema

```
User
  id           Int       PK
  name         String
  email        String    UNIQUE
  passwordHash String
  role         creator | consumer
  createdAt    DateTime
  updatedAt    DateTime

Image
  id            Int       PK
  creatorId     Int       FK → User.id
  title         String
  caption       String?
  location      String?
  peoplePresent String?
  imageUrl      String
  storageKey    String
  createdAt     DateTime
  updatedAt     DateTime

Comment
  id          Int       PK
  imageId     Int       FK → Image.id
  userId      Int       FK → User.id
  commentText String
  createdAt   DateTime
  updatedAt   DateTime

Rating
  id          Int       PK
  imageId     Int       FK → Image.id
  userId      Int       FK → User.id
  ratingValue Int       (1–5)
  createdAt   DateTime
  updatedAt   DateTime
  UNIQUE(imageId, userId)
```

---

## API Routes

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | `/api/auth/register` | No | — | Register consumer |
| POST | `/api/auth/login` | No | — | Login, returns JWT |
| GET | `/api/auth/me` | Yes | any | Get current user |
| POST | `/api/images` | Yes | creator | Upload image + metadata |
| GET | `/api/images` | No | — | Paginated feed |
| GET | `/api/images/search?q=` | No | — | Search images |
| GET | `/api/images/mine` | Yes | creator | Creator's own images |
| GET | `/api/images/:id` | No | — | Image detail |
| DELETE | `/api/images/:id` | Yes | creator | Delete own image |
| POST | `/api/images/:id/comments` | Yes | consumer | Add comment |
| POST | `/api/images/:id/ratings` | Yes | consumer | Add/update rating |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally)
- npm

### 1. Clone / extract the project

```bash
cd SnapStream
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Test Instructions

```bash
cd backend

# Ensure a test PostgreSQL database exists (SnapStream_test) or use the same DB
# Edit .env.test with the test DATABASE_URL

npm test
```

Tests cover:
1. Creator login
2. Consumer registration
3. Creator can upload image
4. Consumer cannot upload image
5. Consumer can comment
6. Consumer can rate
7. Search works
8. Unauthenticated upload is rejected

---

## Deployment Instructions

### Local / University Cloud Platform

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
node server.js
```

**Frontend (build static files):**
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or any static server
npx serve dist
```

**Environment variables for production:**
```
DATABASE_URL=postgresql://user:pass@host:5432/SnapStream
JWT_SECRET=a-long-random-secret
PORT=5000
CLIENT_URL=http://your-frontend-domain
```

**Nginx example (single server):**
```nginx
server {
    listen 80;

    location /api {
        proxy_pass http://localhost:5000;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
    }

    location / {
        root /var/www/SnapStream/frontend/dist;
        try_files $uri /index.html;
    }
}
```

**Free hosting options (no billing required):**
- Database: Supabase (free tier) or Neon (free tier)
- Backend: Railway (free tier) or Render (free tier)
- Frontend: Vercel or Netlify (free tier)

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Creator | creator@example.com | password123 |
| Consumer | consumer@example.com | password123 |

---

## Limitations

- In-memory cache resets on server restart; use Redis for persistent cache
- Local image storage does not persist across deployments; use object storage (OpenStack Swift, Cloudflare R2) in production
- No email verification or password reset
- No pagination on creator dashboard
- No image compression or resizing

---

## Future Improvements

- Integrate OpenStack Swift for production image storage
- Add Redis for distributed caching
- Add image compression (Sharp)
- Add following/follower system
- Add image tagging
- Add admin moderation panel

---

## References

- Express.js docs: https://expressjs.com
- Prisma docs: https://www.prisma.io/docs
- React docs: https://react.dev
- Vite docs: https://vitejs.dev
- Tailwind CSS docs: https://tailwindcss.com
- JWT: https://jwt.io
- Multer: https://github.com/expressjs/multer
- Jest: https://jestjs.io
- Supertest: https://github.com/ladjs/supertest
