'use client'

import { signIn } from '@/api/auth'
import { Button } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function SignInButton() {
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const email = 'alice@example.com'
      const password = 'Abcd123'
      await signIn(email, password)

      router.push('/')
    },
  })

  return (
    <Button loading={isPending} onClick={() => mutate()}>
      Sign in
    </Button>
  )
}
