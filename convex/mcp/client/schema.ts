import { table as mcpClientSessionTable, tableSchema as mcpClientSessionTableSchema } from "./session/schema";


export const mpcClientTables = {
  [mcpClientSessionTable]: mcpClientSessionTableSchema,
};