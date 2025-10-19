"use server";

import { getCookieValue } from "@/utils/get-cookie-value";
import { setAuthCookies } from "@/utils/set-auth-cookie";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function rotateToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  if (refreshRes.ok) {
    const { accessToken: newAccessToken } = await refreshRes.json();

    const refreshTokenCookie = getCookieValue(
      refreshRes.headers.get("set-cookie") || "",
      "refreshToken"
    );
    const newRefreshToken = refreshTokenCookie || "";

    await setAuthCookies({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return { accessToken: newAccessToken };
  }

  return { accessToken: null };
}
