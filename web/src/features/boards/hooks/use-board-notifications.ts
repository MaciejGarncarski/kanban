import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useEffectEvent } from 'react'
import { z } from 'zod/v4'

const notificationMessageSchema = z.object({
  readableTeamId: z.string(),
})

export const useBoardNotifications = ({}) => {
  const queryClient = useQueryClient()

  const handleDataRefresh = useEffectEvent(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['get', '/v1/teams/{readableTeamId}/boards'],
    })
    await queryClient.invalidateQueries({
      queryKey: ['get', '/v1/boards/{readableBoardId}'],
    })
    await queryClient.invalidateQueries({
      queryKey: ['get', '/v1/teams/{readableTeamId}/users'],
    })
  })

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/notifications/stream`,
      {
        withCredentials: true,
      },
    )

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      const parsed = notificationMessageSchema.safeParse(data)

      if (parsed.success) {
        await handleDataRefresh()
      }
    }

    return () => {
      eventSource.close()
    }
  }, [])
}
