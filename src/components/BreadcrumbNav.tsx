import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { cn } from '@/lib/utils';

export default function BreadcrumbNav({
  items,
}: {
  items: Array<{ name: string; href?: string }>;
}) {
  return (
    items?.length && (
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <div className="flex items-center gap-2" key={item.name + index}>
              <BreadcrumbItem
                className={cn(
                  'text-sm',
                  index === items.length - 1 && 'text-foreground'
                )}
              >
                <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  );
}
