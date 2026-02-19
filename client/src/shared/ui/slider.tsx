import type { ComponentProps } from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from '@/shared/lib/utils';

function Slider({
    className,
    ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
    return (
        <SliderPrimitive.Root
            data-slot="slider"
            className={cn(
                'relative flex w-full touch-none items-center select-none',
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track className="bg-muted relative h-1.5 w-full grow rounded-full">
                <SliderPrimitive.Range className="bg-primary absolute h-full rounded-full" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="border-primary bg-background focus-visible:ring-ring block size-4 rounded-full border-2 shadow transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
    );
}

export { Slider };
