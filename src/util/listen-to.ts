import {type MaybePromise} from '@augment-vir/common';

/**
 * Call `addEventListener` on the given `EventTarget` instance and return a callback that removes
 * that listener.
 *
 * @category Listen
 */
export function listenTo<Target extends EventTarget>(
    target: Target,
    type: string,
    listener: (event: Event) => MaybePromise<void>,
    options?: Readonly<AddEventListenerOptions> | boolean,
): () => void {
    target.addEventListener(type, listener, options);

    return () => {
        return target.removeEventListener(type, listener, options);
    };
}

/**
 * A wrapper for `globalThis.addEventListener`
 *
 * @category Listen
 */
export function listenToGlobal<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: typeof globalThis, event: WindowEventMap[K]) => MaybePromise<void>,
    options?: Readonly<AddEventListenerOptions> | boolean,
): () => void {
    return listenTo(globalThis, type, listener as (event: Event) => MaybePromise<void>, options);
}
