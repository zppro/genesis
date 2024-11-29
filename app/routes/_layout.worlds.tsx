import { Outlet } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog"
import { useNavigate, useNavigation } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton"

export default function WorldPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading"
  return <Dialog open={true} onOpenChange={(isOpen) => {
    if (!isOpen) {
      navigate(-1)
    }
  }}>
    <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen flex justify-center items-center"}>
      {isLoading ? <Skeleton className="w-[55rem] h-[44rem]" /> : <Outlet />}
    </DialogContent>
  </Dialog>
}