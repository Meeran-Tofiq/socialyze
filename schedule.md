# 🗓️ 5-Day Build Schedule – Fullstack Social App

## 📅 Day 1 – Project Setup + Auth

### 🧱 Monorepo & Environment Setup

-   Init project with pnpm workspaces

-   Create:

    -   apps/api (Express backend)

    -   apps/web (Next.js frontend)

    -   packages/shared (types & utils)

-   Add .env and .env.example in each workspace

-   Configure tsconfig.json with aliases

-   Install Prettier, ESLint, TypeScript base

### 📦 Install Dependencies

-   Backend: express, cors, dotenv, jsonwebtoken, mongoose, zod

-   Frontend: next, react, tailwindcss, @auth0/auth0-react, axios

-   Tailwind CSS setup in frontend

### 🔐 Authentication

-   Setup Auth0 tenant & app (Google & GitHub login)

-   Integrate Auth0 React SDK in frontend

-   Auth0 backend integration (callback, token exchange)

-   Issue JWT tokens in backend

-   Add guest login flow

-   Add JWT middleware to protect backend routes

## 📅 Day 2 – User Profiles + CI/CD + MongoDB

### 👤 User Profiles

-   Create User model: name, email, bio, profilePic, createdAt

-   Auto-create user on first login

-   API to fetch/update user profile

-   Profile page in frontend (view & edit)

-   Add profile image upload support (S3)

### 🧪 Testing & CI/CD

-   Add Vitest/Jest to backend

-   Write tests for:

    -   JWT auth middleware

    -   User creation

-   Add seed script with faker.js

-   Set up GitHub Actions:

    -   Lint + test backend

    -   Configure .env via GitHub secrets

    -   🗂️ MongoDB Atlas Setup

-   Create Atlas cluster & DB

-   Whitelist IP & get connection string

-   Connect API to MongoDB

## 📅 Day 3 – Social Features + Posts (Text Only)

### 👥 Following System

-   Extend User model with:

    -   followers, following, pendingRequests

-   API Endpoints:

    -   Send/accept/decline/cancel follow requests

    -   Unfollow user

-   List followers/following/pending

-   UI for follow/unfollow + requests

-   Browse all users & profiles

### 📝 Post System (Text-Only)

-   Post model: authorId, content, likes, comments

-   API: create, like/unlike, comment on post

-   Post feed page (all followed users)

-   Profile page with user’s posts

-   UI components: post form, like/comment buttons

## 📅 Day 4 – Image Uploads + Polish + Deployment Prep

### 🖼️ Post Images

-   Setup AWS S3 + IAM credentials

-   Add presigned URL endpoint in backend

-   Upload post images from frontend

-   Save image URL in Post model

-   Display images in feed and profile

### 🧼 UI Polish

-   Build base layout (navbar, sidebar, responsive layout)

-   Tailwind UI for posts, avatars, profile cards

-   Skeleton loading states

### ✅ Extra Features

-   Route protection for all secure pages

-   Error handling middleware

-   Validate user input with zod

## 📅 Day 5 – Deployment (Frontend + Backend) + Final Testing

### 🚀 Backend Deployment (EC2)

-   Launch EC2 instance (Ubuntu)

-   Install Node.js, PM2 or Docker

-   Clone repo & setup .env

-   Run backend with PM2

-   Setup NGINX as reverse proxy (optional)

-   Secure with SSL via Let's Encrypt (optional)

### 🌐 Frontend Deployment

-   next build && next export

-   Deploy static site to AWS S3

-   Setup CloudFront for CDN + HTTPS

-   (Alt) Host frontend on EC2 with backend

### 🔁 Final CI/CD

-   Add deploy step to GitHub Actions (optional)

-   Push latest .env secrets to GitHub Actions

-   Run full test + seed pass

-   Polish styles, test mobile layout
