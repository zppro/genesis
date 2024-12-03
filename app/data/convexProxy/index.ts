import { ConvexHttpClient } from "convex/browser";


export const queryProxy = () => {
  const CONVEX_URL = process.env["CONVEX_URL"]!;
  return new ConvexHttpClient(CONVEX_URL);
}

