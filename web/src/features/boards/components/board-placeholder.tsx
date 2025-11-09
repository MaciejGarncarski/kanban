import { Flex, Skeleton } from '@mantine/core'

export function BoardPlaceholder() {
  return (
    <Flex direction="column" gap="md" px="xs">
      <Skeleton height={26} width="8rem" radius="md" />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="flex-start"
        wrap="nowrap"
        gap="lg">
        {[...Array(3)].map((_, index) => (
          <Skeleton h={'40rem'} w="20rem" radius="md" key={index} />
        ))}
      </Flex>
    </Flex>
  )
}
