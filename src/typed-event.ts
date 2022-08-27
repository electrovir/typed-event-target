import {Overwrite} from 'augment-vir';

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

    return TypedEventConstructor as unknown as (new () => TypedEvent<EventTypeGeneric>) &
        Overwrite<typeof Event, Pick<TypedEvent<EventTypeGeneric>, 'type'>>;
}
