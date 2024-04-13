import {MaybePromise} from '@augment-vir/common';

/**
 * Call `addEventListener` on the given `EventTarget` instance and return a callback that removes
 * that listener.
 *
 * @category Util
 */
export function listenTo<Target extends EventTarget>(
    target: Target,
    type: string,
    callback: (event: Event) => MaybePromise<void>,
): () => void {
    target.addEventListener(type, callback);

    return () => {
        return target.removeEventListener(type, callback);
    };
}
