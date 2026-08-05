import {type Overwrite, type SetRequired} from '@augment-vir/common';

/**
 * Sub-class of `CustomEvent` with the detail type and event type string both being part of its type
 * signature.
 *
 * @category Internal
 */
export interface TypedCustomEvent<EventDetail, EventType extends string>
    extends CustomEvent<EventDetail> {
    readonly type: EventType;
}

/**
 * Init input for TypedCustomEvent instances.
 *
 * @category Internal
 */
export type TypedCustomEventInit<EventDetail> = SetRequired<CustomEventInit<EventDetail>, 'detail'>;

/**
 * Define a `CustomEvent` sub-class with a type tied to its detail type and event type string. This
 * is the same as `defineTypedEvent` but with a detail property for storing arbitrary data.
 *
 * This needs to be called twice in order to properly bind both the detail type generic and the
 * event type string. Defined events bubble and cross shadow boundaries by default. Explicit event
 * init values override these defaults.
 *
 * @category Events
 * @example DefineTypedCustomEvent<DetailType>()('event-type-string');
 */
export function defineTypedCustomEvent<const EventDetail = undefined>() {
    /** Needs to be called with the type string in order to finalize the event definition setup. */
    function defineEventTypeString<EventType extends string>(type: EventType) {
        const TypedEventConstructor = class extends CustomEvent<EventDetail> {
            public static readonly type = type;

            constructor(eventInitDict: TypedCustomEventInit<EventDetail>) {
                super(type, {
                    bubbles: true,
                    composed: true,
                    ...eventInitDict,
                });
            }
        };

        return TypedEventConstructor as (new (
            eventInitDict: TypedCustomEventInit<EventDetail>,
        ) => TypedCustomEvent<EventDetail, EventType>) &
            Overwrite<typeof Event, Pick<TypedCustomEvent<EventDetail, EventType>, 'type'>>;
    }

    return defineEventTypeString;
}
