import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';

import { cn } from '@/shared/lib/utils';

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuContent = React.forwardRef<
    React.ComponentRef<typeof ContextMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
    <ContextMenuPortal>
        <ContextMenuPrimitive.Content
            ref={ref}
            className={cn(
                'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
                className,
            )}
            {...props}
        />
    </ContextMenuPortal>
));
ContextMenuContent.displayName = 'ContextMenuContent';

const ContextMenuItem = React.forwardRef<
    React.ComponentRef<typeof ContextMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <ContextMenuPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
            inset && 'pl-8',
            className,
        )}
        {...props}
    />
));
ContextMenuItem.displayName = 'ContextMenuItem';

const ContextMenuSeparator = React.forwardRef<
    React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Separator
        ref={ref}
        className={cn('bg-border -mx-1 my-1 h-px', className)}
        {...props}
    />
));
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

export {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
};
