import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ImageDialog } from "~/components/ui/image-dialog";

export type FileCardProps = {
  title: string;
  imageUrl: string;
  desc?: string;
}

export default function FileCard({ title, imageUrl, desc }: FileCardProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <ImageDialog src={imageUrl} />
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