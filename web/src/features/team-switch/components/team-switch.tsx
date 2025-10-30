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
  ComboboxStore,
} from '@mantine/core'
import { CheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function TeamSwitch() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [teamId, setTeamId] = useQueryState('teamId')

  const setTeam = async (val: string | null) => {
    if (!val) return
    setTeamId(val)
  }

  return (
    <Combobox
      store={combobox}
      width={250}
      onOptionSubmit={(val) => {
        setTeam(val)
        combobox.closeDropdown()
      }}>
      {teamId ? (
        <TeamSwitchInput combobox={combobox} teamId={teamId} />
      ) : (
        <TeamSwitchInputEmpty combobox={combobox} />
      )}
      <Combobox.Dropdown>
        <Combobox.Options>
          <TeamSwitchOptions teamId={teamId} />
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
const TeamSwitchInputEmpty = ({ combobox }: { combobox: ComboboxStore }) => {
  return (
    <Combobox.Target>
      <InputBase
        component="button"
        type="button"
        pointer
        w="12rem"
        rightSection={<Combobox.Chevron />}
        rightSectionPointerEvents="none"
        onClick={() => combobox.toggleDropdown()}>
        <Input.Placeholder>Select team</Input.Placeholder>
      </InputBase>
    </Combobox.Target>
  )
}

const TeamSwitchInput = ({
  combobox,
  teamId,
}: {
  combobox: ComboboxStore
  teamId: string
}) => {
  const { data } = appQuery.useSuspenseQuery('get', '/v1/teams')

  return (
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
          {teamId && data.teams.find((team) => team.id === teamId)?.name}
          {!teamId && <Input.Placeholder>Select team</Input.Placeholder>}
        </>
      </InputBase>
    </Combobox.Target>
  )
}

const TeamSwitchOptions = ({ teamId }: { teamId: string | null }) => {
  const { data } = appQuery.useSuspenseQuery('get', '/v1/teams')

  return data.teams.map(({ description, id, name }) => (
    <Combobox.Option value={id} key={id}>
      <Group gap="sm" wrap="nowrap">
        {id === teamId && (
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
