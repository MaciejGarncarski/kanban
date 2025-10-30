'use client'

import { paths } from '@/api-client/api'
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
import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function TeamSwitch() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const queryClient = useQueryClient()
  const [teamId, setTeamId] = useQueryState('teamId')
  const [, setBoardId] = useQueryState('boardId')

  const setTeam = async (val: string | null) => {
    if (!val) return
    setTeamId(val)

    const queryData = queryClient.getQueryData<
      paths['/v1/teams/{teamId}/boards']['get']['responses']['200']['content']['application/json']
    >([
      'get',
      '/v1/teams/{teamId}/boards',
      {
        params: {
          path: {
            teamId: val,
          },
        },
      },
    ])

    if (!queryData) {
      setBoardId(null)
      return
    }

    setBoardId(queryData.boards[0]?.id ?? null)
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
      <Input.Wrapper label="Team">
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
      </Input.Wrapper>
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
      <Input.Wrapper label="Team">
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
      </Input.Wrapper>
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
