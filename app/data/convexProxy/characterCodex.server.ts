import { PaginationOptions } from "convex/server";
import { proxy } from "~/data/convexProxy/index.server";
import { api } from "@/_generated/api";
import type { CharacterCodexId } from "@/data/characterCodex";

export const getCharacterCodex = async (id: CharacterCodexId) => {
  return await proxy().query(api.data.characterCodex.read, { id });
};

export const listCharacterCodex = async () => {
  return await proxy().query(api.data.characterCodex.list, {});
};

export const pageCharacterCodex = async (opts: PaginationOptions = { numItems: 10, cursor: null }) => {
  return await proxy().query(api.data.characterCodex.page, { opts });
};
