import { paths } from "@/api-client/api";
import { rotateToken } from "@/api/rotate-token";
import createFetchClient, { Middleware } from "openapi-fetch";

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

const jwtMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const requestId = crypto.randomUUID();
    request.headers.set("x-correlation-id", requestId);
    return request;
  },
  onResponse: async ({ response, request }) => {
    if (response.ok) {
      return response;
    }

    if (response.status === 401) {
      await rotateToken();
      const retryResponse = await fetch(request);

      if (retryResponse.status === 401) {
        throw new Error("Unauthorized after token rotation");
      }

      return retryResponse;
    }

    return response;
  },
};

fetchClient.use(jwtMiddleware);
