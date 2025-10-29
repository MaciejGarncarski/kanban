'use client'

import { appQuery } from '@/api-client/api-client'
import {
  Combobox,
  Flex,
  Input,
  InputBase,
  Group,
  Text,
  useCombobox,
} from '@mantine/core'
import { CheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function BoardSwitch() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [boardId, setBoardId] = useQueryState('boardId')
  const [teamId] = useQueryState('teamId')
  const { data } = appQuery.useQuery(
    'get',
    '/v1/teams/{teamId}/boards',
    {
      params: { path: { teamId: teamId || '' } },
    },
    {
      enabled: !!teamId,
    },
  )

  const setBoard = (val: string | null) => {
    if (!val) return
    setBoardId(val)
  }

  const options = data?.boards.map(({ description, id, name }) => (
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

  return (
    <Combobox
      store={combobox}
      width={250}
      onOptionSubmit={(val) => {
        setBoard(val)
        combobox.closeDropdown()
      }}>
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          w="12rem"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <>
            {boardId &&
              data?.boards.find((board) => board.id === boardId)?.name}
            {!boardId && <Input.Placeholder>Select board</Input.Placeholder>}
          </>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
