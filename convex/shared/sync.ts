import { Id, TableNames } from "../_generated/dataModel";
export type SyncSignal<T extends TableNames> = {
  object: T;
  key: {
    _id: Id<T>;
  };
}

export const toJSON = <T extends TableNames>(signal: SyncSignal<T>) => {
  return JSON.stringify(signal)
}