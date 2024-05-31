import { LucideInfo } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function FormErrorMessage({
  message,
}: {
  message?: string | Array<string> | undefined;
}) {
  if (Array.isArray(message)) {
    return (
      <div
        className={cn(
          'text-red-500 text-sm mt-0 opacity-0 flex items-center gap-2 mb-4',
          message.length && 'opacity-100'
        )}
      >
        {message.map((msg, index) => (
          <>
            <LucideInfo className="h-3.5 w-3.5 inline-block" />
            <p key={index}>{msg}</p>
          </>
        ))}
      </div>
    );
  }

  return (
    message && (
      <div
        className={cn(
          'text-red-500 text-sm mt-1 opacity-0 flex items-center gap-2 mb-4',
          message && 'opacity-100'
        )}
      >
        <LucideInfo className="h-3.5 w-3.5 inline-block" />

        {message}
      </div>
    )
  );
}
