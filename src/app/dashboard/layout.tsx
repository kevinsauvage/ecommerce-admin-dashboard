import Link from 'next/link';
import { redirect } from 'next/navigation';

import Header from '@/components/Header';
import LogoutButton from '@/components/LogoutButton';
import MainNav from '@/components/MainNav';
import db from '@/db';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const session = await getSession();
  const userId = session?.user?.id;
  const { storeId } = params;

  const store = await db.store.findFirst({ where: { userId, id: storeId } });

  if (!store) return redirect('/setup');

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r md:block md:sticky md:top-0 md:max-h-screen">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex items-center h-14 border-b px-4 lg:h-[60px] lg:px-6 w-full">
            <Link className="font-bold text-lg leading-3	" href="/">
              Acme Studio
            </Link>
          </div>
          <MainNav />
          <LogoutButton className="m-6 mt-auto" />
        </div>
      </aside>
      <div className="flex flex-col ">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40  ">
          {children}
        </main>
      </div>
    </div>
  );
}
