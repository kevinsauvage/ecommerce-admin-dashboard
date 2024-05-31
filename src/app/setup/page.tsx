import StoreForm from '@/app/setup/_components/StoreForm';

export default async function SetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-96">
        <h1 className="text-3xl font-semibold mb-4">Create a new store</h1>
        <StoreForm />
      </div>
    </div>
  );
}
