import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "~/lib/utils"
import { useState, useRef, useLayoutEffect } from 'react';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {

  const [value, setValue] = useState(props.defaultValue?.[0]);
  const [offset, setOffset] = useState(14.8812);
  const thrumbRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const { left, right } = thrumbRef.current!.getBoundingClientRect();
    if (left + right > 0) {
      const containerRect = thrumbRef.current!.closest('form')!.getBoundingClientRect();

      const limitLeft = containerRect.left - 12 * 0.25;
      const limitRight = containerRect.right + 12 * 0.25;

      const offsetLeft = offset + (limitLeft - left) / 1.25;
      const offsetRight = offset + (limitRight - right) / 1.25;
      if (offsetLeft > 0) {
        setOffset(offsetLeft);
      } else if (offsetRight < 0) {
        setOffset(offsetRight);
      }
    }
  });

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex items-center select-none touch-none w-full h-5",
        className
      )}
      {...props}
      onValueChange={(e) => {
        setValue(e[0])
        props.onValueChange && props.onValueChange(e)
      }}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative group duration-150 block w-6 h-6 bg-primary rounded-full active:scale-125 outline-none border-none cursor-pointer" >
        <div style={{ transform: `translateX(${offset}px)` }}>
          <h1
            className="absolute ease-in-out duration-150 transition opacity-0 group-active:opacity-100 group-active:-translate-y-12 -translate-y-6 -translate-x-1/2 left-1/2 px-5 py-2 bg-primary text-center rounded-full text-white whitespace-nowrap text-xs font-bold"
            ref={thrumbRef}
          >
            {value}
          </h1>
        </div>
      </SliderPrimitive.Thumb>

    </SliderPrimitive.Root>
  )
}
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
