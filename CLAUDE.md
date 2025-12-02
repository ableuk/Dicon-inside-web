# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DCinside-web is a classroom management web application built with React, TypeScript, and Vite. The app provides features for managing seating arrangements, meal information, notices, and anonymous suggestions for a classroom environment.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Set up environment variables (configure Supabase credentials)
```

### Development
```bash
npm run dev                   # Start development server (Vite)
npm run build                 # TypeScript type-check + production build
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

### TypeScript
```bash
npx tsc -b                    # Type-check only (no emit)
```

## Architecture

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **External API**: 밥.net (xn--rh3b.net) for meal data

### Path Aliases
The project uses `@/` as an alias for `src/`:
- Configure in `vite.config.ts` (resolve.alias)
- Configure in `tsconfig.app.json` (paths)
- Always use `@/` imports instead of relative paths

### API Proxy Configuration
The Vite dev server proxies `/api` requests to `https://api.xn--rh3b.net`:
- **Development**: Uses `/api` prefix (proxied via Vite)
- **Production**: Direct calls to `https://api.xn--rh3b.net`
- See `vite.config.ts` server.proxy configuration
- Meal service automatically switches based on `import.meta.env.DEV`

### Type System
All TypeScript types are centralized:
- `src/types/index.ts` - Core domain types (Student, Notice, Suggestion, Meal, SeatMap, User)
- `src/types/meal.ts` - Meal API specific types (MealData, MealResponse, MealSearchResponse)

When adding new features, define types in the appropriate file before implementation.

### Routing Structure
All routes are defined in `src/App.tsx`:

**Public Routes:**
- `/login` - Google OAuth login page
- `/auth/callback` - OAuth callback handler

**Protected Routes (require authentication):**
- `/` - Home page with feature cards
- `/seats` - Seating arrangement view
- `/meals` - Meal information (integrates with 밥.net API)
- `/notices` - Notices board
- `/suggestions` - Anonymous suggestions

To add a new route:
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` (wrap with `<ProtectedRoute>` if authentication required)
3. Update home page feature cards if needed

### Component Organization
```
src/
├── components/         # Reusable UI components
│   ├── FeatureCard.tsx    # Home page feature cards
│   ├── MealCard.tsx       # Meal display cards
│   ├── ProtectedRoute.tsx # Authentication route wrapper
│   └── UserHeader.tsx     # User info and logout header
├── contexts/          # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── pages/             # Route-level page components
│   ├── LoginPage.tsx         # Google OAuth login
│   └── AuthCallbackPage.tsx # OAuth callback handler
├── services/          # External API integration
│   ├── authService.ts         # Supabase authentication
│   ├── mealService.ts         # Meal API client
│   └── mealServiceHelpers.ts  # Response handling
├── config/            # Configuration files
│   ├── supabase.ts           # Supabase client initialization
│   └── firebase.ts           # Firebase (legacy, being phased out)
└── types/             # TypeScript type definitions
```

### Service Layer Pattern
The meal service (`src/services/mealService.ts`) demonstrates the service pattern:
- Centralizes external API communication
- Handles date formatting (YYYYMMDD → YYYY-MM-DD)
- Provides fallback dummy data during development
- Separates response handling into helpers
- Exports: `fetchMealData()`, `getMealDataServerSide()`, `refreshMealData()`, `searchFoodImage()`

Apply similar patterns when integrating other external services.

### Authentication System
The app uses Supabase for authentication:

**Configuration:**
- Client initialization in `src/config/supabase.ts`
- Exports: `supabase` client instance
- Credentials via environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Authentication Service (`src/services/authService.ts`):**
- `signInWithGoogle()` - Initiates Google OAuth flow
- `signOut()` - Logs out current user
- `getCurrentUser()` - Returns current authenticated user
- `getSession()` - Retrieves current session
- `onAuthStateChange()` - Subscribes to auth state changes
- `getUserRole()` - Fetches user role from database
- `upsertUserProfile()` - Creates/updates user profile

**Auth Context (`src/contexts/AuthContext.tsx`):**
- Provides `user`, `isLoading`, and `signOut` to components
- Use `useAuth()` hook to access auth state
- Automatically manages auth state subscription

**Protected Routes:**
- Wrap routes with `<ProtectedRoute>` component
- Redirects to `/login` if user is not authenticated
- Shows loading state while checking authentication

**OAuth Flow:**
1. User visits `/login` and clicks "Google로 로그인"
2. Redirected to Google OAuth consent screen
3. After consent, redirected to `/auth/callback`
4. Callback handler processes auth and creates/updates user profile
5. User redirected to home page

### Firebase Integration (Legacy)
Firebase configuration remains for backward compatibility:
- Configuration in `src/config/firebase.ts`
- Being phased out in favor of Supabase
- Do not use for new features

### Styling Approach
Uses Tailwind CSS utility classes:
- Configuration in `tailwind.config.js`
- No custom theme extensions currently
- Style components inline with Tailwind utilities
- Consistent with React Router DOM's component-based architecture

### TypeScript Configuration
Strict mode enabled with additional checks:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- JSX preset: `react-jsx` (uses automatic JSX runtime)

All code must pass TypeScript checks before building.

### ESLint Configuration
Uses flat config format (`eslint.config.js`):
- Extends recommended configs for JS, TS, React Hooks, React Refresh
- Configured for React 19 and Vite
- Ignores `dist/` directory

## Environment Variables

Required for Supabase integration:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Legacy Firebase variables (being phased out):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Copy `.env.example` to `.env` and populate with actual Supabase project credentials.

## Supabase Setup

### Database Schema

The app requires a `users` table in Supabase with the following schema:

```sql
create table users (
  id uuid references auth.users primary key,
  email text not null,
  name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- Allow users to read their own profile
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Allow insert on first login (via service)
create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id);
```

### Google OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Configure OAuth redirect URL: `http://localhost:5173/auth/callback` (development)
4. Add production URL when deploying: `https://yourdomain.com/auth/callback`
5. Add Google OAuth credentials from Google Cloud Console
