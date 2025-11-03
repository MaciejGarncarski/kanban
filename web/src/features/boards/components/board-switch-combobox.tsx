'use client'

import { BoardSwitchOptions } from '@/features/boards/components/board-switch-options'
import { useBoards } from '@/features/boards/hooks/use-boards'
import {
  Combobox,
  ComboboxStore,
  Input,
  InputBase,
  useCombobox,
} from '@mantine/core'
import { useRouter } from 'next/navigation'

type Props = {
  teamId: string | null
  boardId: string | null
}

export function BoardSwitchCombobox({ teamId, boardId }: Props) {
  const router = useRouter()

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const setBoard = async (val: string) => {
    combobox.closeDropdown()
    router.push(`/teams/${teamId}/boards/${val}`)
  }

  return (
    <Combobox store={combobox} width={250} onOptionSubmit={setBoard}>
      {boardId && teamId ? (
        <BoardSwitchInput
          boardId={boardId}
          combobox={combobox}
          teamId={teamId}
        />
      ) : (
        <BoardSwitchInputEmpty combobox={combobox} />
      )}
      <Combobox.Dropdown>
        <Combobox.Options>
          {teamId && <BoardSwitchOptions teamId={teamId} boardId={boardId} />}
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
  boardId,
  teamId,
}: {
  combobox: ComboboxStore
  boardId: string
  teamId: string
}) => {
  const { data } = useBoards({ teamId })

  const boardName = data?.boards.find((board) => {
    return board.readableId === boardId
  })?.name

  return (
    <Combobox.Target>
      <Input.Wrapper label="Board">
        <InputBase
          component="button"
          type="button"
          pointer
          w="12rem"
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}>
          <>
            {boardId && boardName}
            {!boardId && <Input.Placeholder>Select board</Input.Placeholder>}
          </>
        </InputBase>
      </Input.Wrapper>
    </Combobox.Target>
  )
}
