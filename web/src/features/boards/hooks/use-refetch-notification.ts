import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { notifications } from '@mantine/notifications'
import { useEffect, useRef } from 'react'

const MAX_NOTIFICATION_DURATION = 10000 // 10 seconds
const HIDE_NOTIFICATION_DELAY = 700 // 700 ms

export function useRefetchNotification({
  readableBoardId,
}: {
  readableBoardId: string
}) {
  const { isRefetching, isSuccess } = useBoardById({ readableBoardId })
  const notificationRef = useRef<string | null>(null)

  useEffect(() => {
    if (isRefetching && !notificationRef.current) {
      notificationRef.current = notifications.show({
        title: 'Refreshing board data',
        message: 'Fetching the latest updates...',
        withBorder: true,
        loading: true,
        radius: 'lg',
        autoClose: MAX_NOTIFICATION_DURATION,
      })
    }

    if (isSuccess) {
      setTimeout(() => {
        if (notificationRef.current) {
          notifications.hide(notificationRef.current)
          notificationRef.current = null
        }
      }, HIDE_NOTIFICATION_DELAY)
    }
  }, [isRefetching, isSuccess])
}
