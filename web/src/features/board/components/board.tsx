'use client'

import { TaskCard } from '@/features/board/components/task-card'
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  ScrollAreaAutosize,
  Stack,
  Title,
} from '@mantine/core'
import { Edit, Plus } from 'lucide-react'
import { useQueryState } from 'nuqs'

const Cols = [
  {
    name: 'To Do',
    cards: [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
    ],
  },
  {
    name: 'In Progress',
    cards: [{ id: '3', title: 'Task 3' }],
  },
  {
    name: 'Done',
    cards: [{ id: '4', title: 'Task 4' }],
  },
  {
    name: 'Review',
    cards: [{ id: '5', title: 'Task 5' }],
  },
]

export function Board() {
  const [teamId] = useQueryState('teamId')

  if (!teamId) {
    return <div>Please select a team to view the board.</div>
  }

  return (
    <ScrollAreaAutosize scrollbars="x" offsetScrollbars px="md">
      <Group justify="flex-start" wrap="nowrap">
        {Cols.map(({ name, cards }) => (
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
  )
}
