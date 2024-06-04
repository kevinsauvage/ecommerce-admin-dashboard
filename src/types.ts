import { Prisma } from '@prisma/client';

export type CategoryTypeWithRelations = Prisma.CategoryGetPayload<{
  include: {
    childCategories: {
      include: {
        childCategories: {
          include: {
            childCategories: true;
          };
        };
      };
    };
    parent: {
      include: {
        parent: {
          include: {
            parent: true;
          };
        };
      };
    };
  };
}>;
