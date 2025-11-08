'use client'

import { BoardSwitchOptions } from '@/features/boards/components/board-switch-options'
import { useBoards } from '@/features/boards/hooks/use-boards'
import {
  Combobox,
  ComboboxStore,
  Input,
  InputBase,
  Text,
  useCombobox,
} from '@mantine/core'
import { useRouter } from 'next/navigation'

type Props = {
  readableTeamId: string | null
  readableBoardId: string | null
}

export function BoardSwitchCombobox({
  readableTeamId,
  readableBoardId,
}: Props) {
  const router = useRouter()

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const setBoard = async (val: string) => {
    combobox.closeDropdown()
    router.push(`/teams/${readableTeamId}/boards/${val}`)
  }

  return (
    <Combobox
      store={combobox}
      radius={'md'}
      width={250}
      onOptionSubmit={setBoard}
      transitionProps={{ duration: 200, transition: 'pop' }}>
      {readableBoardId && readableTeamId ? (
        <BoardSwitchInput
          readableBoardId={readableBoardId}
          combobox={combobox}
          readableTeamId={readableTeamId}
        />
      ) : (
        <BoardSwitchInputEmpty combobox={combobox} />
      )}
      <Combobox.Dropdown>
        <Combobox.Options>
          {readableTeamId && (
            <BoardSwitchOptions
              readableTeamId={readableTeamId}
              readableBoardId={readableBoardId}
            />
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

const BoardSwitchInputEmpty = ({ combobox }: { combobox: ComboboxStore }) => {
  return (
    <Combobox.Target>
      <Input.Wrapper label="Board">
        <InputBase
          component="button"
          type="button"
          radius={'md'}
          pointer
          w="12rem"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <Input.Placeholder>Select board</Input.Placeholder>
        </InputBase>
      </Input.Wrapper>
    </Combobox.Target>
  )
}

const BoardSwitchInput = ({
  combobox,
  readableBoardId,
  readableTeamId,
}: {
  combobox: ComboboxStore
  readableBoardId: string
  readableTeamId: string
}) => {
  const { data } = useBoards({ readableTeamId })

  const boardName = data?.boards.find((board) => {
    return board.readableId === readableBoardId
  })?.name

  return (
    <Combobox.Target>
      <Input.Wrapper label="Board">
        <InputBase
          component="button"
          type="button"
          pointer
          radius={'md'}
          w="12rem"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <>
            {readableBoardId && (
              <Text
                w="100%"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {boardName}
              </Text>
            )}
            {!readableBoardId && (
              <Input.Placeholder>Select board</Input.Placeholder>
            )}
          </>
        </InputBase>
      </Input.Wrapper>
    </Combobox.Target>
  )
}
