import { Box } from '@mantine/core'

export function DropIndicator({
  edge,
}: {
  edge: 'top' | 'bottom' | 'left' | 'right'
}) {
  const dropIndicatorStyles: Record<string, React.CSSProperties> = {
    top: {
      position: 'absolute',
      backgroundColor: 'var(--mantine-color-blue-6)',
      height: '6px',
      width: '100%',
      top: 0,
      left: 0,
    },
    bottom: {
      position: 'absolute',
      backgroundColor: 'var(--mantine-color-blue-6)',
      height: '6px',
      width: '100%',
      bottom: 0,
      left: 0,
    },
    left: {
      position: 'absolute',
      backgroundColor: 'var(--mantine-color-blue-6)',
      width: '6px',
      height: '100%',
      top: 0,
      left: 0,
    },
    right: {
      position: 'absolute',
      backgroundColor: 'var(--mantine-color-blue-6)',
      width: '6px',
      height: '100%',
      top: 0,
      right: 0,
    },
  }

  return <Box style={dropIndicatorStyles[edge]}></Box>
}
