import {Overwrite, RequiredBy} from '@augment-vir/common';

/** Can't test this without running another test runner. */
/* c8 ignore next 12 */
function createPolyfill() {
    return class CustomEvent<T> extends Event {
        detail: T;
        constructor(message: string, data: EventInit & {detail: T}) {
            super(message, data);
            this.detail = data.detail;
        }
    };
}

const customEventSuperClass = globalThis.CustomEvent || createPolyfill();

export interface TypedCustomEvent<DetailGeneric, EventTypeGeneric extends string>
    extends CustomEvent<DetailGeneric> {
    readonly type: EventTypeGeneric;
}

export type TypedCustomEventInit<DetailGeneric> = RequiredBy<
    CustomEventInit<DetailGeneric>,
    'detail'
>;

export function defineTypedCustomEvent<const DetailGeneric = undefined>() {
    return <EventTypeGeneric extends string>(type: EventTypeGeneric) => {
        const TypedEventConstructor = class extends customEventSuperClass<DetailGeneric> {
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
