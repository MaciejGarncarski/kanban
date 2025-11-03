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

  const { mutate, isPending } = appQuery.useMutation(
    'delete',
    '/v1/boards/{boardId}',
    {
      onSuccess: (_, __, ___, { client }) => {
        onClose()
        client.invalidateQueries({ queryKey: ['get', '/v1/boards'] })
      },
    },
  )

  if (!data) {
    return null
  }

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Delete Board">
      <div>
        <p>Are you sure you want to delete board &quot;{data.name}&quot;?</p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button
          color="red"
          loading={isPending}
          onClick={() => {
            mutate({
              params: {
                path: {
                  boardId,
                },
              },
            })
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
