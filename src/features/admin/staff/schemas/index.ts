/**
 * Staff Feature Schemas
 *
 * Barrel export for all staff validation schemas
 */

export {
  // Enum schemas
  staffRoleSchema,
  staffStatusSchema,
  phoneSchema,

  // Form schemas
  inviteStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,

  // Types
  type InviteStaffFormData,
  type UpdateStaffFormData,
  type UpdateStaffStatusFormData,
  type StaffRole,
  type StaffStatus,
} from './staff.schema'
