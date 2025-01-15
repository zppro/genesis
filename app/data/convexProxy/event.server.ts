import { PaginationOptions } from "convex/server";
import { proxy } from "~/data/convexProxy/index.server";
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds";
import type { EventId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/events";

export const getEvent = async (id: EventId) => {
  return await proxy().query(api.world.events.read, { id });
};

export const listEvents = async (worldId: WorldId) => {
  return await proxy().query(api.world.events.list, { worldId });
};

export const pageEvents = async (worldId: WorldId, opts: PaginationOptions = { numItems: 10, cursor: null }) => {
  return await proxy().query(api.world.events.page, { worldId, opts });
};

export const createEvent = async (args: InsertArgs) => {
  const newEventId = await proxy().mutation(api.world.events.create, args);
  return newEventId;
};

export const updateEvent = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.events.update, args);
};

export const deleteEvent = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.events.delete_, args);
};