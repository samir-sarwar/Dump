# Dump

A mobile app for collecting and sharing photos and videos from group events. No more scattered photos across everyone's phones — create an event, invite your friends, and everyone uploads to one shared album.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Services](#backend-services)
- [Frontend App](#frontend-app)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Design System](#design-system)
- [Testing](#testing)

---

## Overview

Dump solves a simple problem: after any group event — a party, a trip, a wedding — photos end up scattered across dozens of phones. Dump gives every event a shared space where attendees can upload, browse, like, comment on, and save media from the events they attend.

**Core flow:**
1. A user creates an event (e.g. "Jake's Birthday")
2. They share an invite code with friends
3. Everyone joins the event and uploads their photos/videos
4. All media lives in one place — browsable, likeable, saveable

---

## Architecture

Dump follows a **microservices architecture** with a mobile-first frontend:

```
┌──────────────────┐
│  React Native    │
│  (Expo)          │
│  Mobile App      │
└────────┬─────────┘
         │ REST/HTTP
         ▼
┌──────────────────┐
│  API Gateway     │  ← Single entry point (port 8080)
│  (Spring Cloud)  │
└──┬─────┬─────┬───┘
   │     │     │  gRPC
   ▼     ▼     ▼
┌─────┐┌─────┐┌─────┐
│Auth ││Event││Media│
│Svc  ││Svc  ││Svc  │
└──┬──┘└──┬──┘└──┬──┘
   │      │      │
   ▼      ▼      ▼
┌─────┐┌─────┐┌─────┐   ┌───────┐   ┌───────┐
│ PG  ││ PG  ││ PG  │   │ Kafka │   │ MinIO │
│5432 ││5433 ││5434 │   │       │   │  (S3) │
└─────┘└─────┘└─────┘   └───────┘   └───────┘
```

- **API Gateway** translates REST requests from the mobile app into gRPC calls to backend services
- **Services communicate** via gRPC (synchronous) and Kafka (asynchronous events)
- **Each service** owns its own PostgreSQL database (database-per-service pattern)
- **Media files** (photos/videos) are stored in MinIO (S3-compatible object storage) via presigned URLs for direct client uploads

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native 0.81, Expo 54, TypeScript |
| Routing | Expo Router 6 (file-based) |
| UI | Custom design system, React Native Reanimated, Flash List |
| API Gateway | Spring Boot 3.5, Spring Cloud Gateway |
| Microservices | Java 21, Spring Boot 3.5 |
| Inter-service | gRPC + Protocol Buffers |
| Databases | PostgreSQL 16 (3 instances) |
| Migrations | Flyway 11 |
| Messaging | Apache Kafka 3.8 |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT (JJWT), social login (Google/Apple) |
| Build | Maven (backend), npm/Expo (frontend) |
| E2E Testing | Maestro |

---

## Project Structure

```
dump/
├── backend/
│   ├── api-gateway/          # REST → gRPC translation layer (port 8080)
│   ├── auth-service/         # Users, auth, follows (port 8081, gRPC 9091)
│   ├── event-service/        # Events, memberships (port 8082, gRPC 9094)
│   ├── media-service/        # Media, interactions, collections (port 8083, gRPC 9093)
│   ├── docker-compose.yml    # PostgreSQL x3, Kafka, MinIO
│   ├── pom.xml               # Parent Maven config
│   └── start-all.sh          # Orchestrated startup script
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # Login & registration screens
│   │   └── (tabs)/           # Main app (feed, upload, library, profile)
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API client, auth context, utilities
│   ├── hooks/                # Custom React hooks
│   ├── constants/            # Theme, typography, spacing, shadows
│   └── assets/               # Images and icons
│
└── docs/                     # Architecture & design documentation
```

---

## Getting Started

### Prerequisites

- **Java 21** (for backend services)
- **Maven** (or use the included `./mvnw` wrapper)
- **Docker & Docker Compose** (for PostgreSQL, Kafka, MinIO)
- **Node.js 18+** and **npm** (for frontend)
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** or **Android Emulator** (or Expo Go on a physical device)

### 1. Start the Backend

```bash
cd backend

# Start all infrastructure (Postgres x3, Kafka, MinIO) and services
./start-all.sh
```

This will:
1. Start Docker containers for PostgreSQL (ports 5432-5434), Kafka (9092), and MinIO (9000)
2. Boot the auth-service (8081), event-service (8082), and media-service (8083)
3. Start the API gateway (8080) once gRPC services are ready
4. Run Flyway migrations automatically (including seed data for development)

**Alternatively, start services individually:**

```bash
# Infrastructure only
docker compose up -d

# Each service (in separate terminals)
cd auth-service && ../mvnw spring-boot:run
cd event-service && ../mvnw spring-boot:run
cd media-service && ../mvnw spring-boot:run
cd api-gateway && ../mvnw spring-boot:run
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

### 3. Seed Data

Flyway migrations automatically seed the development database with:
- **10 test users** (all with password: `password123`)
- **Follow relationships** between users
- **Sample events** with memberships
- **Sample media** with likes, comments, and bookmarks

### Dev Credentials

| Service | Host | Port | User | Password |
|---------|------|------|------|----------|
| Auth DB | localhost | 5432 | dump | dump |
| Event DB | localhost | 5433 | dump | dump |
| Media DB | localhost | 5434 | dump | dump |
| MinIO API | localhost | 9000 | minioadmin | minioadmin |
| MinIO Console | localhost | 9001 | minioadmin | minioadmin |
| Kafka | localhost | 9092 | — | — |

---

## Backend Services

### Auth Service

Handles user identity, authentication, and social connections.

- **User registration & login** (email/password)
- **Social login** (Google, Apple)
- **JWT issuance & refresh**
- **User profiles** (bio, avatar, cover photo)
- **Follow/unfollow** system with follower/following lists
- **User search**

**Database:** `dump_auth` on port 5432

### Event Service

Manages events and their memberships.

- **Create, read, update, delete** events
- **Join/leave** events
- **Invite codes** — generate and join by code
- **Event member** listing
- **Media count tracking** (via Kafka consumer listening to `media.uploaded`)

**Database:** `dump_event` on port 5433

### Media Service

Handles all media storage, retrieval, and social interactions.

- **Presigned upload URLs** — clients upload directly to MinIO
- **Upload confirmation** with thumbnail generation
- **Media feed** per event (with highlights)
- **Likes, comments, bookmarks**
- **Clippings** — save media from events to your personal collection
- **Collections** — user-created grouped media albums
- **Kafka producer** — publishes `media.uploaded` and `media.deleted` events

**Database:** `dump_media` on port 5434

### API Gateway

Single REST entry point for the mobile app. Routes requests and translates between REST and gRPC.

- JWT validation
- Request routing by path prefix
- REST ↔ gRPC protocol translation

---

## API Reference

All endpoints are served through the API gateway at `http://localhost:8080`.

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login with email/password |
| POST | `/social-login` | OAuth login (Google/Apple) |
| POST | `/refresh` | Refresh JWT token |
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update profile (bio, avatar, cover) |
| GET | `/users/search?query=` | Search users by name/username |
| GET | `/users/{userId}` | Get user profile |
| POST | `/users/batch` | Batch fetch user profiles |
| POST | `/follow/{targetUserId}` | Follow a user |
| DELETE | `/follow/{targetUserId}` | Unfollow a user |
| GET | `/follow/check/{targetUserId}` | Check follow status |
| GET | `/followers/{userId}` | List followers |
| GET | `/following/{userId}` | List following |
| GET | `/friends` | List mutual follows |

### Events (`/api/events`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create an event |
| GET | `/{eventId}` | Get event details |
| PUT | `/{eventId}` | Update an event |
| DELETE | `/{eventId}` | Delete an event |
| GET | `/` | List your events |
| GET | `/user/{userId}` | List another user's events |
| GET | `/upcoming` | Get upcoming events |
| POST | `/{eventId}/join` | Join an event |
| DELETE | `/{eventId}/leave` | Leave an event |
| GET | `/{eventId}/members` | List event members |
| POST | `/{eventId}/invite-code` | Generate invite code |
| POST | `/join` | Join by invite code |

### Media (`/api/media`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Initiate presigned upload |
| POST | `/{mediaId}/confirm` | Confirm upload complete |
| GET | `/{mediaId}` | Get media details |
| GET | `/event/{eventId}` | List event media |
| GET | `/event/{eventId}/feed` | Event media feed |
| GET | `/user/{userId}` | List user's uploads |
| POST | `/upload-image` | Presigned URL for profile images |

### Interactions (`/api/media/interactions`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/like` | Like media |
| DELETE | `/like/{mediaId}` | Unlike media |
| POST | `/comment` | Add a comment |
| GET | `/comments/{mediaId}` | List comments on media |
| POST | `/bookmark` | Bookmark media |
| DELETE | `/bookmark/{mediaId}` | Remove bookmark |

### Clippings (`/api/media/clippings`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/clip` | Save media to clippings |
| DELETE | `/clip/{mediaId}` | Remove from clippings |
| GET | `/` | List your clippings |

### Collections (`/api/media/collections`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a collection |
| GET | `/` | List your collections |
| POST | `/{collectionId}/add` | Add media to collection |
| DELETE | `/{collectionId}/remove` | Remove from collection |
| GET | `/{collectionId}` | Get collection items |

### Feed (`/api/feed`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get home feed (event recaps) |

---

## Database Schema

### Auth Service (`dump_auth`)

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR | |
| username | VARCHAR | Unique |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | BCrypt |
| auth_provider | VARCHAR | LOCAL, GOOGLE, APPLE |
| bio | TEXT | |
| avatar_url | VARCHAR | |
| cover_url | VARCHAR | |
| created_at / updated_at | TIMESTAMP | |

**follows** — (follower_id, followee_id) composite key

**refresh_tokens** — (user_id, token, expires_at)

### Event Service (`dump_event`)

**events**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| title | VARCHAR | |
| date | TIMESTAMP | |
| location | VARCHAR | |
| image_url | VARCHAR | Event cover |
| creator_id | UUID | |
| invite_code | VARCHAR | Unique |
| media_count | INT | Updated via Kafka |
| created_at / updated_at | TIMESTAMP | |

**event_members** — (event_id, user_id, joined_at)

### Media Service (`dump_media`)

**media**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| event_id | UUID | |
| user_id | UUID | Uploader |
| image_url | VARCHAR | Full-res URL |
| thumbnail_url | VARCHAR | |
| caption | TEXT | |
| location | VARCHAR | |
| type | VARCHAR | PHOTO, VIDEO |
| aspect_ratio | FLOAT | |
| filename | VARCHAR | Original filename |
| s3_key | VARCHAR | MinIO object key |
| status | VARCHAR | PENDING, CONFIRMED |
| like_count | INT | Denormalized |
| comment_count | INT | Denormalized |
| is_highlight | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |

**media_likes** — (media_id, user_id)
**comments** — (id, media_id, user_id, text, timestamps)
**bookmarks** — (media_id, user_id)
**clippings** — (id, media_id, user_id, timestamps)
**collections** — (id, user_id, title)
**collection_items** — (collection_id, media_id)

---

## Design System

Dump uses a warm, editorial aesthetic inspired by terracotta tones and serif typography.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#9c4428` | Terracotta — buttons, accents, active states |
| Secondary | `#456376` | Slate blue — secondary actions, links |
| Tertiary | `#7a555e` | Mauve — subtle accents |
| Surface | `#fcf9f8` | Off-white background |
| Ghost Border | `rgba(216, 194, 189, 0.15)` | Subtle dividers |

### Typography

| Use | Font | Weight |
|-----|------|--------|
| Headlines | Newsreader (serif) | 200–300 |
| Body / Labels | Inter (sans-serif) | 400–600 |

### Shape

- **Border radius:** 0px — sharp corners throughout for an editorial feel
- **Icons:** Feather (thin-stroke line icons)

---

## Testing

### Frontend E2E (Maestro)

Located in `frontend/.maestro/flows/`:

```bash
# Run all flows
maestro test frontend/.maestro/flows/

# Run a specific flow
maestro test frontend/.maestro/flows/auth/01-register.yaml
```

**Test coverage:**
- Auth: registration, login, validation
- Feed: browsing, event details
- Upload: media capture and upload
- Library: clippings and collections browsing
- Profile: view, edit, followers/following
- Events: creation, join by code, leave
- Interactions: like/unlike, comments, bookmarks, follow/unfollow

### Backend (JUnit 5)

```bash
cd backend
./mvnw test
```

---

## Stopping Services

```bash
# Kill all backend services
./kill_ports.sh

# Stop Docker infrastructure
cd backend && docker compose down
```
