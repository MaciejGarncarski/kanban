'use client'

import ClientOnly from '@/components/client-only'
import { Button, Menu, useMantineColorScheme } from '@mantine/core'
import { Loader, Monitor, Moon, Sun } from 'lucide-react'

export const ThemeSwitch = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  return (
    <ClientOnly
      fallback={
        <Button variant="light" leftSection={<Loader />} radius="md">
          Wait...
        </Button>
      }>
      <Menu shadow="md" width={100}>
        <Menu.Target>
          <Button
            variant="light"
            radius="md"
            leftSection={
              colorScheme === 'dark' ? (
                <Moon size={18} />
              ) : colorScheme === 'light' ? (
                <Sun size={18} />
              ) : (
                <Monitor size={18} />
              )
            }>
            Theme
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Theme</Menu.Label>
          <Menu.Item
            onClick={() => setColorScheme('light')}
            leftSection={<Sun size={14} />}>
            Light
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('dark')}
            leftSection={<Moon size={14} />}>
            Dark
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('auto')}
            leftSection={<Monitor size={14} />}>
            Auto
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </ClientOnly>
  )
}
