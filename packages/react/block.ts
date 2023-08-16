import {
  createElement,
  Fragment,
  useCallback,
  useMemo,
  useRef,
  Profiler,
} from 'react';
import {
  block as createBlock,
  mount$,
  patch as patchBlock,
} from '../million/block';
import { MapSet$, MapHas$ } from '../million/constants';
import { queueMicrotask$ } from '../million/dom';
import { processProps, unwrap } from './utils';
import { Effect, RENDER_SCOPE, REGISTRY, SVG_RENDER_SCOPE } from './constants';
import type { ComponentType, Ref } from 'react';
import type { Options, MillionProps } from '../types';

const MIN_UPDATE_SPAN_TIME = 16; // Frame boundary @ 60fps

export function onRender(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration,
  startTime,
  commitTime,
) {
  try {
    // @ts-expect-error okok
    const transaction: Transaction | undefined = window.__SENTRY__.hub
      .getScope()
      .getTransaction();
    console.log(id, phase, actualDuration, baseDuration, startTime, commitTime);
    console.log(transaction);
    if (transaction) {
      const now = Date.now();
      const span = transaction.startChild({
        description: `<${id}>`,
        op: `ui.react.${phase}`,
        startTimestamp: transaction.startTimestamp + startTime / 1000,
        endTimestamp:
          transaction.startTimestamp + (startTime + actualDuration) / 1000,
      });

      console.log(span, span.toString());
    }
  } catch (_) {
    // Add defensive catch since this wraps all of App
  }
}

export const block = <P extends MillionProps>(
  fn: ComponentType<P> | null,
  options: Options = {},
  // ...args: any[]
) => {
  const { block: compiledBlock, shouldUpdate, svg, as, name } = options;
  console.table(options);
  console.table(fn);
  const block = fn
    ? createBlock(fn as any, unwrap as any, shouldUpdate, svg)
    : compiledBlock;
  const defaultType = svg ? SVG_RENDER_SCOPE : RENDER_SCOPE;

  const MillionBlock = <P extends MillionProps>(
    props: P,
    forwardedRef: Ref<any>,
  ) => {
    const ref = useRef<HTMLElement>(null);
    const patch = useRef<((props: P) => void) | null>(null);

    props = processProps(props, forwardedRef);
    patch.current?.(props);

    // const effect = useCallback(() => {
    //   const currentBlock = block(props, props.key);
    //   if (ref.current && patch.current === null) {
    //     queueMicrotask$(() => {
    //       mount$.call(currentBlock, ref.current!, null);
    //     });
    //     patch.current = (props: P) => {
    //       queueMicrotask$(() => {
    //         patchBlock(currentBlock, block(props, props.key, shouldUpdate));
    //       });
    //     };
    //   }
    // }, []);

    const marker = useMemo(() => {
      return createElement(as ?? defaultType, { ref });
    }, []);

    const vnode = createElement(
      Fragment,
      null,
      marker,
      createElement(Profiler, { id: name || 'default', onRender }),
      // createElement(Effect, { effect }),
    );

    return vnode;
  };

  if (!MapHas$.call(REGISTRY, MillionBlock)) {
    MapSet$.call(REGISTRY, MillionBlock, block);
  }

  return MillionBlock<P>;
};

// export const profiler = <P extends MillionProps>(
//   fn: ComponentType<P> | null,
//   { block: compiledBlock, shouldUpdate, svg, as }: Options = {},
// ) => {
//   return createElement(Profiler);
// };
