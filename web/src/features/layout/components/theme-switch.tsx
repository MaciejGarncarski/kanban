'use client'

import ClientOnly from '@/components/client-only'
import { Button, Menu, useMantineColorScheme } from '@mantine/core'
import { Loader, Monitor, Moon, Sun } from 'lucide-react'

export const ThemeSwitch = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  return (
    <ClientOnly
      fallback={
        <Button variant="light" leftSection={<Loader />}>
          Wait...
        </Button>
      }>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            variant="light"
            leftSection={
              colorScheme === 'dark' ? (
                <Moon />
              ) : colorScheme === 'light' ? (
                <Sun />
              ) : (
                <Monitor />
              )
            }>
            Theme
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Theme</Menu.Label>
          <Menu.Item
            onClick={() => setColorScheme('dark')}
            leftSection={<Moon size={14} />}>
            Dark Mode
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('light')}
            leftSection={<Sun size={14} />}>
            Light Mode
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('auto')}
            leftSection={<Monitor size={14} />}>
            Auto Mode
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </ClientOnly>
  )
}
