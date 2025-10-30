'use client'

import { appQuery } from '@/api-client/api-client'
import { Combobox, Flex, Group, Text } from '@mantine/core'
import { CheckIcon } from 'lucide-react'

type Props = {
  teamId: string
  boardId: string | null
}

export function BoardSwitchOptions({ teamId, boardId }: Props) {
  const { data } = appQuery.useSuspenseQuery(
    'get',
    '/v1/teams/{teamId}/boards',
    {
      params: { path: { teamId: teamId } },
    },
  )

  if (!data.boards) {
    return null
  }

  return data.boards.map(({ description, id, name }) => (
    <Combobox.Option value={id} key={id}>
      <Group gap="sm" wrap="nowrap">
        {id === boardId && (
          <CheckIcon size={12} style={{ flexGrow: 0, flexShrink: 0 }} />
        )}
        <Flex direction={'column'}>
          <Text>{name}</Text>
          <Text size="xs">{description}</Text>
        </Flex>
      </Group>
    </Combobox.Option>
  ))
}
