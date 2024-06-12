import { Category, Prisma } from '@prisma/client';

export type NavigationInputItem = {
  id: string;
  name: string;
  url: string;
  category?: Category;
  items?: NavigationInputItem[] | [];
};

export type NavigationItem = Prisma.NavigationItemGetPayload<{
  include: {
    items: {
      include: {
        items: {
          include: {
            items: {
              include: {
                items: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export interface Navigation {
  id: string;
  name: string;
  slug: string;
  items: NavigationItem[];
}

export type ProductWithRelation = Prisma.ProductGetPayload<{
  include: {
    categories: true;
    variants: {
      include: {
        options: {
          include: {
            optionValue: true;
            option: true;
          };
        };
      };
    };
    images: true;
    tags: true;
    seo: true;
  };
}>;
