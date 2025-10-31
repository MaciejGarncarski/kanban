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
  CheckIcon,
} from '@mantine/core'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'

export function TeamSwitch() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [teamId, setTeamId] = useQueryState('teamId')
  const [, setBoardId] = useQueryState('boardId')

  const boards = appQuery.useSuspenseQuery(
    'get',
    '/v1/teams/{teamId}/boards',
    {
      params: { path: { teamId: teamId ?? '' } },
    },
    {
      initialData: { boards: [] },
    },
  )

  useEffect(() => {
    if (!teamId) return

    const fetchBoards = async () => {
      const updatedBoards = await boards.refetch()
      if (!updatedBoards?.data?.boards) {
        setBoardId(null)
      } else {
        setBoardId(updatedBoards.data.boards[0]?.id ?? null)
      }
    }

    fetchBoards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

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
