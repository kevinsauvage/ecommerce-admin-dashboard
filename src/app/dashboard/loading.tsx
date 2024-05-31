import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader size="2rem" className="animate-spin" />
    </div>
  );
}
