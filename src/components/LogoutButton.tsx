'use client';

import { LogOut } from 'lucide-react';
import { ComponentProps } from 'react';

import { Button } from './ui/button';
import { logout } from '@/actions/authentication';
import { cn } from '@/lib/utils';

export default function LogoutButton({
  className,
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      className={cn('flex items-center gap-2 space-x-2', className)}
      onClick={() => logout()}
    >
      <LogOut size={16} />
      Log out
    </Button>
  );
}
