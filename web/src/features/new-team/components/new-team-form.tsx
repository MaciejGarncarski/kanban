'use client'

import {
  Box,
  Button,
  Container,
  Flex,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { Save } from 'lucide-react'

export function NewTeamForm() {
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Name is required' : null),
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values)
  })

  return (
    <Container size="sm" my="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Team Name" placeholder="Enter team name" required />
          <Textarea label="Description" placeholder="Enter team description" />

          <p>multi user select with search</p>

          <Flex>
            <Button type="submit" leftSection={<Save size={14} />} ml="auto">
              Create Team
            </Button>
          </Flex>
        </Stack>
      </form>
    </Container>
  )
}
