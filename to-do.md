# ✅ Full Project To-Do List: Social Media App

## 🧱 Project Structure & Setup

### 🔧 Monorepo Setup

-   Create root project folder and initialize with pnpm init

-   Enable pnpm workspaces in package.json

-   Create apps/ directory

    -   apps/api – Express backend

    -   apps/web – Next.js frontend

-   Create packages/shared – for types and utils

-   Add .env and .env.example files for all apps

-   Install Prettier, ESLint, TypeScript in each workspace

-   Configure tsconfig.json with path aliases

### 📦 Basic Dependencies

-   Add express, cors, dotenv, jsonwebtoken, mongoose, zod, etc.

-   Add next, react, tailwindcss, @auth0/auth0-react, axios

-   Setup Tailwind CSS in frontend

-   Setup Auth0 provider in frontend and backend

## 🔐 Auth & User Profiles

### 🛂 Authentication

-   Setup Auth0 tenant + app (Google login)

-   Configure Auth0 in both frontend & backend

-   Setup secure callback routes + token exchange

-   Issue JWT in the backend (signed with private key)

-   Verify JWT on protected routes (express-jwt or custom middleware)

-   Add guest sign-in route in backend + UI button in frontend

### 👤 User Profiles

-   Create User model: name, email, bio, profilePic, createdAt

-   Auto-create user record in DB after first login

-   API to fetch/update profile info

-   Upload profile photo to S3

-   Use S3 URL in profile

## 👥 Social Features

### 🔄 Following System

-   Extend User model with: followers, following, pendingRequests

-   Add API to:

    -   Send follow request

    -   Accept/decline request

    -   Cancel sent request

    -   Unfollow a user

-   Create endpoints to list followers/following/pending requests

-   UI components to follow/unfollow and view users

-   Browse all users and send requests

## 📝 Posts & Interactions

### 📬 Core Post Features

-   Post model: authorId, content, imageUrl?, likes[], comments[]

-   Create posts (text only initially)

-   View individual post (author info, likes, comments)

-   Like/unlike a post

-   Comment on a post

-   Feed page:

    -   All posts by followed users

    -   Sorted by date

-   All posts by a specific user on profile page

### 🖼️ Post Images

-   Upload image to S3 via presigned URL

-   Save image URL in post

-   Display images in feed and profile

## 🧪 Testing & CI/CD

### ✅ Testing Setup

-   Add Vitest/Jest to backend

-   Write tests for:

    -   Auth middleware

    -   Post creation

    -   Follow system logic

-   Add faker.js to create mock data (use scripts/seed.ts)

### 🔁 CI/CD

-   Set up GitHub Actions:

    -   Lint, type-check, and test backend on every push

    -   Optional: auto-deploy from main branch to EC2

-   Configure secrets (JWT key, Auth0, MongoDB URI, AWS creds)

## 🚀 Deployment

### 🗂️ MongoDB Atlas

-   Create MongoDB Atlas cluster

-   Add IP whitelist + Auth

-   Create DB and connection string

### 🧩 AWS Setup

-   Provision EC2 instance for backend

    -   Install Docker or Node.js/PM2 setup

-   SSH + GitHub Actions auto-deploy

-   Serve backend via reverse proxy (e.g., NGINX)

-   Use dotenv or EC2 secrets for environment config

## 🌐 Frontend Deployment

### Option A (Recommended for now):

-   Deploy frontend via S3 + CloudFront

    -   next build && next export

    -   aws s3 sync ./out s3://your-bucket

### Option B:

-   Host frontend on same EC2 instance (e.g., port 3000 or reverse proxy)

## 🧼 Styling & UI Polish

### 🎨 Tailwind UI

-   Build base layout: header, nav, main

-   Responsive design (mobile-friendly)

-   Use avatar components, card layout for posts

-   Profile and feed pages with clean visual structure

### 🛠️ Dev Utilities & Extras

-   Seed users and posts using Faker

-   Add route protection (401 if not logged in)

-   Error handling middleware in backend

-   Loading states, skeleton UIs
