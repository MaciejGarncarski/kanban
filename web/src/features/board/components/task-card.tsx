'use client'

import { ActionIcon, Flex, Modal, Paper, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Info } from 'lucide-react'

type Props = {
  title: string
  description: string
  assignedToId: string
}

export function TaskCard({ title, description, assignedToId }: Props) {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <Paper withBorder py="sm" px="md">
      <Flex justify={'space-between'}>
        <Text>{title}</Text>
        <ActionIcon onClick={open} variant="subtle" size={'md'}>
          <Info size={'70%'} />
        </ActionIcon>

        <Modal opened={opened} onClose={close} title={title} centered>
          <Text>{description}</Text>
          <Text>Assigned to: {assignedToId}</Text>
        </Modal>
      </Flex>
    </Paper>
  )
}
