# QRenso Frontend - Admin Dashboard

Modern admin dashboard for restaurant management built with **Next.js 16**, **React 19**, and **TypeScript**.

## Tech Stack

| Category        | Technology                              |
| --------------- | --------------------------------------- |
| **Framework**   | Next.js 16 (App Router)                 |
| **UI**          | React 19, Tailwind CSS 4, Radix UI      |
| **State**       | Zustand, TanStack React Query           |
| **API**         | Axios with auto-refresh token           |
| **Icons**       | Lucide React                            |
| **Drag & Drop** | dnd-kit                                 |
| **Charts**      | Recharts                                |
| **Styling**     | Tailwind CSS + Class Variance Authority |

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
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Customer Site URL (for QR code generation)
NEXT_PUBLIC_CUSTOMER_SITE_URL=http://localhost:3002

# Application Name (optional)
NEXT_PUBLIC_APP_NAME=QRenso
```

**Required Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_CUSTOMER_SITE_URL` - Base URL for customer-facing site (used in QR codes)

**Optional Variables:**
- `NEXT_PUBLIC_APP_NAME` - Application display name (default: "QRenso")

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

| Component        | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `ProtectedRoute` | Redirects unauthenticated users to `/auth/login`    |
| `GuestRoute`     | Redirects authenticated users to `/admin/dashboard` |

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

- 📊 **Dashboard Overview**
  - Real-time statistics (orders, revenue, tables)
  - Revenue charts (daily, weekly, monthly)
  - Recent orders list
  - Quick actions panel

- 🍽️ **Menu Management**
  - **Menu Items**: CRUD operations with images, pricing, availability
  - **Categories**: Drag-and-drop reordering, active/inactive toggle
  - **Modifiers**: Create modifier groups (size, extras) with min/max selections
  - Search and filter across all menu items
  - Bulk actions for status updates

- 🪑 **Table & Zone Management**
  - **Zones**: Create dining areas (VIP, outdoor, main floor)
  - **Tables**: Drag-and-drop layout editor with live preview
  - Table shapes (circle, rectangle, oval) and rotation
  - Capacity and status management
  - QR code generation per table

- 📱 **QR Code Management**
  - Generate QR codes for all tables
  - Download individual QR codes (PNG 512x512)
  - Batch download all QR codes (ZIP)
  - Download printable PDF with restaurant branding
  - QR code preview and regeneration

- 👥 **User Management**
  - Staff accounts (admin, waiter, kitchen_staff)
  - Role-based access control (RBAC)
  - User status management (active, inactive, suspended)
  - Email verification tracking

- 📦 **Order Management**
  - View all orders with filtering (status, date, table)
  - Update order status (pending → accepted → in_progress → ready → served → completed)
  - Assign orders to waiters
  - Kitchen display view for preparation
  - Order history and analytics

- 💳 **Payment Management**
  - View payment history
  - Payment method tracking (cash, QR/PayOS)
  - Payment status monitoring
  - Manual cash payment completion
  - PayOS integration credentials management

- ⚙️ **Settings**
  - **Restaurant Profile**: Name, address, logo, operating hours
  - **Locale Settings**: Currency, timezone, language, date format
  - **Tax & Service Charge**: Configure rates and rules
  - **Payment Integration**: PayOS API credentials
  - **Order Rules**: Minimum order value, prep time, session timeout
  - **Receipt Customization**: Header and footer text
  - **Notification Settings**: Sound alerts for new orders

### Authentication

- 🔐 Login with email/password
- 📝 Signup for new restaurant owners
- 🔑 Password reset via email with account type validation
- ✅ Email verification
- 🔄 Remember me functionality
- 🌐 Cross-tab logout sync (BroadcastChannel)
- 🔒 Role-based route protection

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

- **Auto-attach `Authorization` header** - Bearer token from auth store
- **Auto-attach `x-tenant-id` header** - Multi-tenant isolation
- **Auto-refresh expired access tokens** - Seamless token renewal
- **Error handling and retry logic** - Graceful error recovery
- **Request/response interceptors** - Global error handling

### API Client Example

```typescript
import { apiClient } from '@/lib/axios';

// API calls automatically include auth headers
const response = await apiClient.get('/menu/items');
const menuItems = response.data.data;
```

## State Management

### Zustand Stores

- **Auth Store** (`store/auth-store.ts`)
  - User authentication state
  - Access token management
  - Login/logout/token refresh
  - Cross-tab state sync

- **Tenant Store** (`store/tenant-store.ts`)
  - Selected tenant context
  - Multi-tenant switching
  - Tenant-specific data caching

### React Query

Used for server state management with:
- **Automatic caching** - Reduce redundant API calls
- **Background refetching** - Keep data fresh
- **Optimistic updates** - Instant UI feedback
- **Error handling** - Automatic retry with exponential backoff
- **Pagination** - Infinite scroll and pagination support

**Query Hooks:**
- `use-menu-items-query.ts` - Menu items with filtering
- `use-categories-query.ts` - Categories list
- `use-tables-query.ts` - Tables and zones
- `use-orders-query.ts` - Order management
- `use-users-query.ts` - Staff management

## Key Features Deep Dive

### Table Layout Editor

**Features:**
- Drag-and-drop tables on canvas
- Resize and rotate tables
- Grid snapping for alignment
- Zoom in/out for large layouts
- Save/load table positions
- Real-time preview

**Implementation:**
- Uses `@dnd-kit/core` for drag and drop
- Canvas rendering with CSS transforms
- Table position stored as JSON: `{"x": 100, "y": 200, "rotation": 0}`

### QR Code Generation

**Features:**
- JWT-based QR tokens (365-day expiry)
- Embedded table and tenant information
- Download formats: PNG, PDF, ZIP (all tables)
- PDF includes restaurant logo and table info
- Automatic regeneration on table changes

**QR Code Data Structure:**
```json
{
  "sub": "guest_table_{tableId}",
  "role": "guest",
  "tenantId": "...",
  "tableId": "...",
  "tableNumber": "A1",
  "tableCapacity": 4,
  "tenantName": "Joe's Diner",
  "zoneName": "Main Floor",
  "iat": 1234567890
}
```

### Multi-Tenant System

**Architecture:**
- **Super Admin**: Manage all tenants
- **Owner**: Own multiple restaurants, full access to owned tenants
- **Admin**: Manage single restaurant (assigned tenant)
- **Waiter**: Take orders, view menu, tables
- **Kitchen Staff**: View orders, update preparation status

**Tenant Isolation:**
- All API requests include `X-Tenant-Id` header
- Database queries filtered by `tenantId`
- Users can only access assigned tenant data
- Owners can switch between owned restaurants

### Real-time Order Updates

**Features:**
- WebSocket connection for live order updates
- Desktop notifications for new orders
- Sound alerts (configurable)
- Auto-refresh order list
- Status change animations

**Implementation:**
- Socket.IO client for real-time communication
- Event listeners for order status changes
- React Query cache invalidation on updates

## Performance Optimizations

- **Next.js 16 App Router** - React Server Components for faster rendering
- **Image Optimization** - Next.js `Image` component with lazy loading
- **Code Splitting** - Automatic route-based splitting
- **React 19** - Concurrent rendering and automatic batching
- **Memoization** - React.memo, useMemo, useCallback for expensive operations
- **Virtualization** - Virtual scrolling for large lists
- **Debouncing** - Search inputs debounced to reduce API calls

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo for automatic deployments
```

### Docker

```bash
# Build Docker image
docker build -t frontend .

# Run container
docker run -p 3001:3001 frontend
```

### Self-Hosted

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

**Important:** 
- Set environment variables in your deployment platform
- Ensure backend CORS allows frontend domain
- Use HTTPS in production for secure cookies

## Troubleshooting

### Common Issues

**1. CORS Errors**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure backend CORS configuration includes frontend URL

**2. Token Refresh Loop**
```
Infinite token refresh requests
```
**Solution:** Check that backend returns valid refresh token in HTTP-only cookie

**3. Route Protection Not Working**
```
ProtectedRoute redirects even when authenticated
```
**Solution:** Verify auth store is hydrated from localStorage before rendering

**4. Multi-Tenant Context Missing**
```
API returns 403 Forbidden
```
**Solution:** Ensure `X-Tenant-Id` header is set in axios interceptor

## Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests with Playwright
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing file structure conventions
- Run `pnpm lint` before committing
- Use `pnpm format` to format code

### Git Workflow
- Create feature branches from `develop`
- Use conventional commit messages
- Submit PR with detailed description

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
