import { checkIsAuthed } from '@/features/auth/api/check-is-authed'
import { RegisterForm } from '@/features/auth/register/components/register-form'
import { ThemeSwitch } from '@/features/layout/components/theme-switch'
import { Flex, Text, Title } from '@mantine/core'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  const isAuthed = await checkIsAuthed()

  if (isAuthed) {
    redirect('/')
  }

  return (
    <Flex
      direction={'column'}
      align={'center'}
      justify={'center'}
      gap="xl"
      w="100%"
      h="100%">
      <Flex direction="column" align="center" gap="xl" w="100%">
        <RegisterForm />
        <Flex direction="column" mt="md">
          <Title order={4}>Demo User:</Title>
          <Text>Email: alice@example.com</Text>
          <Text>Password: Abcd123</Text>
        </Flex>
      </Flex>
      <ThemeSwitch />
    </Flex>
  )
}
