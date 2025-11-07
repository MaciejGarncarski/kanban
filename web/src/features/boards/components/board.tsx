'use client'

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
import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useEffect } from 'react'
import { autoScrollWindowForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { LayoutGroup } from 'motion/react'

export const Board = ({
  readableTeamId,
  readableBoardId,
}: {
  readableTeamId: string
  readableBoardId: string
}) => {
  useMonitorElements({ readableBoardId })
  const { data: boardData } = useBoardById({ readableBoardId })
  const { isDraggedOver, ref } = useDraggedOver({})
  const { isAdmin } = useRoleByTeamId(readableTeamId)

  useEffect(() => {
    return autoScrollWindowForElements()
  })

  if (!boardData) {
    return <div>Board not found</div>
  }

  return (
    <Flex direction="column" gap="md">
      <Title order={2}>
        {boardData?.description || 'No description provided for this board.'}
      </Title>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars id="test">
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
            <LayoutGroup id={`board-${boardData.readableId}-columns`}>
              {boardData?.columns.map(
                ({ name, cards, id: columnId, createdAt }) => {
                  return (
                    <Column
                      key={columnId}
                      readableTeamId={boardData.readableTeamId}
                      name={name}
                      columnId={columnId}
                      createdAt={createdAt}
                      cards={cards}
                    />
                  )
                },
              )}
            </LayoutGroup>
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
                  <AddColumnModal readableBoardId={readableBoardId} />
                </Center>
              </Card>
            )}
        </Group>
      </ScrollAreaAutosize>
    </Flex>
  )
}
