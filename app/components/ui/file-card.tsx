import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type LucideIcon } from "lucide-react"

export type FileCardProps = {
  title: string;
  file: { url: string, icon: LucideIcon }
  desc?: string;
}

export default function FileCard({ title, file, desc }: FileCardProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex justify-center">
          <a href={file.url} className="underline">
            <file.icon className="h-12 w-12" /></a>
        </div>
        {
          desc &&
          <p className="text-xs text-muted-foreground">
            {desc}
          </p>
        }
      </CardContent>
    </Card>
  )
}