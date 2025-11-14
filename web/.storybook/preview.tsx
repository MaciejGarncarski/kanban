// .storybook/preview.tsx
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'

import { theme } from '../src/theme'
import { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <MantineProvider theme={theme}>
          <Story />
        </MantineProvider>
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
