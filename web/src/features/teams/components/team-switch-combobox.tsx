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
import { useRouter } from 'next/navigation'

type Props = {
  teamId: string | null
}

export function TeamSwitchCombobox({ teamId }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const router = useRouter()

  const setTeam = async (val: string) => {
    combobox.closeDropdown()
    router.replace('/teams/' + val)
  }

  return (
    <Combobox store={combobox} width={250} onOptionSubmit={setTeam}>
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
            {teamId &&
              data.teams.find((team) => team.readableId === teamId)?.name}
            {!teamId && <Input.Placeholder>Select team</Input.Placeholder>}
          </>
        </InputBase>
      </Input.Wrapper>
    </Combobox.Target>
  )
}

const TeamSwitchOptions = ({ teamId }: { teamId: string | null }) => {
  const { data } = appQuery.useSuspenseQuery('get', '/v1/teams')

  if (!data.teams || data.teams.length === 0) {
    return <Text>No teams found</Text>
  }

  return data.teams.map(({ description, readableId, name }) => (
    <Combobox.Option value={readableId} key={readableId}>
      <Group gap="sm" wrap="nowrap">
        {readableId === teamId && (
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
