'use client'

import { useBoards } from '@/features/boards/hooks/use-boards'
import { CheckIcon, Combobox, Flex, Group, Text } from '@mantine/core'

type Props = {
  readableTeamId: string
  readableBoardId: string | null
}

export function BoardSwitchOptions({ readableTeamId, readableBoardId }: Props) {
  const { data } = useBoards({ readableTeamId })

  if (!data.boards || data.boards.length === 0) {
    return <Text>No boards found</Text>
  }

  return data.boards.map(({ description, readableId, name }) => (
    <Combobox.Option value={readableId} key={readableId}>
      <Group gap="sm" wrap="nowrap">
        {readableId === readableBoardId && (
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
