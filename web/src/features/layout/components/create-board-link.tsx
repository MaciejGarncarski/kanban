'use client'

import { Button } from '@mantine/core'
import Link from 'next/link'

type Props = {
  teamId: string
}

export function CreateBoardLink({ teamId }: Props) {
  return (
    <Button
      component={Link}
      variant="outline"
      href={`/teams/${teamId}/boards/new`}>
      Create new board
    </Button>
  )
}
