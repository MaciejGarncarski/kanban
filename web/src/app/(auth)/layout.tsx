import { Container, Flex, Text, Title } from '@mantine/core'
import { ThemeSwitch } from '@/features/layout/components/theme-switch'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container strategy="block" size={500} my={40}>
      <Flex
        direction={'column'}
        align={'center'}
        justify={'center'}
        gap="xl"
        w="100%"
        h="100%">
        <ThemeSwitch />
        {children}
        <Flex direction="column" mt="md" mr="auto">
          <Title order={4}>Demo User:</Title>
          <Text>Email: alice@example.com</Text>
          <Text>Password: Abcd123</Text>
        </Flex>
      </Flex>
    </Container>
  )
}
