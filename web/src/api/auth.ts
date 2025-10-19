"use server";

import { fetchClient } from "@/api-client/api-client";
import { setAuthCookies } from "@/utils/set-auth-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signOut = async () => {
  await fetchClient.DELETE("/auth/logout");

  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
  cookieStore.delete("accessToken");

  throw redirect("/auth/sign-in");
};

export const signIn = async (email: string, password: string) => {
  const request = fetchClient.POST("/auth/sign-in", {
    body: { email, password },
  });

  const { response, data } = await request;

  await setAuthCookies({
    refreshToken: response.headers
      .get("set-cookie")
      ?.split(";")[0]
      ?.split("refreshToken=")[1],
    accessToken: data?.accessToken,
  });

  throw redirect("/");
};
