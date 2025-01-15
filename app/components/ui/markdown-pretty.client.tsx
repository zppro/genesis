import MarkdownPreview from '@uiw/react-markdown-preview';
import { cn } from '~/lib/utils';


export type MarkdownPrettyProps = {
  data?: string;
}

export default function MarkdownPretty({ data, className, ...props }: React.ComponentProps<"div"> & MarkdownPrettyProps) {
  return (
    <div  {...props}>
      <MarkdownPreview source={data} className={cn(className)} style={{ padding: 16 }} />
    </div>
  )
}