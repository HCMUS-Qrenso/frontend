# QRenso Frontend - Admin Dashboard

Modern admin dashboard for restaurant management built with **Next.js 16**, **React 19**, and **TypeScript**.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4, Radix UI |
| **State** | Zustand, TanStack React Query |
| **API** | Axios with auto-refresh token |
| **Icons** | Lucide React |
| **Drag & Drop** | dnd-kit |
| **Charts** | Recharts |
| **Styling** | Tailwind CSS + Class Variance Authority |

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development server (runs on port 3001)
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard routes
│   │   ├── dashboard/      # Dashboard overview
│   │   ├── menu/           # Menu management (items, categories, modifiers)
│   │   ├── tables/         # Table & zone management
│   │   ├── qr/             # QR code management
│   │   └── settings/       # Settings & profile
│   ├── auth/               # Authentication routes (login, signup, reset-password)
│   └── contact/            # Public contact page
├── components/
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Auth components (ProtectedRoute, GuestRoute)
│   ├── landing/            # Landing page components
│   └── ui/                 # Shadcn/UI components
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts         # Authentication hook
│   ├── use-*-query.ts      # TanStack Query hooks for each resource
│   └── use-error-handler.ts
├── lib/
│   ├── api/                # API client functions
│   ├── axios.ts            # Axios config with interceptors
│   └── utils/              # Utility functions
├── store/                  # Zustand stores
│   ├── auth-store.ts       # Authentication state
│   └── tenant-store.ts     # Multi-tenant state
├── types/                  # TypeScript type definitions
└── providers/              # React context providers
```

## Authentication

The app uses **HTTP-only refresh token cookies** for session persistence:

- **Access Token**: Stored in memory (Zustand store)
- **Refresh Token**: HTTP-only cookie set by backend
- **Session Persistence**: Users remain logged in across browser tabs/sessions

### Route Guards

| Component | Purpose |
|-----------|---------|
| `ProtectedRoute` | Redirects unauthenticated users to `/auth/login` |
| `GuestRoute` | Redirects authenticated users to `/admin/dashboard` |

## Available Scripts

```bash
pnpm dev          # Start dev server on port 3001
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm type-check   # TypeScript type checking
```

## Features

### Admin Dashboard
- 📊 Dashboard with statistics and charts
- 🍽️ Menu management (items, categories, modifiers)
- 🪑 Table & zone management with layout editor
- 📱 QR code generation and management
- 👥 User management
- ⚙️ Settings and profile

### Authentication
- 🔐 Login with email/password
- 📝 Signup for new owners
- 🔑 Password reset via email
- ✅ Email verification
- 🔄 Remember me functionality
- 🌐 Cross-tab logout sync (BroadcastChannel)

### Multi-tenant Support
- Owners can manage multiple restaurants
- Admin/staff are bound to specific tenant
- Tenant selection persisted in localStorage

## Code Conventions

- **Components**: PascalCase (`MenuItemsTable.tsx`)
- **Hooks**: camelCase with `use-` prefix (`use-auth.ts`)
- **Types**: PascalCase, co-located in `/types`
- **API calls**: Centralized in `/lib/api/*`
- **State**: Local state → Zustand → React Query

## API Integration

All API calls go through the configured Axios client with:
- Auto-attach `Authorization` header
- Auto-attach `x-tenant-id` header
- Auto-refresh expired access tokens
- Error handling and retry logic

## Deployment

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

For production deployment, ensure:
- `NEXT_PUBLIC_API_URL` points to production API
- Backend CORS is configured for frontend domain
