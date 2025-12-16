// Helper function to get initials from full name
export const getInitials = (fullName: string): string => {
  const names = fullName.trim().split(/\s+/)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

// Helper function to map role to Vietnamese label
export const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    owner: 'Chủ nhà hàng',
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    waiter: 'Nhân viên phục vụ',
    chef: 'Đầu bếp',
    customer: 'Khách hàng',
  }
  return roleMap[role.toLowerCase()] || role
}



