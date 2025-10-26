import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import { Button, Container, Flex } from '@mantine/core'
import { logout } from '@/features/auth/api/logout.action'
import { ThemeSwitch } from '@/features/layout/components/theme-switch'

export const metadata: Metadata = {
  title: 'Kanban',
  description: 'A Kanban board application',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Flex component="nav" px="12" py="sm" justify={'space-between'}>
        <Button onClick={logout}>Logout</Button>
        <ThemeSwitch />
      </Flex>
      <Container>{children}</Container>
    </>
  )
}
