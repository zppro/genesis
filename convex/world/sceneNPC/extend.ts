import { SceneNPCDoc } from "./schema"
import { CharacterExtendDoc, CharacterSyncDoc } from "../character/extend"


export type SceneNPCExtendDoc = SceneNPCDoc & {
  characterEx: CharacterExtendDoc,
};

export type SceneNPCSyncDoc = SceneNPCDoc & {
  characterSync: CharacterSyncDoc,
};