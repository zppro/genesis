import { useState } from "react";
import { Label } from "~/components/ui/label";
import { type SkillExtendDoc } from "@/world/skill/extend"
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { SkillId } from "@/world/skill/schema";

export type OnChooseSkillFunc = (skillId: SkillId) => void

export default function SkillBox(
  { skillEx, choosen, onChooseFunc }:
    {
      skillEx: SkillExtendDoc,
      choosen?: boolean,
      onChooseFunc?: OnChooseSkillFunc
    }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <Label
      className={cn(
        "flex flex-col items-center justify-between rounded-md border-2 border-muted  p-4  peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
        choosen ? "cursor-not-allowed bg-accent text-popover" : "cursor-pointer bg-popover hover:bg-accent hover:text-accent-foreground"
      )}
      onDoubleClick={(e) => {
        onChooseFunc && onChooseFunc(skillEx._id)
      }}
    >
      <img className={cn(isLoaded ? "block w-auto h-auto cursor-pointer mb-3 max-w-6 max-h-6" : "hidden")} onLoad={() => {
        setIsLoaded(true)
      }} src={skillEx.textureUrl} />
      {!isLoaded ? (
        <Skeleton
          className={`block w-6 h-6 mb-3 z-50 bg-accent`}
        />
      ) : null}
      {skillEx.name}
    </Label>
  )
}