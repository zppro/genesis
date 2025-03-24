import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { idSceneNPC, SceneNPCId, sceneNPCFields } from './schema';
import { idLLM } from '../llms';
import { idTexture } from '../textures';
import { idScene } from '../scenes';
import { idCharacter } from '../character/schema';

/*** query args ***/

export const readArgs = { id: idSceneNPC };
export const listByIdsArgs = { ids: v.array(idSceneNPC) };
export const listBySceneArgs = { sceneId: idScene };
export const listByCharacterArgs = { characterId: idCharacter }

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListByIdsArgs = ObjectType<typeof listByIdsArgs>;
export type ListBySceneArgs = ObjectType<typeof listBySceneArgs>;
export type ListByCharacterArgs = ObjectType<typeof listByCharacterArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = sceneNPCFields
export const { sceneId: _2, ..._updateArgs } = insertArgs
export const updateArgs = { id: idSceneNPC, ..._updateArgs }
export const deleteArgs = { id: idSceneNPC }
export const updateTimeArgs = { id: idSceneNPC }


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: SceneNPCId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;
