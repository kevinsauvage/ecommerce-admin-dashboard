import { cn } from '@/lib/utils';

interface FormInputWrapperProps {
  children: React.ReactNode;
}

export default function FormInputWrapper({
  children,
  ...props
}: FormInputWrapperProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('pb-2 w-full grid gap-2', props.className)}>
      {children}
    </div>
  );
}
