import { paths } from '@/api-client/api'
import createFetchClient, { Middleware } from 'openapi-fetch'
import createQuery from 'openapi-react-query'
import { v7 } from 'uuid'

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
})

export const fetchClientNoMiddleware = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
})

export const appQuery = createQuery(fetchClient)

const jwtMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const requestId = v7()

    if (typeof document === 'undefined') {
      const cookieStore = await import('next/headers').then(
        (mod) => mod.cookies,
      )
      const cookies = await cookieStore()
      const cookieHeader = cookies.getAll()

      if (cookieHeader) {
        request.headers.set(
          'cookie',
          cookieHeader.map((c) => `${c.name}=${c.value}`).join('; '),
        )
      }
    }

    request.headers.set('x-correlation-id', requestId)
    return request
  },
  onResponse: async ({ response, request }) => {
    const skipHeader = request.headers.get('x-skip-jwt-middleware')
    const shouldSkip = skipHeader ? skipHeader.trim() !== '' : false

    if (shouldSkip) {
      return response
    }

    if (response.ok) {
      return response
    }

    return response
  },
}

fetchClient.use(jwtMiddleware)

export const fetchServer = createFetchClient<paths>({
  baseUrl: process.env.SSR_API_URL,
  credentials: 'include',
})

fetchServer.use(jwtMiddleware)
