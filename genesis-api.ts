import { FunctionReference, anyApi } from "convex/server";
import { GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  users: {
    current: FunctionReference<"query", "public", Record<string, never>, any>;
  };
  worlds: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        desc?: string;
        name: string;
        timeSpeedRatio: string;
        type: "normal" | "super";
      },
      any
    >;
    createWorld: FunctionReference<
      "action",
      "public",
      {
        desc?: string;
        name: string;
        timeSpeedRatio: string;
        type: "normal" | "super";
      },
      any
    >;
    deleteWorld: FunctionReference<
      "action",
      "public",
      { id: Id<"worlds"> },
      any
    >;
    list: FunctionReference<"query", "public", any, any>;
    listWorlds: FunctionReference<"action", "public", any, any>;
    read: FunctionReference<"query", "public", { id: Id<"worlds"> }, any>;
    update: FunctionReference<
      "mutation",
      "public",
      { desc?: string; id: Id<"worlds">; name: string },
      any
    >;
  };
  world: {
    scenes: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          desc?: string;
          name: string;
          screenxtiles: number;
          screenytiles: number;
          tiledim: number;
          tilemapId: Id<"resources">;
          tilesetId: Id<"resources">;
          tilesetpxh: number;
          tilesetpxw: number;
          worldId: Id<"worlds">;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"scenes"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      read: FunctionReference<"query", "public", { id: Id<"scenes"> }, any>;
      readEx: FunctionReference<"query", "public", { id: Id<"scenes"> }, any>;
      update: FunctionReference<
        "mutation",
        "public",
        {
          desc?: string;
          id: Id<"scenes">;
          name: string;
          screenxtiles: number;
          screenytiles: number;
          tiledim: number;
          tilemapId: Id<"resources">;
          tilesetId: Id<"resources">;
          tilesetpxh: number;
          tilesetpxw: number;
        },
        any
      >;
    };
    resources: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          desc?: string;
          name: string;
          storageId: Id<"_storage">;
          type: "tileset" | "tilemap" | "item" | "music";
          worldId: Id<"worlds">;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"resources"> },
        any
      >;
      generateDownloadUrl: FunctionReference<
        "query",
        "public",
        { id: Id<"_storage"> },
        any
      >;
      generateUploadUrl: FunctionReference<"mutation", "public", any, any>;
      list: FunctionReference<
        "query",
        "public",
        {
          type: "tileset" | "tilemap" | "item" | "music";
          worldId: Id<"worlds">;
        },
        any
      >;
      read: FunctionReference<"query", "public", { id: Id<"resources"> }, any>;
      update: FunctionReference<
        "mutation",
        "public",
        {
          desc?: string;
          id: Id<"resources">;
          name: string;
          storageId: Id<"_storage">;
        },
        any
      >;
    };
    spritesheets: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          data: string;
          name: string;
          textureId: Id<"textures">;
          type: "character" | "object";
          worldId: Id<"worlds">;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"spritesheets"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      listByTexture: FunctionReference<
        "query",
        "public",
        { textureId: Id<"textures">; worldId: Id<"worlds"> },
        any
      >;
      listByType: FunctionReference<
        "query",
        "public",
        { type: "character" | "object"; worldId: Id<"worlds"> },
        any
      >;
      listEx: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      listExByType: FunctionReference<
        "query",
        "public",
        { type: "character" | "object"; worldId: Id<"worlds"> },
        any
      >;
      read: FunctionReference<
        "query",
        "public",
        { id: Id<"spritesheets"> },
        any
      >;
      readEx: FunctionReference<
        "query",
        "public",
        { id: Id<"spritesheets"> },
        any
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: string;
          id: Id<"spritesheets">;
          name: string;
          textureId: Id<"textures">;
          type: "character" | "object";
        },
        any
      >;
    };
    textures: {
      create: FunctionReference<
        "mutation",
        "public",
        { name: string; storageId: Id<"_storage">; worldId: Id<"worlds"> },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"textures"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      read: FunctionReference<"query", "public", { id: Id<"textures"> }, any>;
      update: FunctionReference<
        "mutation",
        "public",
        { id: Id<"textures">; name: string; storageId: Id<"_storage"> },
        any
      >;
    };
    characters: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          name: string;
          speed: number;
          spritesheetId: Id<"spritesheets">;
          worldId: Id<"worlds">;
        },
        any
      >;
      read: FunctionReference<"query", "public", { id: Id<"characters"> }, any>;
      readEx: FunctionReference<
        "query",
        "public",
        { id: Id<"characters"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      listBySpritesheet: FunctionReference<
        "query",
        "public",
        { spritesheetId: Id<"spritesheets">; worldId: Id<"worlds"> },
        any
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"characters">;
          name: string;
          speed: number;
          spritesheetId: Id<"spritesheets">;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"characters"> },
        any
      >;
    };
    objects: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          name: string;
          spritesheetId: Id<"spritesheets">;
          type: "animation";
          worldId: Id<"worlds">;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"objects"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      listBySpritesheet: FunctionReference<
        "query",
        "public",
        { spritesheetId: Id<"spritesheets">; worldId: Id<"worlds"> },
        any
      >;
      listByType: FunctionReference<
        "query",
        "public",
        { type: "animation"; worldId: Id<"worlds"> },
        any
      >;
      listEx: FunctionReference<
        "query",
        "public",
        { worldId: Id<"worlds"> },
        any
      >;
      listExByType: FunctionReference<
        "query",
        "public",
        { type: "animation"; worldId: Id<"worlds"> },
        any
      >;
      read: FunctionReference<"query", "public", { id: Id<"objects"> }, any>;
      readEx: FunctionReference<"query", "public", { id: Id<"objects"> }, any>;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"objects">;
          name: string;
          spritesheetId: Id<"spritesheets">;
          type: "animation";
        },
        any
      >;
    };
    sceneAnimations: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          h: number;
          name: string;
          objectId: Id<"objects">;
          sceneId: Id<"scenes">;
          speed: number;
          w: number;
          x: number;
          y: number;
        },
        any
      >;
      read: FunctionReference<
        "query",
        "public",
        { id: Id<"sceneAnimations"> },
        any
      >;
      list: FunctionReference<
        "query",
        "public",
        { sceneId: Id<"scenes"> },
        any
      >;
      listEx: FunctionReference<
        "query",
        "public",
        { sceneId: Id<"scenes"> },
        any
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          h: number;
          id: Id<"sceneAnimations">;
          name: string;
          objectId: Id<"objects">;
          speed: number;
          w: number;
          x: number;
          y: number;
        },
        any
      >;
      delete_: FunctionReference<
        "mutation",
        "public",
        { id: Id<"sceneAnimations"> },
        any
      >;
    };
  };
  shared: {
    storage: {
      generateDownloadUrl: FunctionReference<
        "query",
        "public",
        { id: Id<"_storage"> },
        any
      >;
      generateUploadUrl: FunctionReference<"mutation", "public", any, any>;
    };
  };
};
export type InternalApiType = {};
