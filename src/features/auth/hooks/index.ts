/**
 * Auth Feature Hooks
 * 
 * Centralized hooks for authentication functionality.
 */

// Main auth hook - combines store, queries, and mutations
export { useAuth } from './use-auth'

// User profile query hook with keys
export { useUserProfileQuery, usersQueryKeys } from './use-users-query'
