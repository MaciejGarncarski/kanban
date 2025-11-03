'use client'

import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useDeleteBoard } from '@/features/boards/hooks/use-delete-board'
import { Button, Group, Modal } from '@mantine/core'

type Props = {
  isOpen: boolean
  onClose: () => void
  boardId: string
}

export function DeleteBoardModal({ isOpen, onClose, boardId }: Props) {
  const { data: boardData } = useBoardById({ boardId })

  const { mutate, isPending } = useDeleteBoard()

  if (!boardData) {
    return null
  }

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Delete Board">
      <div>
        <p>
          Are you sure you want to delete board &quot;{boardData.name}&quot;?
        </p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button
          color="red"
          loading={isPending}
          onClick={() => {
            mutate(
              {
                params: {
                  path: {
                    boardId,
                  },
                },
              },
              {
                onSuccess: () => {
                  onClose()
                },
              },
            )
          }}>
          Delete
        </Button>
        <Button onClick={onClose} loading={isPending}>
          Cancel
        </Button>
      </Group>
    </Modal>
  )
}
