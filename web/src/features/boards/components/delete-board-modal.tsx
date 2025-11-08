'use client'

import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useDeleteBoard } from '@/features/boards/hooks/use-delete-board'
import { Button, Group, Modal } from '@mantine/core'

type Props = {
  isOpen: boolean
  onClose: () => void
  readableBoardId: string
}

export function DeleteBoardModal({ isOpen, onClose, readableBoardId }: Props) {
  const { data: boardData } = useBoardById({ readableBoardId })

  const { mutate, isPending } = useDeleteBoard()

  if (!boardData) {
    return null
  }

  return (
    <Modal
      centered
      opened={isOpen}
      onClose={onClose}
      title="Delete Board"
      radius={'md'}>
      <div>
        <p>
          Are you sure you want to delete board &quot;{boardData.name}&quot;?
        </p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button
          color="red"
          radius="md"
          loading={isPending}
          onClick={() => {
            mutate(
              {
                params: {
                  path: {
                    readableBoardId,
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
        <Button radius="md" onClick={onClose} loading={isPending}>
          Cancel
        </Button>
      </Group>
    </Modal>
  )
}
