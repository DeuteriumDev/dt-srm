import { type RowData } from '@tanstack/react-table';

import { type LucideProps } from 'lucide-react';
import type apiRest from './api.server';
import { type BaseSearchParams } from './request';

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type IconNode = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

export type Document = ArrayElement<
  apiRest.DocumentsListResponses['200']['results']
>;

export type PageLayout = 'grid' | 'table';

export type ActionResult =
  | Partial<Record<keyof apiRest.FolderRequest, string>>
  | { success: true }
  | { error: string };

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    searchParams?: BaseSearchParams;
    pagination?: {
      next: number | null | undefined;
      previous: number | null | undefined;
      count: number | undefined;
    };
  }
}
