'use client'

import { appQuery } from '@/api-client/api-client'
import { MAX_COLUMN_COUNT } from '@/constants/column'
import { AddColumnModal } from '@/features/columns/components/add-column-modal'
import { Column } from '@/features/columns/components/column'
import {
  Card,
  Center,
  Flex,
  Group,
  ScrollAreaAutosize,
  Title,
} from '@mantine/core'
import { useDraggedOver } from '@/hooks/use-dragged-over'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { useMonitorElements } from '@/features/boards/hooks/use-monitor-elements'

export const Board = ({
  teamId,
  boardId,
}: {
  teamId: string
  boardId: string
}) => {
  useMonitorElements({ boardId })
  const { data: boardData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/boards/{boardId}',
    {
      params: { path: { boardId } },
    },
  )
  const { isDraggedOver, ref } = useDraggedOver({})
  const { isAdmin } = useRoleByTeamId(teamId)

  return (
    <Flex direction="column" gap="md">
      <Title order={2}>
        {boardData?.description || 'No description provided for this board.'}
      </Title>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars>
        <Group justify="flex-start" wrap="nowrap" gap="lg" ref={ref}>
          <>
            {boardData.columns.length === 0 && (
              <Card
                withBorder
                shadow="sm"
                h={'40rem'}
                w="20rem"
                style={{ flexShrink: 0, justifyContent: 'center' }}>
                <Center>No columns found</Center>
              </Card>
            )}
            {boardData?.columns.map(
              ({ name, cards, id: columnId, createdAt }) => {
                return (
                  <Column
                    key={columnId}
                    boardId={boardId}
                    name={name}
                    columnId={columnId}
                    createdAt={createdAt}
                    teamId={boardData.readableTeamId}
                    cards={cards}
                  />
                )
              },
            )}
          </>

          {isAdmin &&
            MAX_COLUMN_COUNT > (boardData?.columns.length || 0) &&
            !isDraggedOver && (
              <Card
                withBorder
                shadow="sm"
                h={'40rem'}
                w="20rem"
                style={{ flexShrink: 0, justifyContent: 'center' }}>
                <Center>
                  <AddColumnModal boardId={boardId} />
                </Center>
              </Card>
            )}
        </Group>
      </ScrollAreaAutosize>
    </Flex>
  )
}
