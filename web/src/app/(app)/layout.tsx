import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import { Button, Container, Flex } from '@mantine/core'
import { logout } from '@/features/auth/api/logout.action'
import { ThemeSwitch } from '@/features/layout/components/theme-switch'

export const metadata: Metadata = {
  title: 'Kanban',
  description: 'A Kanban board application',
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Flex component="nav" px="md" py="sm" justify={'space-between'}>
        <Button radius="md" variant="light" onClick={logout}>
          Logout
        </Button>
        <ThemeSwitch />
      </Flex>
      <Container size={'app-container'}>{children}</Container>
    </>
  )
}
