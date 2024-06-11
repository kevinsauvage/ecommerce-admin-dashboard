import { Menu } from 'lucide-react';
import { redirect } from 'next/navigation';

import LogoutButton from './LogoutButton';
import MainNav from './MainNav';
import { Button } from './ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import StoreSwitcher from '@/components/StoreSwitcher';
import ToggleTheme from '@/components/ToggleTheme';
import db from '@/db';
import { getSession } from '@/lib/auth';

export default async function Header() {
  const session = await getSession();

  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const stores = await db.store.findMany({ where: { userId } });

  return (
    <header className="flex h-16 max-h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:min-h-[60px] lg:px-6">
      <div className="flex gap-4 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <MainNav />
            <LogoutButton className="m-6 mt-auto" />
          </SheetContent>
        </Sheet>

        <StoreSwitcher stores={stores} />
      </div>
      <div className="flex gap-4">
        <ToggleTheme />
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </header>
  );
}
