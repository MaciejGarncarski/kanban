import { Flex, Group, Skeleton } from '@mantine/core'

export function BoardPlaceholder() {
  return (
    <Flex direction="column" gap="md">
      <Skeleton height={20} width="8rem" radius="md" />

      <Group justify="flex-start" wrap="nowrap" gap="lg">
        {[...Array(3)].map((_, index) => (
          <Skeleton h={'40rem'} w="20rem" key={index} />
        ))}
      </Group>
    </Flex>
  )
}
