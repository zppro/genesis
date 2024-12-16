import { Lightbox } from "react-modal-image";
import { useState, ComponentProps } from "react";
import { cn } from "~/lib/utils"

type ImageDialogProps = ComponentProps<"img"> & {
  maxWidth: number;
  maxHeight: number;
};

function ImageDialog({ src, maxWidth, maxHeight, className, ...props }: ImageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <img
        onClick={() => setIsOpen(true)}
        src={src}
        className={cn("block w-auto h-auto cursor-pointer", `max-w-[${maxWidth}px]`, `max-h-[${maxHeight}px]`, className)}
        {...props}
      />
      {
        src && isOpen && <Lightbox
          small={src}
          medium={src}
          large={src}
          onClose={close}
        />
      }

    </>
  )
}


export { ImageDialog }