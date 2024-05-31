import { cn } from '@/lib/utils';

interface FormProps {
  action: (payload: FormData) => void;
  children: React.ReactNode;
}

export default function Form({
  action,
  children,
  ...props
}: FormProps & React.HTMLAttributes<HTMLFormElement>) {
  return (
    <form
      action={action}
      className={cn('y-6 w-full', props.className)}
      {...props}
    >
      {children}
    </form>
  );
}
