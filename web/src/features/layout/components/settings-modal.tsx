'use client'

import { CreateBoardLink } from '@/features/layout/components/create-board-link'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { Button, Group, Modal, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { SettingsIcon } from 'lucide-react'

type Props = {
  teamId?: string
}

export function SettingsModal({ teamId }: Props) {
  const [opened, { open, close }] = useDisclosure(false)
  const { isAdmin } = useRoleByTeamId(teamId || '')

  return (
    <>
      <Button
        onClick={open}
        variant="light"
        leftSection={<SettingsIcon size={16} />}>
        Settings
      </Button>

      <Modal opened={opened} onClose={close} title="Settings" centered>
        <Stack>
          <Group>
            {teamId && <CreateBoardLink teamId={teamId} />}
            <CreateTeamLink />
          </Group>
        </Stack>
        {isAdmin && <p>todo manage users form modal?</p>}
      </Modal>
    </>
  )
}
