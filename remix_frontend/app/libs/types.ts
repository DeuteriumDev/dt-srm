import { type LucideProps } from 'lucide-react';
import type apiRest from './api.server';

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
