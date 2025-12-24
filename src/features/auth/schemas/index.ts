/**
 * Auth Feature Schemas
 *
 * Barrel export for all auth validation schemas
 */

export {
  // Reusable schemas
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  
  // Form schemas
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupPasswordSchema,
  
  // Types
  type LoginFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type SetupPasswordFormData,
} from './auth.schema'
