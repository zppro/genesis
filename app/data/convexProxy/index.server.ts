import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env["CONVEX_URL"]!;

export const proxy = () => {  
  return new ConvexHttpClient(CONVEX_URL);
}

