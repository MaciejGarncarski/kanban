'use client'

import { appQuery, appQueryNoMiddleware } from '@/api-client/api-client'
import { TaskCard } from '@/features/board/components/task-card'
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  ScrollAreaAutosize,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { Edit, Plus } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function Board() {
  const [teamId] = useQueryState('teamId')
  const [boardId] = useQueryState('boardId')

  const { data } = appQueryNoMiddleware.useQuery(
    'get',
    '/v1/boards/{id}',
    {
      params: { path: { id: boardId || '' } },
    },
    {
      enabled: !!boardId,
    },
  )

  if (!teamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!boardId) {
    return <div>Please select a board to view its contents.</div>
  }

  const colsPerTeam = {
    '': [],
  }

  return (
    <div>
      <Title order={1} mb="md">
        {data?.name || 'Board'}
      </Title>
      <Text>
        {data?.description || 'No description provided for this board.'}
      </Text>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars px="sm">
        <Group justify="flex-start" wrap="nowrap">
          {colsPerTeam[teamId]?.map(({ name, cards }) => (
            <Card
              key={name}
              withBorder
              shadow="sm"
              h={'30rem'}
              w="20rem"
              style={{ flexShrink: 0 }}>
              <Group justify="space-between">
                <Title order={2}>{name}</Title>
                <ActionIcon variant="light">
                  <Edit size="70%" />
                </ActionIcon>
              </Group>
              <Stack gap="md" mt="lg">
                {cards.map(({ id, title }) => (
                  <TaskCard
                    key={id}
                    description="test"
                    title={title}
                    assignedToId="todo-id"
                  />
                ))}
              </Stack>
            </Card>
          ))}

          <Card
            withBorder
            shadow="sm"
            h={'30rem'}
            w="20rem"
            style={{ flexShrink: 0, justifyContent: 'center' }}>
            <Center>
              <Button>
                <Plus /> Add Column
              </Button>
            </Center>
          </Card>
        </Group>
      </ScrollAreaAutosize>
    </div>
  )
}
