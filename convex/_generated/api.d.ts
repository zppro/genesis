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
import type * as data_characterCodex from "../data/characterCodex.js";
import type * as error from "../error.js";
import type * as http from "../http.js";
import type * as log_llmLogs from "../log/llmLogs.js";
import type * as shared_animatedSprite from "../shared/animatedSprite.js";
import type * as shared_characterSettings from "../shared/characterSettings.js";
import type * as shared_context from "../shared/context.js";
import type * as shared_frame from "../shared/frame.js";
import type * as shared_opts from "../shared/opts.js";
import type * as shared_spritesheet from "../shared/spritesheet.js";
import type * as shared_storage from "../shared/storage.js";
import type * as shared_sync from "../shared/sync.js";
import type * as shared_tilemap from "../shared/tilemap.js";
import type * as shared_type from "../shared/type.js";
import type * as users from "../users.js";
import type * as world_characters from "../world/characters.js";
import type * as world_events from "../world/events.js";
import type * as world_llms from "../world/llms.js";
import type * as world_llmsAction from "../world/llmsAction.js";
import type * as world_objects from "../world/objects.js";
import type * as world_resources from "../world/resources.js";
import type * as world_sceneAnimations from "../world/sceneAnimations.js";
import type * as world_sceneNPCs from "../world/sceneNPCs.js";
import type * as world_scenes from "../world/scenes.js";
import type * as world_skill_args from "../world/skill/args.js";
import type * as world_skill_extend from "../world/skill/extend.js";
import type * as world_skill_helper from "../world/skill/helper.js";
import type * as world_skill_mutation from "../world/skill/mutation.js";
import type * as world_skill_query from "../world/skill/query.js";
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
  "data/characterCodex": typeof data_characterCodex;
  error: typeof error;
  http: typeof http;
  "log/llmLogs": typeof log_llmLogs;
  "shared/animatedSprite": typeof shared_animatedSprite;
  "shared/characterSettings": typeof shared_characterSettings;
  "shared/context": typeof shared_context;
  "shared/frame": typeof shared_frame;
  "shared/opts": typeof shared_opts;
  "shared/spritesheet": typeof shared_spritesheet;
  "shared/storage": typeof shared_storage;
  "shared/sync": typeof shared_sync;
  "shared/tilemap": typeof shared_tilemap;
  "shared/type": typeof shared_type;
  users: typeof users;
  "world/characters": typeof world_characters;
  "world/events": typeof world_events;
  "world/llms": typeof world_llms;
  "world/llmsAction": typeof world_llmsAction;
  "world/objects": typeof world_objects;
  "world/resources": typeof world_resources;
  "world/sceneAnimations": typeof world_sceneAnimations;
  "world/sceneNPCs": typeof world_sceneNPCs;
  "world/scenes": typeof world_scenes;
  "world/skill/args": typeof world_skill_args;
  "world/skill/extend": typeof world_skill_extend;
  "world/skill/helper": typeof world_skill_helper;
  "world/skill/mutation": typeof world_skill_mutation;
  "world/skill/query": typeof world_skill_query;
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
