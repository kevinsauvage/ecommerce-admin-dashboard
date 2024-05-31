'use client';

import { HTMLAttributes, useEffect, useState } from 'react';

import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DateProps {
  date: Date;
}

export default function Date({
  date,
  className,
}: DateProps & HTMLAttributes<HTMLDivElement>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <div className={cn('text-sm', className)}>{formatDate(date)}</div>;
}
