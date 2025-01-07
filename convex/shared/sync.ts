import { Id, TableNames } from "../_generated/dataModel";

export type SyncSignal<T extends TableNames> = {
  _id: Id<T>;
  object: T;
  name: string;
}

export const toJSON = <T extends TableNames>(signal: SyncSignal<T>) => {
  return JSON.stringify(signal)
}