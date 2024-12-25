/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as error from "../error.js";
import type * as http from "../http.js";
import type * as shared_animatedSprite from "../shared/animatedSprite.js";
import type * as shared_frame from "../shared/frame.js";
import type * as shared_spritesheet from "../shared/spritesheet.js";
import type * as shared_storage from "../shared/storage.js";
import type * as shared_tilemap from "../shared/tilemap.js";
import type * as users from "../users.js";
import type * as world_characters from "../world/characters.js";
import type * as world_objects from "../world/objects.js";
import type * as world_resources from "../world/resources.js";
import type * as world_sceneAnimations from "../world/sceneAnimations.js";
import type * as world_scenes from "../world/scenes.js";
import type * as world_spritesheets from "../world/spritesheets.js";
import type * as world_textures from "../world/textures.js";
import type * as worlds from "../worlds.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  error: typeof error;
  http: typeof http;
  "shared/animatedSprite": typeof shared_animatedSprite;
  "shared/frame": typeof shared_frame;
  "shared/spritesheet": typeof shared_spritesheet;
  "shared/storage": typeof shared_storage;
  "shared/tilemap": typeof shared_tilemap;
  users: typeof users;
  "world/characters": typeof world_characters;
  "world/objects": typeof world_objects;
  "world/resources": typeof world_resources;
  "world/sceneAnimations": typeof world_sceneAnimations;
  "world/scenes": typeof world_scenes;
  "world/spritesheets": typeof world_spritesheets;
  "world/textures": typeof world_textures;
  worlds: typeof worlds;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
