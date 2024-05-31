import { Category } from '@prisma/client';

export type CategoriesTypeWithChildrenCategories = Category & {
  childCategories: Array<
    Category & {
      childCategories: Array<
        Category & {
          childCategories: Array<
            Category & {
              childCategories: Array<Category>;
            }
          >;
        }
      >;
    }
  >;
};
