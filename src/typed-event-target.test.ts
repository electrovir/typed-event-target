import {ArrayElement} from '@augment-vir/common';
import {assert} from '@open-wc/testing';
import {Constructed} from './augments/constructor';
import {SubEventDerp, SubEventHerp, SubEventType} from './test/test-events';
import {
    EventTypesFromEventTarget,
    TypedEventListener,
    TypedEventTarget,
} from './typed-event-target';

class ImplementedTypedEventTarget extends TypedEventTarget<SubEventHerp | SubEventDerp> {}

describe(TypedEventTarget.constructor.name, () => {
    it('can define the generic from an array', () => {
        const possibleEvents = [
            SubEventHerp,
            SubEventDerp,
        ];
        type PossibleEvent = Constructed<ArrayElement<typeof possibleEvents>>;

        class OtherImplementation extends TypedEventTarget<PossibleEvent> {}

        const shouldBeEqualByTypes: typeof ImplementedTypedEventTarget = OtherImplementation;
        // but they are still different classes
        assert.notInstanceOf(new OtherImplementation(), ImplementedTypedEventTarget);
        assert.notInstanceOf(new ImplementedTypedEventTarget(), OtherImplementation);
    });

    it('should be constructable', () => {
        const constructed = new TypedEventTarget();
        assert.instanceOf(constructed, TypedEventTarget);
    });

    it('should have constructable implementations', () => {
        const constructed = new ImplementedTypedEventTarget();
        assert.instanceOf(constructed, ImplementedTypedEventTarget);
    });

    it('should require dispatches to use correct event types', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.dispatchEvent(new SubEventHerp());
        // @ts-expect-error
        constructed.dispatchEvent(new Event(SubEventType.Derp));
        // @ts-expect-error
        constructed.dispatchEvent(new Event('what'));
    });

    it('should restrict event listener types', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventType.Derp, () => {});
        // @ts-expect-error
        constructed.addEventListener('what', () => {});
        // even if the string exactly matches the enum values the type won't work
        // @ts-expect-error
        constructed.addEventListener('herp', () => {});
    });

    it('should provide type information to the event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventType.Derp, (event) => {
            const canAssignToExpectedEventType: SubEventDerp = event;
            // @ts-expect-error
            const cannotAssignToOtherEventType: SubEventHerp = event;
        });
    });

    it('should restrict event types to removing a listener', () => {
        const constructed = new ImplementedTypedEventTarget();

        const goodListener: TypedEventListener<SubEventDerp> = () => {};
        const plainEventListener: TypedEventListener<Event> = () => {};

        constructed.removeEventListener(SubEventType.Derp, goodListener);
        // @ts-expect-error
        constructed.removeEventListener(SubEventType.Herp, goodListener);
        // @ts-expect-error
        constructed.removeEventListener('herp', plainEventListener);
        // @ts-expect-error
        constructed.removeEventListener('another string', plainEventListener);
        constructed.removeEventListener(SubEventType.Derp, plainEventListener);
        constructed.removeEventListener(SubEventType.Herp, plainEventListener);
    });

    it('should actually pass events to event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        const caughtEvents: {
            listener: string;
            event: EventTypesFromEventTarget<ImplementedTypedEventTarget>;
        }[] = [];

        try {
            constructed.addEventListener(SubEventType.Derp, (event) => {
                caughtEvents.push({listener: 'first-derp', event});
                assert.strictEqual(event.type, SubEventType.Derp);
            });

            const firstEvent = new SubEventDerp();
            constructed.dispatchEvent(firstEvent);
            constructed.dispatchEvent(new SubEventHerp());

            constructed.addEventListener(SubEventType.Herp, (event) => {
                caughtEvents.push({listener: 'first-herp', event});

                assert.strictEqual(event.type, SubEventType.Herp);
            });
            constructed.addEventListener(SubEventType.Herp, (event) => {
                caughtEvents.push({listener: 'second-herp', event});

                assert.strictEqual(event.type, SubEventType.Herp);
            });

            const doubledEvent = new SubEventHerp();
            constructed.dispatchEvent(doubledEvent);
            const lastEvent = new SubEventDerp();
            constructed.dispatchEvent(lastEvent);

            assert.strictEqual(caughtEvents.length, 4);

            assert.strictEqual(caughtEvents[0]?.event, firstEvent);
            assert.instanceOf(firstEvent, SubEventDerp);

            assert.strictEqual(caughtEvents[1]?.event, doubledEvent);
            assert.strictEqual(caughtEvents[2]?.event, doubledEvent);
            assert.instanceOf(doubledEvent, SubEventHerp);

            assert.strictEqual(caughtEvents[3]?.event, lastEvent);
            assert.instanceOf(lastEvent, SubEventDerp);
        } catch (error) {
            console.error({caughtEvents});
            throw error;
        }
    });
});

describe('EventTypesFromEventTarget', () => {
    it('should only allow the given event types', () => {
        type AllowedEvent = EventTypesFromEventTarget<ImplementedTypedEventTarget>;

        const validEvent1: AllowedEvent = new SubEventHerp();
        const validEvent2: AllowedEvent = new SubEventDerp();
        // @ts-expect-error
        const invalidEvent1: AllowedEvent = new Event('herp');
        // @ts-expect-error
        const invalidEvent2: AllowedEvent = new Event('derp');
        // @ts-expect-error
        const invalidEvent3: AllowedEvent = new Event('whatever');
    });
});
