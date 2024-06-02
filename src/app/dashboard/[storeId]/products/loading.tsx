import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-74px-4rem)]">
      <Loader size="2rem" className="animate-spin" />
    </div>
  );
}
