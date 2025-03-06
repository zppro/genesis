import { Id, Doc, TableNames } from "../_generated/dataModel";

export type SyncSignal<T extends TableNames> = {
  _id: Id<T>;
  object: T;
  name: string;
}

export const toJSON = <T extends TableNames>(signal: SyncSignal<T>) => {
  return JSON.stringify(signal)
}

export function checkNeedNotifyUpstream<T extends Doc<TableNames>>(entity: T, newEntityFields: Partial<T>, ...checkFields: (keyof T)[]) {
  return Object.keys(newEntityFields).some(v => {
    const k = v as (keyof T)
    return checkFields.includes(k) && newEntityFields[k] && newEntityFields[k] !== entity[k]
  })
}