export const teamRoles = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type TeamRole = (typeof teamRoles)[keyof typeof teamRoles]
