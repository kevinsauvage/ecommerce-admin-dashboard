'use client';

import {
  ChevronDown,
  CreditCard,
  Layers3,
  LayoutDashboard,
  Package,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cloneElement } from 'react';

import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface routes {
  label: string;
  path: string;
  active: boolean;
  icon: JSX.Element;
  collapsible?: routes[];
}

export default function MainNav() {
  const pathname = usePathname();
  const params = useParams();

  const { storeId } = params;

  const routes = [
    {
      label: 'Dashboard',
      path: `/dashboard/${storeId}`,
      active: pathname === `/dashboard/${storeId}`,
      icon: <LayoutDashboard />,
    },
    {
      label: 'Products',
      icon: <Package />,
      path: `/dashboard/${storeId}/products`,
      collapsible: [
        {
          label: 'Catalog',
          path: `/dashboard/${storeId}/products`,
          active: pathname === `/dashboard/${storeId}/products`,
          icon: <Package />,
        },
        {
          label: 'Categories',
          path: `/dashboard/${storeId}/categories`,
          active: pathname === `/dashboard/${storeId}/categories`,
          icon: <Layers3 />,
        },
        {
          label: 'Options',
          path: `/dashboard/${storeId}/options`,
          active: pathname === `/dashboard/${storeId}/options`,
          icon: <Package />,
        },
      ],
    },
    {
      label: 'Orders',
      path: `/dashboard/${storeId}/orders`,
      active: pathname === `/dashboard/${storeId}/orders`,
      icon: <CreditCard />,
    },
    {
      label: 'Navigation',
      path: `/dashboard/${storeId}/navigation`,
      active: pathname === `/dashboard/${storeId}/navigation`,
      icon: <Package />,
    },
    {
      label: 'Settings',
      path: `/dashboard/${storeId}/settings`,
      active: pathname === `/dashboard/${storeId}/settings`,
      icon: <Settings />,
    },
  ] as routes[];

  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:p-4">
        <ul className="space-y-2 px-4">
          {routes.map((route) => (
            <li key={route.path}>
              {route.collapsible ? (
                <Collapsible className="group">
                  <CollapsibleTrigger className="flex items-center justify-between gap-2 rounded-md px-3 py-2 mb-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50">
                    <div className="flex items-center gap-2">
                      {cloneElement(route.icon, {
                        className: 'h-4 w-4',
                      })}
                      {route.label}
                    </div>
                    <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 space-y-1">
                    {route.collapsible.map((subRoute) => (
                      <Link
                        key={subRoute.path}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                          subRoute.active && 'bg-muted text-foreground'
                        )}
                        href={subRoute.path}
                      >
                        {subRoute.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    route.active && 'bg-muted text-foreground'
                  )}
                  href={route.path}
                >
                  <div className="flex items-center gap-2">
                    {cloneElement(route.icon, {
                      className: 'h-4 w-4',
                    })}
                    {route.label}
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
