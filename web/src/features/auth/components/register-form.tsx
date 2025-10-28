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
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { appQuery } from '@/api-client/api-client'
import Link from 'next/link'

export function RegisterForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 6
          ? null
          : 'Password must be at least 6 characters long',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  })
  const router = useRouter()

  const { mutate, isPending, error } = appQuery.useMutation(
    'post',
    '/v1/auth/register',
    {
      onSuccess: () => {
        router.push('/')
        form.reset()
      },
    },
  )

  return (
    <Flex direction={'column'} gap="md" style={{ width: '100%' }}>
      <Title order={1}>Register</Title>
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
          onSubmit={form.onSubmit((values) =>
            mutate({
              body: {
                email: values.email,
                name: values.name,
                password: values.password,
                confirmPassword: values.confirmPassword,
              },
            }),
          )}
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

            <TextInput
              withAsterisk
              label="Name"
              placeholder="Your name"
              type="text"
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="password"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <PasswordInput
              withAsterisk
              label="Confirm Password"
              placeholder="confirm password"
              key={form.key('confirmPassword')}
              {...form.getInputProps('confirmPassword')}
            />
            <Button loading={isPending} type="submit" mt="md">
              Register
            </Button>
          </Flex>
        </form>
      </Paper>
      <Transition
        mounted={Boolean(error?.message && !isPending)}
        transition="fade"
        duration={400}
        timingFunction="ease">
        {(styles) => (
          <Card withBorder shadow="sm" radius="md" p="md" style={styles}>
            <Text>{error?.message}</Text>
          </Card>
        )}
      </Transition>

      <Anchor component={Link} href="/auth/sign-in">
        Already have an account? Sign in
      </Anchor>
    </Flex>
  )
}
