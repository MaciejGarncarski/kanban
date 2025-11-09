'use client'

import { useTeams } from '@/features/teams/hooks/use-teams'
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
  Box,
} from '@mantine/core'
import { useRouter } from 'next/navigation'

type Props = {
  readableTeamId: string | null
}

export function TeamSwitchCombobox({ readableTeamId }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const router = useRouter()

  const setTeam = async (val: string) => {
    combobox.closeDropdown()
    router.replace('/teams/' + val)
  }

  return (
    <Combobox
      store={combobox}
      width={250}
      radius="md"
      onOptionSubmit={setTeam}
      transitionProps={{ duration: 200, transition: 'pop' }}>
      {readableTeamId ? (
        <TeamSwitchInput combobox={combobox} readableTeamId={readableTeamId} />
      ) : (
        <TeamSwitchInputEmpty combobox={combobox} />
      )}
      <Combobox.Dropdown>
        <Combobox.Options>
          <TeamSwitchOptions readableTeamId={readableTeamId} />
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
          radius="md"
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
  readableTeamId,
}: {
  combobox: ComboboxStore
  readableTeamId: string
}) => {
  const { data: teamsData } = useTeams()

  return (
    <Combobox.Target>
      <Input.Wrapper label="Team">
        <InputBase
          component="button"
          type="button"
          pointer
          radius="md"
          w="12rem"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <>
            {readableTeamId && (
              <Text
                w="100%"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {
                  teamsData.teams.find(
                    (team) => team.readableId === readableTeamId,
                  )?.name
                }
              </Text>
            )}
            {!readableTeamId && (
              <Input.Placeholder>Select team</Input.Placeholder>
            )}
          </>
        </InputBase>
      </Input.Wrapper>
    </Combobox.Target>
  )
}

const TeamSwitchOptions = ({
  readableTeamId,
}: {
  readableTeamId: string | null
}) => {
  const { data: teamsData } = useTeams()

  if (!teamsData.teams || teamsData.teams.length === 0) {
    return <Text>No teams found</Text>
  }

  return teamsData.teams.map(({ description, readableId, name }) => (
    <Combobox.Option value={readableId} key={readableId}>
      <Group gap="sm" wrap="nowrap">
        {readableId === readableTeamId ? (
          <Box w="12">
            <CheckIcon size={12} style={{ flexGrow: 0, flexShrink: 0 }} />
          </Box>
        ) : (
          <Box w="12"></Box>
        )}
        <Flex direction={'column'}>
          <Text>{name}</Text>
          <Text size="xs">{description}</Text>
        </Flex>
      </Group>
    </Combobox.Option>
  ))
}
