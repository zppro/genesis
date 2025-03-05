import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area"
import { type SkillExtendDoc } from "@/world/skill/extend"
import SkillBox, { type OnChooseSkillFunc } from "./SkillBox";


export default function ChoosenSkills(
  { skillExs, onRemoveSkillFromCharacter }:
    {
      skillExs: SkillExtendDoc[],
      onRemoveSkillFromCharacter?: OnChooseSkillFunc,
    }) {
  // const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="flex h-full items-start flex-col space-y-2">
      <Card className="border-none shadow-none">
        <CardHeader className="p-1 pb-2">
          <CardTitle>Choosen Skills</CardTitle>
          <CardDescription>
            double click to remove the selected skill from the character
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0" >
          <ScrollArea className="h-28 w-full min-h-24">
            <div className="grid grid-cols-5 gap-2 pr-4">
              {/* <Label
                className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                onDoubleClick={(e) => {
                  console.log("label dbl clicked", e)
                }}
              >
                <img className={cn(isLoaded ? "block w-auto h-auto cursor-pointer mb-3 max-w-6 max-h-6" : "hidden")} onLoad={() => {
                  console.log("loaded image!")
                  setIsLoaded(true)
                }} src="https://basic-jellyfish-78.convex.cloud/api/storage/c09e3541-3d70-40b4-89c5-94124b3b10ad" />
                {!isLoaded ? (
                  <Skeleton
                    className={`block w-6 h-6 mb-3 z-50 bg-accent`}
                  />
                ) : null}
                Card
              </Label> */}
              {skillExs.map(ske =>
                <SkillBox key={ske._id} skillEx={ske} onChooseFunc={onRemoveSkillFromCharacter} />
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}