import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area"
import { type SkillExtendDoc } from "@/world/skill/extend"
import { type SkillId } from "@/world/skill/schema";
import SkillBox, { type OnChooseSkillFunc } from "./SkillBox";

export default function SkillLib(
  { choosenSkillIds, skillExs, onAddSkillToCharacter }:
    {
      choosenSkillIds: SkillId[],
      skillExs: SkillExtendDoc[],
      onAddSkillToCharacter?: OnChooseSkillFunc,
    }
) {

  return (
    <div className="flex h-full items-start flex-col space-y-2">
      <Card className="border-none shadow-none flex-1">
        <CardHeader className="p-1 pb-2">
          <CardTitle>Skills Lib</CardTitle>
          <CardDescription>
            double click to add the selected skill to the character
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-500px)] w-full">
            <div className="grid grid-cols-5 gap-2 pr-4">
              {skillExs.map(ske =>
                <SkillBox key={ske._id} skillEx={ske} choosen={choosenSkillIds.includes(ske._id)} onChooseFunc={choosenSkillIds.includes(ske._id) ? undefined : onAddSkillToCharacter} />
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}