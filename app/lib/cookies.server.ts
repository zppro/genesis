import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const userPrefs = createCookie("user-prefs", {
  maxAge: 2_147_483_647, // nearly never expires
});