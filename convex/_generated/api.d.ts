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
import type * as mcp_client_bmi from "../mcp/client/bmi.js";
import type * as mcp_client_index from "../mcp/client/index.js";
import type * as mcp_client_indexOld from "../mcp/client/indexOld.js";
import type * as mcp_client_nodeAction from "../mcp/client/nodeAction.js";
import type * as mcp_client_session_args from "../mcp/client/session/args.js";
import type * as mcp_client_session_helper from "../mcp/client/session/helper.js";
import type * as mcp_client_session_mutation from "../mcp/client/session/mutation.js";
import type * as mcp_client_session_query from "../mcp/client/session/query.js";
import type * as mcp_utils from "../mcp/utils.js";
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
import type * as skills_index from "../skills/index.js";
import type * as skills_topic from "../skills/topic.js";
import type * as skills_weather from "../skills/weather.js";
import type * as trees_index from "../trees/index.js";
import type * as users from "../users.js";
import type * as world_character_args from "../world/character/args.js";
import type * as world_character_extend from "../world/character/extend.js";
import type * as world_character_helper from "../world/character/helper.js";
import type * as world_character_mutation from "../world/character/mutation.js";
import type * as world_character_query from "../world/character/query.js";
import type * as world_events from "../world/events.js";
import type * as world_llms from "../world/llms.js";
import type * as world_llmsAction from "../world/llmsAction.js";
import type * as world_mcpServer_args from "../world/mcpServer/args.js";
import type * as world_mcpServer_helper from "../world/mcpServer/helper.js";
import type * as world_mcpServer_mutation from "../world/mcpServer/mutation.js";
import type * as world_mcpServer_query from "../world/mcpServer/query.js";
import type * as world_mcpServer_slim from "../world/mcpServer/slim.js";
import type * as world_mcpServerTool_args from "../world/mcpServerTool/args.js";
import type * as world_mcpServerTool_helper from "../world/mcpServerTool/helper.js";
import type * as world_mcpServerTool_mutation from "../world/mcpServerTool/mutation.js";
import type * as world_mcpServerTool_query from "../world/mcpServerTool/query.js";
import type * as world_mcpServerTool_slim from "../world/mcpServerTool/slim.js";
import type * as world_objects from "../world/objects.js";
import type * as world_resources from "../world/resources.js";
import type * as world_sceneAnimations from "../world/sceneAnimations.js";
import type * as world_sceneNPCs from "../world/sceneNPCs.js";
import type * as world_scenes from "../world/scenes.js";
import type * as world_skill_action from "../world/skill/action.js";
import type * as world_skill_args from "../world/skill/args.js";
import type * as world_skill_extend from "../world/skill/extend.js";
import type * as world_skill_helper from "../world/skill/helper.js";
import type * as world_skill_mutation from "../world/skill/mutation.js";
import type * as world_skill_nodeAction from "../world/skill/nodeAction.js";
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
  "mcp/client/bmi": typeof mcp_client_bmi;
  "mcp/client/index": typeof mcp_client_index;
  "mcp/client/indexOld": typeof mcp_client_indexOld;
  "mcp/client/nodeAction": typeof mcp_client_nodeAction;
  "mcp/client/session/args": typeof mcp_client_session_args;
  "mcp/client/session/helper": typeof mcp_client_session_helper;
  "mcp/client/session/mutation": typeof mcp_client_session_mutation;
  "mcp/client/session/query": typeof mcp_client_session_query;
  "mcp/utils": typeof mcp_utils;
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
  "skills/index": typeof skills_index;
  "skills/topic": typeof skills_topic;
  "skills/weather": typeof skills_weather;
  "trees/index": typeof trees_index;
  users: typeof users;
  "world/character/args": typeof world_character_args;
  "world/character/extend": typeof world_character_extend;
  "world/character/helper": typeof world_character_helper;
  "world/character/mutation": typeof world_character_mutation;
  "world/character/query": typeof world_character_query;
  "world/events": typeof world_events;
  "world/llms": typeof world_llms;
  "world/llmsAction": typeof world_llmsAction;
  "world/mcpServer/args": typeof world_mcpServer_args;
  "world/mcpServer/helper": typeof world_mcpServer_helper;
  "world/mcpServer/mutation": typeof world_mcpServer_mutation;
  "world/mcpServer/query": typeof world_mcpServer_query;
  "world/mcpServer/slim": typeof world_mcpServer_slim;
  "world/mcpServerTool/args": typeof world_mcpServerTool_args;
  "world/mcpServerTool/helper": typeof world_mcpServerTool_helper;
  "world/mcpServerTool/mutation": typeof world_mcpServerTool_mutation;
  "world/mcpServerTool/query": typeof world_mcpServerTool_query;
  "world/mcpServerTool/slim": typeof world_mcpServerTool_slim;
  "world/objects": typeof world_objects;
  "world/resources": typeof world_resources;
  "world/sceneAnimations": typeof world_sceneAnimations;
  "world/sceneNPCs": typeof world_sceneNPCs;
  "world/scenes": typeof world_scenes;
  "world/skill/action": typeof world_skill_action;
  "world/skill/args": typeof world_skill_args;
  "world/skill/extend": typeof world_skill_extend;
  "world/skill/helper": typeof world_skill_helper;
  "world/skill/mutation": typeof world_skill_mutation;
  "world/skill/nodeAction": typeof world_skill_nodeAction;
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
