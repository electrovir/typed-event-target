import {check} from '@augment-vir/assert';
import {type PartialWithUndefined} from '@augment-vir/common';
import {getOrSet} from '@augment-vir/common/dist/augments/object/get-or-set.js';
import {getObjectTypedValues} from '@augment-vir/common/dist/augments/object/object-values.js';
import {type ExtractEventByType, type ExtractEventTypes} from './events/event-types.js';
import {type RemoveListenerCallback, type TypedEventListenerWithRemoval} from './listener.js';

/**
 * Extract event types from an already-defined `TypedListenTarget` instance or sub-class.
 *
 * @category Types
 */
export type EventTypesFromListenTarget<EventTargetGeneric extends TypedListenTarget<Event>> =
    EventTargetGeneric extends TypedListenTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;

/**
 * Optional options for `TypedListenTarget.listen`.
 *
 * @category Types
 */
export type ListenOptions = PartialWithUndefined<{
    once: boolean;
}>;

type Listeners<PossibleEvents extends Readonly<Event>> = Partial<{
    [EventType in ExtractEventTypes<PossibleEvents>]: Map<
        TypedEventListenerWithRemoval<ExtractEventByType<PossibleEvents, EventType>>,
        {
            listener: TypedEventListenerWithRemoval<ExtractEventByType<PossibleEvents, EventType>>;
            removeListener: RemoveListenerCallback;
        }
    >;
}>;

/**
 * Similar to `TypedEventTarget` except that it uses a `listen` method to add listeners and that
 * method returns a callback to remove the attached listener rather than having a
 * `removeEventListener` method.
 *
 * @category Main
 */
export class TypedListenTarget<const PossibleEvents extends Readonly<Event> = never> {
    protected listeners: Listeners<PossibleEvents> = {};

    /**
     * Get a count of all currently attached listeners. If a listener is removed, it will no longer
     * be counted.
     */
    public getListenerCount(): number {
        const counts = getObjectTypedValues(this.listeners as Listeners<any>).map(
            (listenersEntry) => listenersEntry.size || 0,
        );
        return counts.reduce((accum, current) => accum + current, 0);
    }

    /**
     * Listen to an event.
     *
     * @returns A callback to remove the listener.
     */
    public listen<
        const EventDefinition extends Readonly<{type: ExtractEventTypes<PossibleEvents>}>,
    >(
        eventDefinition: EventDefinition,
        listenerCallback: TypedEventListenerWithRemoval<
            ExtractEventByType<PossibleEvents, EventDefinition['type']>
        >,
        options?: ListenOptions | undefined,
    ): RemoveListenerCallback;
    /**
     * Listen to an event by its type string.
     *
     * @returns A callback to remove the listener.
     */
    public listen<const EventType extends ExtractEventTypes<PossibleEvents>>(
        eventType: EventType,
        listenerCallback: TypedEventListenerWithRemoval<
            ExtractEventByType<PossibleEvents, EventType>
        >,
        options?: ListenOptions | undefined,
    ): RemoveListenerCallback;
    /**
     * Listen to events. Listening can be attached by a type string or by the event definition
     * itself.
     *
     * @returns A callback to remove the listener.
     */
    public listen(
        eventTypeOrConstructor: string | {type: string},
        listenerCallback: TypedEventListenerWithRemoval<any>,
        options: ListenOptions | undefined = {},
    ): RemoveListenerCallback {
        const listeners = this.listeners;
        const eventType: ExtractEventTypes<PossibleEvents> = check.isString(eventTypeOrConstructor)
            ? eventTypeOrConstructor
            : eventTypeOrConstructor.type;

        function removeListener(): boolean {
            return listeners[eventType]?.delete(listenerCallback) || false;
        }

        function wrappedCallback(event: PossibleEvents, removeSelf: RemoveListenerCallback) {
            if (options.once) {
                removeListener();
            }
            listenerCallback(event, removeSelf);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        getOrSet(listeners, eventType, () => new Map())!.set(listenerCallback, {
            listener: wrappedCallback,
            removeListener,
        });

        return removeListener;
    }

    /** Removes a listener. */
    public removeListener<
        const EventDefinition extends Readonly<{type: ExtractEventTypes<PossibleEvents>}>,
    >(
        eventDefinition: EventDefinition,
        listenerCallback: TypedEventListenerWithRemoval<
            ExtractEventByType<PossibleEvents, EventDefinition['type']>
        >,
    ): boolean;
    /** Removes a listener. */
    public removeListener<const EventType extends ExtractEventTypes<PossibleEvents>>(
        eventType: EventType,
        listenerCallback: TypedEventListenerWithRemoval<
            ExtractEventByType<PossibleEvents, EventType>
        >,
    ): boolean;
    /** Removes a listener. */
    public removeListener(
        eventTypeOrConstructor: string | {type: string},
        listenerCallback: TypedEventListenerWithRemoval<any>,
    ): boolean {
        const eventType: ExtractEventTypes<PossibleEvents> = check.isString(eventTypeOrConstructor)
            ? eventTypeOrConstructor
            : eventTypeOrConstructor.type;

        const eventTypeListeners = this.listeners[eventType];

        if (!eventTypeListeners) {
            return false;
        }

        const attachedListenerWrapper = eventTypeListeners.get(listenerCallback);

        if (!attachedListenerWrapper) {
            return false;
        }

        return attachedListenerWrapper.removeListener();
    }

    /**
     * Dispatch a typed event. Causes all attached listeners listening to this event to be fired.
     *
     * @returns The number of listeners that were fired.
     */
    public dispatch(event: PossibleEvents): number {
        const listenerSet = this.listeners[event.type as ExtractEventTypes<PossibleEvents>];

        /**
         * This must be calculated before calling the listeners as the listeners might remove
         * themselves.
         */
        const size: number = listenerSet?.size || 0;

        listenerSet?.forEach((listenerWrapper) => {
            listenerWrapper.listener(
                event as ExtractEventByType<PossibleEvents, ExtractEventTypes<PossibleEvents>>,
                listenerWrapper.removeListener,
            );
        });

        return size;
    }

    /**
     * Remove all currently attached event listeners.
     *
     * @returns The number of listeners that were removed.
     */
    public removeAllListeners(): number {
        const listenerSets = getObjectTypedValues(this.listeners as Listeners<any>);
        const totalRemoved = listenerSets.reduce((accum, listenerSet) => {
            const size = listenerSet.size || 0;
            listenerSet.clear();
            return accum + size;
        }, 0);
        this.listeners = {};

        return totalRemoved;
    }

    /** Remove all internal state to free up resources. */
    public destroy(): void {
        this.removeAllListeners();
    }
}

/**
 * An alias for `TypedListenTarget`.
 *
 * @category Main
 */
export class ListenTarget<
    const PossibleEvents extends Readonly<Event> = never,
> extends TypedListenTarget<PossibleEvents> {}
