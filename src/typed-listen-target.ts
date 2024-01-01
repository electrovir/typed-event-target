import {PartialAndUndefined, getObjectTypedValues} from '@augment-vir/common';
import {isRunTimeType} from 'run-time-assertions';
import {Constructor} from 'type-fest';
import {Constructed} from './augments/constructor';
import {ExtractEventByType, ExtractEventTypes} from './events/event-types';
import {RemoveListenerCallback, TypedEventListenerWithRemoval} from './listener';

/** Extract event types from an already-defined `TypedListenTarget` instance or sub-class. */
export type EventTypesFromListenTarget<EventTargetGeneric extends TypedListenTarget<Event>> =
    EventTargetGeneric extends TypedListenTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;

/** Optional options for `TypedListenTarget.listen`. */
export type ListenOptions = PartialAndUndefined<{
    once: boolean;
}>;

/**
 * Similar to `TypedEventTarget` except that it uses a `listen` method to add listeners and that
 * method returns a callback to remove the attached listener rather than having a
 * `removeEventListener` method.
 */
export class TypedListenTarget<const PossibleEvents extends Readonly<Event> = never> {
    private listeners: Partial<{
        [EventType in ExtractEventTypes<PossibleEvents>]: Set<
            TypedEventListenerWithRemoval<ExtractEventByType<PossibleEvents, EventType>>
        >;
    }> = {};

    /**
     * Get a count of all currently attached listeners. If a listener is removed, it will no longer
     * be counted.
     */
    public getListenerCount(): number {
        const counts = getObjectTypedValues(this.listeners).map(
            (listenersEntry) => listenersEntry?.size || 0,
        );
        return counts.reduce((accum, current) => accum + current, 0);
    }

    /**
     * Listen to an event.
     *
     * @returns A callback to remove the listener.
     */
    public listen<const EventDefinition extends Constructor<PossibleEvents>>(
        eventDefinition: EventDefinition,
        listenerCallback: TypedEventListenerWithRemoval<Constructed<EventDefinition>>,
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
    listen(
        eventTypeOrConstructor: string | {type: string},
        listenerCallback: TypedEventListenerWithRemoval<any>,
        options: ListenOptions | undefined = {},
    ): RemoveListenerCallback {
        const listeners = this.listeners;
        const eventType: ExtractEventTypes<PossibleEvents> = isRunTimeType(
            eventTypeOrConstructor,
            'string',
        )
            ? eventTypeOrConstructor
            : eventTypeOrConstructor.type;

        function removeListener(): boolean {
            return listeners[eventType]?.delete(wrappedCallback) || false;
        }

        function wrappedCallback(event: PossibleEvents, removeSelf: RemoveListenerCallback) {
            if (options.once) {
                removeListener();
            }
            listenerCallback(event, removeSelf);
        }

        if (!listeners[eventType]) {
            listeners[eventType] = new Set();
        }
        listeners[eventType]!.add(wrappedCallback);

        return removeListener;
    }

    /**
     * Dispatch a typed event. Causes all attached listeners listening to this event to be fired.
     *
     * @returns The number of listeners that were fired.
     */
    public dispatchEvent(event: PossibleEvents): number {
        const listenerSet = this.listeners[event.type as ExtractEventTypes<PossibleEvents>];

        /**
         * This must be calculated before calling the listeners as the listeners might remove
         * themselves.
         */
        const size: number = listenerSet?.size || 0;

        listenerSet?.forEach((listenerCallback) => {
            listenerCallback(
                event as ExtractEventByType<PossibleEvents, ExtractEventTypes<PossibleEvents>>,
                () => {
                    return listenerSet.delete(listenerCallback);
                },
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
        const listenerSets = getObjectTypedValues(this.listeners);
        const totalRemoved = listenerSets.reduce((accum, listenerSet) => {
            const size = listenerSet?.size || 0;
            listenerSet?.clear();
            return accum + size;
        }, 0);
        this.listeners = {};

        return totalRemoved;
    }
}
