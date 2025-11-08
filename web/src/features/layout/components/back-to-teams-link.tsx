'use client'

import { Button } from '@mantine/core'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export function BackToTeamsLink() {
  return (
    <Button
      component={Link}
      href="/"
      variant="light"
      mb="md"
      radius={'md'}
      w="fit-content"
      leftSection={<ChevronLeft size={16} />}>
      Back to Teams
    </Button>
  )
}
