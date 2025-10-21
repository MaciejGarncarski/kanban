'use client'

import { signIn } from '@/api/auth'
import { Button } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'

export function SignInButton() {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const email = 'alice@example.com'
      const password = 'Abcd123'

      await signIn(email, password)
    },
  })

  return (
    <Button loading={isPending} onClick={() => mutate()}>
      Sign in
    </Button>
  )
}
