'use client'

import { Button } from '@mantine/core'
import Link from 'next/link'

export function CreateTeamLink() {
  return (
    <Button component={Link} variant="outline" href="/teams/new">
      Create new team
    </Button>
  )
}
