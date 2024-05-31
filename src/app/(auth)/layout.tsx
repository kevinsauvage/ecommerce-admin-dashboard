export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg m-auto flex flex-col items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
