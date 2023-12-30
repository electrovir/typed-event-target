import {Overwrite} from '@augment-vir/common';

/** Sub-class of `Event` with the type string part of the type signature. */
export interface TypedEvent<EventType extends string> extends Event {
    readonly type: EventType;
}

/**
 * Define an `Event` sub-class with a type tied to its event type string.
 *
 * @example
 *     defineTypedEvent('event-type-string');
 */
export function defineTypedEvent<const EventType extends string>(type: EventType) {
    const TypedEventConstructor = class extends Event {
        static readonly type = type;
        constructor(eventInitDict?: EventInit) {
            super(type, eventInitDict);
        }
    };

    return TypedEventConstructor as (new (eventInitDict?: EventInit) => TypedEvent<EventType>) &
        Overwrite<typeof Event, Pick<TypedEvent<EventType>, 'type'>>;
}
