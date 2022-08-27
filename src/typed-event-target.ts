import {ExtractEventByType, ExtractEventTypes} from './event-types';

export class TypedEventTarget<PossibleEventsGeneric extends Readonly<Event>> extends EventTarget {
    override addEventListener<EventNameGeneric extends ExtractEventTypes<PossibleEventsGeneric>>(
        type: EventNameGeneric,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEventsGeneric, EventNameGeneric>
        > | null,
        options?: boolean | AddEventListenerOptions | undefined,
    ): void {
        return super.addEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );
    }

    override dispatchEvent(event: PossibleEventsGeneric): boolean {
        return super.dispatchEvent(event);
    }

    override removeEventListener<EventNameGeneric extends ExtractEventTypes<PossibleEventsGeneric>>(
        type: EventNameGeneric,
        callback: TypedEventListenerOrEventListenerObject<
            ExtractEventByType<PossibleEventsGeneric, EventNameGeneric>
        > | null,
        options?: boolean | EventListenerOptions | undefined,
    ): void {
        return super.removeEventListener(
            type,
            callback as EventListenerOrEventListenerObject | null,
            options,
        );
    }
}

export interface TypedEventListener<EventGeneric extends Event> {
    (event: EventGeneric): void;
}
export interface TypedEventListenerObject<EventGeneric extends Event> {
    handleEvent(event: EventGeneric): void;
}
export type TypedEventListenerOrEventListenerObject<EventGeneric extends Event> =
    | TypedEventListener<EventGeneric>
    | TypedEventListenerObject<EventGeneric>;

export type EventTypesFromEventTarget<EventTargetGeneric extends TypedEventTarget<Event>> =
    EventTargetGeneric extends TypedEventTarget<infer InferredEventTypeGeneric>
        ? InferredEventTypeGeneric
        : never;
