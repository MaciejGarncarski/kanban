import { paths } from '@/api-client/api'
import { rotateToken } from '@/api/rotate-token'
import createFetchClient, { Middleware } from 'openapi-fetch'
import createQuery from 'openapi-react-query'

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
})

export const appQuery = createQuery(fetchClient)

const jwtMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    console.log('MY ENV:', process.env.NEXT_PUBLIC_API_URL)

    const requestId = crypto.randomUUID()
    request.headers.set('x-correlation-id', requestId)
    return request
  },
  onResponse: async ({ response, request }) => {
    if (response.ok) {
      return response
    }

    if (response.status === 401) {
      await rotateToken()
      const retryResponse = await fetch(request)

      if (retryResponse.status === 401) {
        throw new Error('Unauthorized after token rotation')
      }

      return retryResponse
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

export const fetchServerNoMiddleware = createFetchClient<paths>({
  baseUrl: process.env.SSR_API_URL,
  credentials: 'include',
  headers: {
    accept: 'application/json',
  },
})
