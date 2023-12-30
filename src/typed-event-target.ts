import {filterOutIndexes} from '@augment-vir/common';
import {ExtractEventByType, ExtractEventTypes} from './events/event-types';
import {TypedEventListenerOrEventListenerObject} from './listener';

/** Extract event types from an already-defined `TypedEventTarget` instance or sub-class. */
export type EventTypesFromEventTarget<EventTargetGeneric extends TypedEventTarget<Event>> =
    EventTargetGeneric extends TypedEventTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;

/** An EventTarget sub-class with typing for allowed events. */
export class TypedEventTarget<
    const PossibleEventsGeneric extends Readonly<Event>,
> extends EventTarget {
    private setupListeners: {
        type: string;
        callback: TypedEventListenerOrEventListenerObject<any>;
        options: boolean | EventListenerOptions | undefined;
    }[] = [];

    /**
     * Get a count of all currently listeners. If a listener is removed, it will no longer be
     * counted.
     */
    public getListenerCount(): number {
        return this.setupListeners.length;
    }

    /**
     * Add an event listener. Has the same API as the built-in `EventTarget.addEventListener` method
     * but with added event types.
     */
    override addEventListener<
        const EventNameGeneric extends ExtractEventTypes<PossibleEventsGeneric>,
    >(
        type: EventNameGeneric,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEventsGeneric, EventNameGeneric>
        > | null,
        options?: boolean | AddEventListenerOptions | undefined,
    ): void {
        super.addEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );
        if (callback) {
            this.setupListeners.push({type, callback, options});
        }
    }

    /** Dispatch a typed event. Causes all attached listeners listening to this event to be fired. */
    override dispatchEvent(event: PossibleEventsGeneric): boolean {
        return super.dispatchEvent(event);
    }

    /**
     * Remove an already-added event listener. Has the same API as the built-in
     * `EventTarget.removeEventListener` method but with added event types.
     */
    override removeEventListener<
        const EventNameGeneric extends ExtractEventTypes<PossibleEventsGeneric>,
    >(
        type: EventNameGeneric,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEventsGeneric, EventNameGeneric>
        > | null,
        options?: boolean | EventListenerOptions | undefined,
    ): void {
        super.removeEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );

        const previouslyAddedListenerIndex = this.setupListeners.findIndex((listener) => {
            if (listener.type !== type) {
                return false;
            }

            if (typeof options !== 'undefined' || typeof listener.options !== 'undefined') {
                if (typeof options !== typeof listener.options) {
                    return false;
                }

                if (
                    typeof listener.options === 'boolean' &&
                    typeof options === 'boolean' &&
                    options !== listener.options
                ) {
                    return false;
                } else if (
                    typeof listener.options === 'object' &&
                    typeof options === 'object' &&
                    options.capture !== listener.options.capture
                ) {
                    return false;
                }
            }

            if (listener.callback !== callback) {
                return false;
            }

            return true;
        });

        this.setupListeners = filterOutIndexes(this.setupListeners, [previouslyAddedListenerIndex]);
    }

    /** Remove all currently attached event listeners. */
    public removeAllEventListeners(): void {
        this.setupListeners.forEach((listenerSetup) => {
            super.removeEventListener(
                listenerSetup.type,
                listenerSetup.callback,
                listenerSetup.options,
            );
        });
        this.setupListeners = [];
    }
}
