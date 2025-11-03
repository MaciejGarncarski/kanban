'use client'

import { Button } from '@mantine/core'
import Link from 'next/link'

export function BackToTeamsLink() {
  return (
    <Button component={Link} href="/" variant="subtle" mb="md">
      Back to Teams
    </Button>
  )
}
