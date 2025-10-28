'use client'

import { appQuery } from '@/api-client/api-client'
import {
  Combobox,
  Flex,
  Input,
  InputBase,
  Text,
  useCombobox,
} from '@mantine/core'
import { useQueryState } from 'nuqs'

export function TeamSwitch() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [teamId, setTeamId] = useQueryState('teamId')
  const { data } = appQuery.useSuspenseQuery('get', '/v1/teams')

  const setTeam = (val: string | null) => {
    if (!val) return
    setTeamId(val)
  }

  const options = data.teams.map(({ created_at, description, id, name }) => (
    <Combobox.Option value={id} key={id}>
      <Flex direction={'column'}>
        <Text>{name}</Text>
        <Flex>
          <Text size="xs">{description}</Text>
          <Text size="xs">{new Date(created_at).toLocaleString()}</Text>
        </Flex>
      </Flex>
    </Combobox.Option>
  ))

  return (
    <Combobox
      store={combobox}
      width={250}
      onOptionSubmit={(val) => {
        setTeam(val)
        combobox.closeDropdown()
      }}>
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <>
            {teamId && data.teams.find((team) => team.id === teamId)?.name}
            {!teamId && <Input.Placeholder>Pick value</Input.Placeholder>}
          </>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
