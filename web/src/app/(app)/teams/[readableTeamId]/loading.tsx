import { Group, Skeleton, Stack } from '@mantine/core'

export default function Loading() {
  return (
    <Stack mt="xl" gap="xl">
      <Group justify="space-between">
        <Skeleton height={40} maw={400} mb="md" radius="md" />
        <Skeleton height={40} maw={200} mb="md" radius="md" />
      </Group>
      <Skeleton height={600} radius="md" />
    </Stack>
  )
}
