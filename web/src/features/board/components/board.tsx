'use client'

import { appQuery } from '@/api-client/api-client'
import { MAX_COLUMN_COUNT } from '@/const/column'
import { AddColumnModal } from '@/features/column/components/add-column-modal'
import { Column } from '@/features/column/components/column'
import {
  Card,
  Center,
  Flex,
  Group,
  ScrollAreaAutosize,
  Title,
} from '@mantine/core'
import { useDraggedOver } from '@/hooks/use-dragged-over'
import { useMonitorElements } from '@/features/board/hooks/use-monitor-elements'

export const Board = ({ boardId }: { boardId: string }) => {
  useMonitorElements({ boardId })
  const { data: boardData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/boards/{boardId}',
    {
      params: { path: { boardId } },
    },
  )

  const { isDraggedOver, ref } = useDraggedOver({})

  return (
    <Flex direction="column" gap="md">
      <Title order={2}>
        {boardData?.description || 'No description provided for this board.'}
      </Title>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars>
        <Group justify="flex-start" wrap="nowrap" gap="lg" ref={ref}>
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

          {MAX_COLUMN_COUNT > (boardData?.columns.length || 0) &&
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
