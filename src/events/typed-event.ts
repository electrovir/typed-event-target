import {type Overwrite} from '@augment-vir/common';

/**
 * Sub-class of `Event` with the type string part of the type signature.
 *
 * @category Internal
 */
export interface TypedEvent<EventType extends string> extends Event {
    readonly type: EventType;
}

/**
 * Define an `Event` sub-class with a type tied to its event type string. Optionally accepts a
 * second parameter to specify a parent super class (must extend `Event`) instead of the default
 * `Event`. Defined events bubble and cross shadow boundaries by default. Explicit event init values
 * override these defaults.
 *
 * @category Events
 * @example
 *
 * ```ts
 * import {defineTypedEvent} from 'typed-event-target';
 *
 * defineTypedEvent('event-type-string');
 *
 * // with a custom super class
 * defineTypedEvent('event-type-string', MyCustomEvent);
 * ```
 */
export function defineTypedEvent<
    const EventType extends string,
    const SuperClass extends typeof Event = typeof Event,
>(type: EventType, SuperClass?: SuperClass) {
    const ParentClass = SuperClass ?? Event;
    const TypedEventConstructor = class extends ParentClass {
        public static readonly type = type;
        constructor(eventInitDict?: EventInit) {
            super(type, {
                bubbles: true,
                composed: true,
                ...eventInitDict,
            });
        }
    };

    return TypedEventConstructor as (new (
        eventInitDict?: EventInit,
    ) => InstanceType<SuperClass> & TypedEvent<EventType>) &
        Overwrite<SuperClass, Pick<TypedEvent<EventType>, 'type'>>;
}
