'use client'
import { getQueryClient } from '@/utils/get-query-client'
import { MantineProvider } from '@mantine/core'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type * as React from 'react'
import { Notifications } from '@mantine/notifications'
import { theme } from '@/theme'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />
        {children}
      </MantineProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
