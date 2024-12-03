import { ConvexHttpClient } from "convex/browser";
import { api } from "@/_generated/api";

export const queryProxy = () => {
  const CONVEX_URL = process.env["CONVEX_URL"]!;
  return new ConvexHttpClient(CONVEX_URL);
}

export const hasNoWorld = async () => {
  const worlds = await listWorlds()
  return worlds.length === 0
}

export const listWorlds = async () => {
  const worlds = await queryProxy().query(api.worlds.list)
  return worlds
}

