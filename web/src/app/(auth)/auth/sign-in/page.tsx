import { SignInButton } from '@/app/sign-in-button'

export default async function SignInPage() {
  return (
    <div>
      Sign In Page
      <SignInButton />
    </div>
  )
}

// async function isAuthenticated() {
//   try {
//     const data = await fetchSSR.GET('/v1/auth/me')
//     return !!data
//   } catch {
//     return false
//   }
// }
