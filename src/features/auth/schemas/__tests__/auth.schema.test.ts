/**
 * Auth Schema Unit Tests
 *
 * Tests for Zod validation schemas used in auth forms.
 */

import {
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupPasswordSchema,
} from '../auth.schema'

describe('emailSchema', () => {
  it('should accept valid email', () => {
    const result = emailSchema.safeParse('user@example.com')
    expect(result.success).toBe(true)
  })

  it('should reject empty email', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Vui lòng nhập email')
    }
  })

  it('should reject invalid email format', () => {
    const result = emailSchema.safeParse('invalid-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email không hợp lệ')
    }
  })

  it('should reject email without domain', () => {
    const result = emailSchema.safeParse('user@')
    expect(result.success).toBe(false)
  })
})

describe('passwordSchema', () => {
  it('should accept valid password (8+ chars)', () => {
    const result = passwordSchema.safeParse('password123')
    expect(result.success).toBe(true)
  })

  it('should reject empty password', () => {
    const result = passwordSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Vui lòng nhập mật khẩu')
    }
  })

  it('should reject password shorter than 8 chars', () => {
    const result = passwordSchema.safeParse('short')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mật khẩu phải có ít nhất 8 ký tự')
    }
  })
})

describe('strongPasswordSchema', () => {
  it('should accept strong password', () => {
    const result = strongPasswordSchema.safeParse('Password1')
    expect(result.success).toBe(true)
  })

  it('should reject password without uppercase', () => {
    const result = strongPasswordSchema.safeParse('password1')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('chữ hoa'))).toBe(true)
    }
  })

  it('should reject password without lowercase', () => {
    const result = strongPasswordSchema.safeParse('PASSWORD1')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('chữ thường'))).toBe(true)
    }
  })

  it('should reject password without number', () => {
    const result = strongPasswordSchema.safeParse('Passwordd')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('số'))).toBe(true)
    }
  })

  it('should reject password shorter than 8 chars', () => {
    const result = strongPasswordSchema.safeParse('Pass1')
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should accept login with rememberMe', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rememberMe).toBe(true)
    }
  })

  it('should default rememberMe to false', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rememberMe).toBe(false)
    }
  })

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('should accept valid reset password data', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token-123',
      newPassword: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      newPassword: 'NewPassword1',
      confirmPassword: 'DifferentPassword1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('không khớp'))).toBe(true)
    }
  })

  it('should reject empty token', () => {
    const result = resetPasswordSchema.safeParse({
      token: '',
      newPassword: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject weak password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      newPassword: 'weakpass',
      confirmPassword: 'weakpass',
    })
    expect(result.success).toBe(false)
  })
})

describe('setupPasswordSchema', () => {
  it('should accept valid setup password data', () => {
    const result = setupPasswordSchema.safeParse({
      email: 'staff@example.com',
      token: 'invite-token-123',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = setupPasswordSchema.safeParse({
      email: 'staff@example.com',
      token: 'invite-token',
      password: 'StrongPass1',
      confirmPassword: 'DifferentPass1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('không khớp'))).toBe(true)
    }
  })

  it('should reject invalid email', () => {
    const result = setupPasswordSchema.safeParse({
      email: 'invalid-email',
      token: 'token',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    })
    expect(result.success).toBe(false)
  })
})
