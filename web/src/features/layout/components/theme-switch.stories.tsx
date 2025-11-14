import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemeSwitch } from './theme-switch'
import { expect, screen, userEvent, within } from 'storybook/test'

const meta: Meta<typeof ThemeSwitch> = {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitch,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button', { name: /theme/i })

    await userEvent.click(button)

    const lightModeLabel = /light/i
    const darkModeLabel = /dark/i
    const systemModeLabel = /auto/i

    await expect(await screen.findByText(lightModeLabel)).toBeInTheDocument()
    await expect(await screen.findByText(darkModeLabel)).toBeInTheDocument()
    await expect(await screen.findByText(systemModeLabel)).toBeInTheDocument()

    expect(button).toBeInTheDocument()
  },
}

export const LightToDark: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button', { name: /theme/i })

    await userEvent.click(button)

    const darkModeLabel = /dark/i

    await userEvent.click(await screen.findByText(darkModeLabel))

    expect(button).toBeInTheDocument()
  },
}

export const DarkToLight: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button', { name: /theme/i })

    await userEvent.click(button)

    const darkModeLabel = /dark/i
    const lightModeLabel = /light/i

    await userEvent.click(await screen.findByText(darkModeLabel))
    await userEvent.click(button)
    await userEvent.click(await screen.findByText(lightModeLabel))

    expect(button).toBeInTheDocument()
  },
}
