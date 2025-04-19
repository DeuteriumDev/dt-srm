'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '~/libs/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const AvatarUser = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  {
    className?: string;
    user: {
      email?: string;
      avatar?: string | null;
      first_name?: string;
      last_name?: string;
    };
  }
>(({ className, user }, ref) => {
  const fallbackName = `${(user.first_name || 'A').charAt(0)}${(user.last_name || 'A').charAt(0)}`;
  return (
    <Avatar className={cn('h-8 w-8 rounded-lg', className)} ref={ref}>
      <AvatarImage src={user.avatar || undefined} alt={user.email} />
      <AvatarFallback className="rounded-lg">{fallbackName}</AvatarFallback>
    </Avatar>
  );
});
AvatarUser.displayName = 'AvatarUser';

export { Avatar, AvatarImage, AvatarFallback, AvatarUser };
