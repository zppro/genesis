import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="h-screen container mx-auto grid grid-cols-4 place-content-center gap-4">
      <Link className="w-32 h-32 border place-content-center text-center" to="/concise">concise</Link>
      <Link className="w-32 h-32 border place-content-center text-center" to="/sidebar-07">sidebar-07</Link>
    </div>
  )
}