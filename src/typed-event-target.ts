import {filterOutIndexes} from '@augment-vir/common/dist/augments/array/filter.js';
import {type ExtractEventByType, type ExtractEventTypes} from './events/event-types.js';
import {type TypedEventListenerOrEventListenerObject} from './listener.js';

/**
 * Extract event types from an already-defined `TypedEventTarget` instance or sub-class.
 *
 * @category Internal
 */
export type EventTypesFromEventTarget<EventTargetGeneric extends TypedEventTarget<Event>> =
    EventTargetGeneric extends TypedEventTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;

/**
 * An EventTarget sub-class with typing for allowed events.
 *
 * @category Main
 */
export class TypedEventTarget<const PossibleEvents extends Readonly<Event>> extends EventTarget {
    protected setupListeners: {
        type: string;
        callback: TypedEventListenerOrEventListenerObject<any>;
        options: boolean | EventListenerOptions | undefined;
    }[] = [];

    /**
     * Get a count of all currently attached listeners. If a listener is removed, it will no longer
     * be counted.
     */
    public getListenerCount(): number {
        return this.setupListeners.length;
    }

    /**
     * Add an event listener. Has the same API as the built-in `EventTarget.addEventListener` method
     * but with added event types.
     */
    public override addEventListener<const EventType extends ExtractEventTypes<PossibleEvents>>(
        type: EventType,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEvents, EventType>
        > | null,
        options?: boolean | AddEventListenerOptions | undefined,
    ): void {
        super.addEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );
        if (callback) {
            this.setupListeners.push({
                type,
                callback,
                options,
            });
        }
    }

    /**
     * Dispatch a typed event. Has the same API as the built-in `EventTarget.dispatchEvent` method
     * but with added event types.
     */
    public override dispatchEvent(event: PossibleEvents): boolean {
        return super.dispatchEvent(event);
    }

    /**
     * Remove an already-added event listener. Has the same API as the built-in
     * `EventTarget.removeEventListener` method but with added event types.
     */
    public override removeEventListener<const EventType extends ExtractEventTypes<PossibleEvents>>(
        type: EventType,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEvents, EventType>
        > | null,
        options?: boolean | EventListenerOptions | undefined,
    ): void {
        super.removeEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );

        const previouslyAddedListenerIndex = this.setupListeners.findIndex((listener) => {
            if (
                listener.type !== type ||
                ((typeof options !== 'undefined' || typeof listener.options !== 'undefined') &&
                    (typeof options !== typeof listener.options ||
                        (typeof listener.options === 'boolean' &&
                            typeof options === 'boolean' &&
                            options !== listener.options) ||
                        (typeof listener.options === 'object' &&
                            typeof options === 'object' &&
                            options.capture !== listener.options.capture)))
            ) {
                return false;
            }

            return listener.callback === callback;
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

    /** Remove all internal state to free up resources. */
    public destroy(): void {
        this.removeAllEventListeners();
    }
}
