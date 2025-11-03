'use client'

import { appQuery } from '@/api-client/api-client'
import { Button, Group, Modal } from '@mantine/core'

type Props = {
  isOpen: boolean
  onClose: () => void
  boardId: string
}

export function DeleteBoardModal({ isOpen, onClose, boardId }: Props) {
  const { data } = appQuery.useSuspenseQuery('get', '/v1/boards/{boardId}', {
    params: {
      path: {
        boardId,
      },
    },
  })

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Delete Board">
      <div>
        <p>Are you sure you want to delete board &quot;{data.name}&quot;?</p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button color="red">Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  )
}
