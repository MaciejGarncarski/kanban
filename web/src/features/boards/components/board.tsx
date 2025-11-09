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
import { AnimatePresence, LayoutGroup } from 'motion/react'
import { useRefetchNotification } from '@/features/boards/hooks/use-refetch-notification'

export const Board = ({
  readableTeamId,
  readableBoardId,
}: {
  readableTeamId: string
  readableBoardId: string
}) => {
  useMonitorElements({ readableBoardId })
  const { data: boardData } = useBoardById({ readableBoardId })
  const { isDraggedOver, ref } = useDraggedOver({}, 'horizontal')
  const { isAdmin } = useRoleByTeamId(readableTeamId)
  useRefetchNotification({ readableBoardId })

  if (!boardData) {
    return <div>Board not found</div>
  }

  return (
    <LayoutGroup id={readableBoardId}>
      <Flex direction="column" gap="md">
        <Title order={2} size="20" px="sm">
          {boardData?.description || 'No description.'}
        </Title>
        <ScrollAreaAutosize
          scrollbars="x"
          offsetScrollbars
          id="test"
          viewportRef={ref}>
          <Group justify="flex-start" wrap="nowrap" gap="xl" pb="md" px="sm">
            <>
              {boardData.columns.length === 0 && (
                <Card
                  withBorder
                  shadow="sm"
                  h={'40rem'}
                  radius={'md'}
                  w="20rem"
                  style={{ flexShrink: 0, justifyContent: 'center' }}>
                  <Center>No columns found.</Center>
                </Card>
              )}
              <AnimatePresence mode="popLayout" initial={false}>
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
              </AnimatePresence>
            </>

            {isAdmin &&
              MAX_COLUMN_COUNT > (boardData?.columns.length || 0) &&
              !isDraggedOver && (
                <Card
                  withBorder
                  shadow="sm"
                  h={'40rem'}
                  radius={'md'}
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
    </LayoutGroup>
  )
}
