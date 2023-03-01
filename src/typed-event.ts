import {Overwrite} from '@augment-vir/common';

export interface TypedEvent<EventTypeGeneric extends string> extends Event {
    readonly type: EventTypeGeneric;
}

export function defineTypedEvent<EventTypeGeneric extends string>(type: EventTypeGeneric) {
    const TypedEventConstructor = class extends Event {
        static readonly type = type;
        constructor(eventInitDict?: EventInit) {
            super(type, eventInitDict);
        }
    };

    return TypedEventConstructor as (new (
        eventInitDict?: EventInit,
    ) => TypedEvent<EventTypeGeneric>) &
        Overwrite<typeof Event, Pick<TypedEvent<EventTypeGeneric>, 'type'>>;
}
