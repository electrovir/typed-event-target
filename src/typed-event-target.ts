import {filterOutIndexes} from '@augment-vir/common';
import {ExtractEventByType, ExtractEventTypes} from './events/event-types';
import {TypedEventListenerOrEventListenerObject} from './listener';

export type EventTypesFromEventTarget<EventTargetGeneric extends TypedEventTarget<Event>> =
    EventTargetGeneric extends TypedEventTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;

export class TypedEventTarget<
    const PossibleEventsGeneric extends Readonly<Event>,
> extends EventTarget {
    private setupListeners: {
        type: string;
        callback: TypedEventListenerOrEventListenerObject<any>;
        options: boolean | EventListenerOptions | undefined;
    }[] = [];

    public getListenerCount(): number {
        return this.setupListeners.length;
    }

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

    override dispatchEvent(event: PossibleEventsGeneric): boolean {
        return super.dispatchEvent(event);
    }

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
