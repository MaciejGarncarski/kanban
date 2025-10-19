export const cookieConfigRefreshToken = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 14 * 24 * 60 * 60, // 2 weeks
} as const;

export const cookieConfigAccessToken = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 15 * 60, // 15 minutes, JWT is 10 minutes long
} as const;
