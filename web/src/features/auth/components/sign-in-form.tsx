'use client'

import {
  Anchor,
  Button,
  Card,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Transition,
} from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { fetchClient } from '@/api-client/api-client'
import Link from 'next/link'

export function SignInForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  })
  const router = useRouter()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formValues: { email: string; password: string }) => {
      const { error } = await fetchClient.POST('/v1/auth/sign-in', {
        body: { email: formValues.email, password: formValues.password },
      })

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      router.push('/')
      form.reset()
    },
  })

  return (
    <Flex direction={'column'} gap="md" style={{ width: '100%' }}>
      <Title order={1}>Sign In</Title>
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        px="xl"
        py="50"
        style={{
          width: '100%',
        }}>
        <form
          onSubmit={form.onSubmit((values) => mutate(values))}
          style={{ width: '100%' }}>
          <Flex direction="column" gap="lg">
            <TextInput
              withAsterisk
              label="Email"
              placeholder="your@email.com"
              type="email"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="password"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button loading={isPending} type="submit" mt="md">
              Sign in
            </Button>
          </Flex>
        </form>
      </Paper>
      <Transition
        mounted={Boolean(error?.message)}
        transition="fade"
        duration={400}
        timingFunction="ease">
        {(styles) => (
          <Card withBorder shadow="sm" radius="md" p="md" style={styles}>
            <Text>{error?.message}</Text>
          </Card>
        )}
      </Transition>

      <Anchor component={Link} href="/auth/register">
        Don&apos;t have an account? Register
      </Anchor>
    </Flex>
  )
}
