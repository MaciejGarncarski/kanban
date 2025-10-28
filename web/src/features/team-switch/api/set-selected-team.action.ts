'use server'

import { TEAM_COOKIE_NAME } from '@/config/cookie.config'
import { setCommonCookie } from '@/utils/set-common-cookie'

export async function setSelectedTeam(teamId: string) {
  await setCommonCookie({ name: TEAM_COOKIE_NAME, value: teamId })
}
