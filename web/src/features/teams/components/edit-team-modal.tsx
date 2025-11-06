'use client'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { useEditTeam } from '@/features/teams/hooks/use-edit-team'
import { useTeamUsers } from '@/features/teams/hooks/use-team-users'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { useAllUsers } from '@/features/users/hooks/use-all-users'
import {
  Button,
  CheckIcon,
  Combobox,
  Group,
  Input,
  InputBase,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  readableTeamId: string
}

export function EditTeamModal({ isOpen, onClose, readableTeamId }: Props) {
  const { data: teamsData } = useTeams()
  const { data: teamUsers } = useTeamUsers({ readableTeamId })
  const { data: userData } = useAuth()
  const { data: allUsersData } = useAllUsers()
  const { mutate, isPending } = useEditTeam()

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const currentTeam = teamsData.teams.find(
    (team) => team.readableId === readableTeamId,
  )

  const form = useForm({
    initialValues: {
      name: currentTeam?.name || '',
      description: currentTeam?.description || '',
    },
  })

  const defaultUserIds = teamUsers.users
    .map((user) => user.id)
    .filter((id) => id !== userData.id)

  const [selectedUsers, setSelectedUsers] = useState<string[]>(defaultUserIds)

  const filteredUsers = allUsersData.users.filter(
    (user) => user.id !== userData.id,
  )

  const selectedUserNames = selectedUsers
    .map((id) => {
      const user = filteredUsers.find((user) => user.id === id)
      return user ? user.name : 'Unknown User'
    })
    .join(', ')

  if (!teamsData) {
    return null
  }

  const handleSubmit = form.onSubmit(({ name, description }) => {
    mutate(
      {
        body: {
          name,
          description: description,
          members: [...selectedUsers, userData.id],
        },
        params: { path: { readableTeamId } },
      },
      {
        onSuccess: () => {
          close()
        },
      },
    )
  })

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Edit Team">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Team Name"
            placeholder="Enter team name"
            required
            type="text"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <Textarea
            label="Description"
            placeholder="Enter team description"
            key={form.key('description')}
            {...form.getInputProps('description')}
          />

          <Input.Wrapper label="Team users">
            <Combobox
              store={combobox}
              onOptionSubmit={(val) => {
                if (selectedUsers.includes(val)) {
                  setSelectedUsers((prev) => prev.filter((id) => id !== val))
                  return
                }

                setSelectedUsers((prev) => [...prev, val])
              }}>
              <Combobox.Target>
                <InputBase
                  component="button"
                  type="button"
                  pointer
                  w="100%"
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => combobox.toggleDropdown()}>
                  {selectedUsers.length > 0 ? (
                    <Group>
                      <Text>{selectedUserNames}</Text>
                    </Group>
                  ) : (
                    <Input.Placeholder>Select users</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Options>
                  {filteredUsers.map((user) => (
                    <Combobox.Option key={user.id} value={user.id}>
                      <Group>
                        {selectedUsers.includes(user.id) && (
                          <CheckIcon size={12} />
                        )}
                        {user.name} - {user.email}
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Input.Wrapper>
        </Stack>
        <Group mt="xl" justify="space-between">
          <Button onClick={form.reset}>Reset form</Button>
          <Button loading={isPending} type="submit">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  )
}
