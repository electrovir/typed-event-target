import {Overwrite, RequiredBy} from '@augment-vir/common';

export interface TypedCustomEvent<DetailGeneric, EventTypeGeneric extends string>
    extends CustomEvent<DetailGeneric> {
    readonly type: EventTypeGeneric;
}

export type TypedCustomEventInit<DetailGeneric> = RequiredBy<
    CustomEventInit<DetailGeneric>,
    'detail'
>;

export function defineTypedCustomEvent<DetailGeneric = undefined>() {
    return <EventTypeGeneric extends string>(type: EventTypeGeneric) => {
        const TypedEventConstructor = class extends CustomEvent<DetailGeneric> {
            static readonly type = type;
            constructor(eventInitDict: TypedCustomEventInit<DetailGeneric>) {
                super(type, eventInitDict);
            }
        };

        return TypedEventConstructor as (new (
            eventInitDict: TypedCustomEventInit<DetailGeneric>,
        ) => TypedCustomEvent<DetailGeneric, EventTypeGeneric>) &
            Overwrite<
                typeof Event,
                Pick<TypedCustomEvent<DetailGeneric, EventTypeGeneric>, 'type'>
            >;
    };
}
