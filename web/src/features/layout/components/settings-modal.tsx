'use client'

import { DeleteBoardModal } from '@/features/boards/components/delete-board-modal'
import { EditBoardModal } from '@/features/boards/components/edit-board-modal'
import { DeleteTeamModal } from '@/features/teams/components/delete-team-modal'
import { EditTeamModal } from '@/features/teams/components/edit-team-modal'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { Button, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { SettingsIcon } from 'lucide-react'
import Link from 'next/link'

type Props = {
  teamId?: string
  boardId?: string
}

export function SettingsModal({ teamId, boardId }: Props) {
  const { isAdmin } = useRoleByTeamId(teamId || '')

  const [
    deleteBoardOpened,
    { open: openDeleteBoard, close: closeDeleteBoard },
  ] = useDisclosure(false)

  const [deleteTeamOpened, { open: openDeleteTeam, close: closeDeleteTeam }] =
    useDisclosure(false)

  const [editTeamOpened, { open: openEditTeam, close: closeEditTeam }] =
    useDisclosure(false)

  const [editBoardOpened, { open: openEditBoard, close: closeEditBoard }] =
    useDisclosure(false)

  return (
    <>
      {boardId && isAdmin && (
        <DeleteBoardModal
          boardId={boardId}
          isOpen={deleteBoardOpened}
          onClose={closeDeleteBoard}
        />
      )}

      {teamId && isAdmin && (
        <DeleteTeamModal
          teamId={teamId}
          isOpen={deleteTeamOpened}
          onClose={closeDeleteTeam}
        />
      )}

      {teamId && isAdmin && (
        <EditTeamModal
          teamId={teamId}
          isOpen={editTeamOpened}
          onClose={closeEditTeam}
        />
      )}

      {teamId && boardId && isAdmin && (
        <EditBoardModal
          boardId={boardId}
          isOpen={editBoardOpened}
          onClose={closeEditBoard}
        />
      )}

      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button variant="light" leftSection={<SettingsIcon size={16} />}>
            Settings
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Team</Menu.Label>

          <Menu.Item component={Link} href={`/teams/new`}>
            New team
          </Menu.Item>
          {isAdmin && (
            <Menu.Item color="orange" onClick={openEditTeam}>
              Edit team
            </Menu.Item>
          )}
          {isAdmin && (
            <Menu.Item color="red" onClick={openDeleteTeam}>
              Delete team
            </Menu.Item>
          )}

          {isAdmin && teamId && (
            <>
              <Menu.Divider />
              <Menu.Label>Board</Menu.Label>
              <Menu.Item component={Link} href={`/teams/${teamId}/boards/new`}>
                New board
              </Menu.Item>
              {boardId && (
                <>
                  <Menu.Item color="orange" onClick={openEditBoard}>
                    Edit board
                  </Menu.Item>
                  <Menu.Item color="red" onClick={openDeleteBoard}>
                    Delete board
                  </Menu.Item>
                </>
              )}
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
