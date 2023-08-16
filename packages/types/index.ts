import type { block as createBlock } from '../million';
import type { ComponentType } from 'react';

export type MillionProps = Record<string, any>;

export interface Options {
  shouldUpdate?: (oldProps: MillionProps, newProps: MillionProps) => boolean;
  block?: any;
  original?: ComponentType<any>;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
  name?: string;
}

export interface MillionArrayProps<T> {
  each: T[];
  children: (value: T, i: number) => JSX.Element;
  memo?: true;
  ssr?: boolean;
  svg?: boolean;
  as?: string;
  [key: string]: any;
}

export interface ArrayCache<T> {
  each: T[] | null;
  children: T[] | null;
  mounted?: boolean | null;
  block?: ReturnType<typeof createBlock>;
}
