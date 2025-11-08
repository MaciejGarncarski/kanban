import { Group, Skeleton, Stack } from '@mantine/core'

export default function Loading() {
  return (
    <Stack mt="xl" gap="xl">
      <Group justify="space-between">
        <Skeleton height={30} maw={400} mb="md" radius="sm" />
        <Skeleton height={30} maw={200} mb="md" radius="sm" />
      </Group>
      <Skeleton height={600} radius="sm" />
    </Stack>
  )
}
