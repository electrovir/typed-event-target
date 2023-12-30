import {Overwrite, RequiredBy} from '@augment-vir/common';

/**
 * Account for some browsers not implementing the `CustomEvent` global class. It's simple, so this
 * is just a quick polyfill for it.
 */
/* c8 ignore next 12 */ // Can't test this without running another test runner.
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

/**
 * Sub-class of `CustomEvent` with the detail type and event type string both being part of its type
 * signature.
 */
export interface TypedCustomEvent<EventDetail, EventType extends string>
    extends CustomEvent<EventDetail> {
    readonly type: EventType;
}

/** Init input for TypedCustomEvent instances. */
export type TypedCustomEventInit<EventDetail> = RequiredBy<CustomEventInit<EventDetail>, 'detail'>;

/**
 * Define a `CustomEvent` sub-class with a type tied to its detail type and event type string. This
 * is the same as `defineTypedEvent` but with a detail property for storing arbitrary data.
 *
 * @example
 *     defineTypedCustomEvent<DetailType>()('event-type-string');
 */
export function defineTypedCustomEvent<const EventDetail = undefined>() {
    return <EventType extends string>(type: EventType) => {
        const TypedEventConstructor = class extends customEventSuperClass<EventDetail> {
            static readonly type = type;
            constructor(eventInitDict: TypedCustomEventInit<EventDetail>) {
                super(type, eventInitDict);
            }
        };

        return TypedEventConstructor as (new (
            eventInitDict: TypedCustomEventInit<EventDetail>,
        ) => TypedCustomEvent<EventDetail, EventType>) &
            Overwrite<typeof Event, Pick<TypedCustomEvent<EventDetail, EventType>, 'type'>>;
    };
}
