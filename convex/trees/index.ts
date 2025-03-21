import { v } from 'convex/values';
import { query } from '../_generated/server';
import { _list as listMcpServers } from '../world/mcpServer/helper';
import { SlimServer } from '../world/mcpServer/slim';
import { _list as listMcpServerTools } from '../world/mcpServerTool/helper';
import { SlimServerTool } from '../world/mcpServerTool/slim';
import { idWorld } from '../worlds';

export const mcpToolTree = query({
  args: { worldId: idWorld, nodeIdKey: v.string(), nodeNameKey: v.string() },
  handler: async (ctx, args) => {
    const { nodeIdKey, nodeNameKey } = args;
    const mcpServers = await listMcpServers(ctx, args);
    const mcpServerTools = await listMcpServerTools(ctx, args);
    const nodes = mcpServers.map(s => ({
      [nodeIdKey]: s._id,
      [nodeNameKey]: s.name,
      children: mcpServerTools.map(t => ({
        [nodeIdKey]: t._id, [nodeNameKey]: t.name
      }))
    }))
    return nodes;
  },
});