import { UserProfile } from '@clerk/remix'
import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog"
import { ClerkLoading, ClerkLoaded } from '@clerk/remix'
import { Skeleton } from "~/components/ui/skeleton"
import { useNavigate } from "@remix-run/react";
export default function UserProfilePage() {
  const navigate = useNavigate();
  return <Dialog open={true} onOpenChange={(isOpen) => {
    if (!isOpen) {
      navigate(-1)
    }
  }}>
    <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
      <ClerkLoading>
        <Skeleton className="w-[55rem] h-[44rem]" />
      </ClerkLoading>
      <ClerkLoaded>
        <UserProfile path="/user" />
      </ClerkLoaded>

    </DialogContent>
  </Dialog>
}