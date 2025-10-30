import { appQuery } from '@/api-client/api-client'
import { ActionIcon, Button, Modal } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { EditIcon, InfoIcon } from 'lucide-react'

export function ColumnInfoModal({
  columnId,
  name,
  createdAt,
  teamId,
}: {
  columnId: string
  name: string
  createdAt: string
  teamId: string
}) {
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      Name: name,
    },
  })

  const { data } = appQuery.useSuspenseQuery(
    'get',
    '/user/v1/users/{teamId}/role',
    {
      params: { path: { teamId } },
    },
  )

  const isAdmin = data.role === 'admin'

  return (
    <>
      <Modal opened={opened} onClose={close} title="Column Info" centered>
        <div>
          <strong>Name:</strong> {name}
        </div>
        <div>
          <strong>Created At:</strong> {createdAt}
        </div>
        {isAdmin && (
          <Button mt="md" onClick={close} leftSection={<EditIcon size={20} />}>
            Edit
          </Button>
        )}
      </Modal>

      <ActionIcon variant="light" onClick={open}>
        <InfoIcon size="70%" />
      </ActionIcon>
    </>
  )
}
