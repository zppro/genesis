import { Infer, Value } from "convex/values"
import { paginationOptsValidator } from "convex/server";

export type Options = {
  throwErrorMsg?: Value ;
}

export type PaginationOptions = Infer<typeof paginationOptsValidator>;