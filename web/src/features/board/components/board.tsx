'use client'

import { appQuery } from '@/api-client/api-client'
import { MAX_COLUMN_COUNT } from '@/const/column'
import { AddTaskCardModal } from '@/features/board/components/add-task-card-modal'
import { TaskCard } from '@/features/board/components/task-card'
import { AddColumnModal } from '@/features/column/components/add-column-modal'
import {
  ActionIcon,
  Card,
  Center,
  Flex,
  Group,
  ScrollAreaAutosize,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { Edit } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function Board() {
  const [teamId] = useQueryState('teamId')
  const [boardId] = useQueryState('boardId')

  if (!teamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!boardId) {
    return <div>Please select a board to view its contents.</div>
  }

  return <BoardContent boardId={boardId} />
}

const BoardContent = ({ boardId }: { boardId: string }) => {
  const { data } = appQuery.useSuspenseQuery('get', '/v1/boards/{id}', {
    params: { path: { id: boardId } },
  })

  return (
    <Flex direction="column" gap="md">
      <Text>
        {data?.description || 'No description provided for this board.'}
      </Text>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars>
        <Group justify="flex-start" wrap="nowrap" gap="lg">
          {data?.columns.map(({ name, cards, id: columnId }) => {
            return (
              <Card
                key={name}
                withBorder
                shadow="sm"
                h={'40rem'}
                w="20rem"
                style={{ flexShrink: 0 }}>
                <Group justify="space-between">
                  <Title order={2}>{name}</Title>
                  <ActionIcon variant="light">
                    <Edit size="70%" />
                  </ActionIcon>
                </Group>
                <ScrollAreaAutosize scrollbars="y" maw={'20rem'}>
                  <Stack gap="md" mt="lg" px="4" py="xs" w="18rem">
                    {cards.map(
                      ({ id, title, assignedTo, description, dueDate }) => (
                        <TaskCard
                          key={id}
                          boardId={boardId}
                          description={description}
                          title={title}
                          assignedToId={assignedTo}
                          dueDate={dueDate ? new Date(dueDate) : null}
                        />
                      ),
                    )}
                    <AddTaskCardModal boardId={boardId} columnId={columnId} />
                  </Stack>
                </ScrollAreaAutosize>
              </Card>
            )
          })}

          {MAX_COLUMN_COUNT > (data?.columns.length || 0) && (
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
