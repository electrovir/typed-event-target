import {type RemoveListenerCallback, type TypedEventListenerWithRemoval} from './listener.js';
import {type ListenOptions} from './typed-listen-target.js';

/**
 * A constructor type for an Event subclass. Supports abstract classes.
 *
 * @category Internal
 */

export type EventClass<T extends Event = Event> = abstract new (...args: any[]) => T;

/**
 * Internal wrapper for listeners.
 *
 * @category Internal
 */
export type ListenerWrapper = {
    listener: TypedEventListenerWithRemoval<Event>;
    removeListener: RemoveListenerCallback;
};

/**
 * A generic listen target that stores listeners keyed by event constructor rather than event type
 * string. Listeners are matched via `instanceof`, so class hierarchy is respected: a listener
 * registered for a parent class will also fire for subclass instances.
 *
 * Unlike `TypedListenTarget`, this class accepts any `Event` without a constraining type parameter.
 *
 * @category Main
 */
export class GenericListenTarget {
    protected readonly listeners = new Map<
        EventClass,
        Map<TypedEventListenerWithRemoval<Event>, ListenerWrapper>
    >();

    /**
     * Get a count of all currently attached listeners. If a listener is removed, it will no longer
     * be counted.
     */
    public getListenerCount(): number {
        const maps = [...this.listeners.values()];
        return maps.reduce((accum, innerMap) => {
            return accum + innerMap.size;
        }, 0);
    }

    /**
     * Listen to events that are instances of the given event class. Because matching uses
     * `instanceof`, a listener for a parent class will also fire for subclass instances.
     *
     * @returns A callback to remove the listener.
     */
    public listen<const EventType extends Event>(
        eventClass: EventClass<EventType>,
        listenerCallback: TypedEventListenerWithRemoval<EventType>,
        options: ListenOptions | undefined = {},
    ): RemoveListenerCallback {
        const genericCallback = listenerCallback as TypedEventListenerWithRemoval<Event>;

        const innerMap = this.getOrCreateInnerMap(eventClass);

        const removeListener = (): boolean => {
            return innerMap.delete(genericCallback);
        };

        function wrappedCallback(event: Event, removeSelf: RemoveListenerCallback) {
            if (options.once) {
                removeListener();
            }
            genericCallback(event, removeSelf);
        }

        innerMap.set(genericCallback, {
            listener: wrappedCallback,
            removeListener,
        });

        return removeListener;
    }

    /**
     * Remove a previously attached listener.
     *
     * @returns Whether the listener existed and was removed.
     */
    public removeListener<const EventType extends Event>(
        eventClass: EventClass<EventType>,
        listenerCallback: TypedEventListenerWithRemoval<EventType>,
    ): boolean {
        const genericCallback = listenerCallback as TypedEventListenerWithRemoval<Event>;
        const innerMap = this.listeners.get(eventClass);

        if (!innerMap) {
            return false;
        }

        const wrapper = innerMap.get(genericCallback);

        if (!wrapper) {
            return false;
        }

        return wrapper.removeListener();
    }

    /**
     * Dispatch an event. Fires all listeners whose registered event class matches the dispatched
     * event via `instanceof`.
     *
     * @returns The number of listeners that were fired.
     */
    public dispatch(event: Event): number {
        if (event.target == undefined) {
            Object.defineProperty(event, 'target', {
                writable: false,
                value: this,
            });
        }

        let firedCount = 0;

        this.listeners.forEach((innerMap, eventClass) => {
            if (event instanceof eventClass) {
                /**
                 * Capture size before invoking listeners since listeners may remove themselves
                 * during iteration.
                 */
                firedCount += innerMap.size;
                innerMap.forEach((wrapper) => {
                    wrapper.listener(event, wrapper.removeListener);
                });
            }
        });

        return firedCount;
    }

    /**
     * Remove all currently attached listeners.
     *
     * @returns The number of listeners that were removed.
     */
    public removeAllListeners(): number {
        const maps = [...this.listeners.values()];
        const totalRemoved = maps.reduce((accum, innerMap) => {
            const size = innerMap.size;
            innerMap.clear();
            return accum + size;
        }, 0);
        this.listeners.clear();
        return totalRemoved;
    }

    /** Remove all internal state to free up resources. */
    public destroy(): void {
        this.removeAllListeners();
    }

    /** Retrieve the inner listener map for the given event class, creating it if it doesn't exist. */
    protected getOrCreateInnerMap(
        eventClass: EventClass,
    ): Map<TypedEventListenerWithRemoval<Event>, ListenerWrapper> {
        const existing = this.listeners.get(eventClass);

        if (existing) {
            return existing;
        }

        const innerMap = new Map<TypedEventListenerWithRemoval<Event>, ListenerWrapper>();
        this.listeners.set(eventClass, innerMap);
        return innerMap;
    }
}
