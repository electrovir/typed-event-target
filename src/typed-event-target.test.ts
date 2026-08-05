import {assert} from '@augment-vir/assert';
import {type ArrayElement} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {SubEventDerp, SubEventHerp, SubEventTypeEnum} from './events/events.mock.js';
import {type TypedEventListener} from './listener.js';
import {type EventTypesFromEventTarget, TypedEventTarget} from './typed-event-target.js';

class ImplementedTypedEventTarget extends TypedEventTarget<SubEventHerp | SubEventDerp> {}

describe(TypedEventTarget.constructor.name, () => {
    it('can define the generic from an array', () => {
        const possibleEvents = [
            SubEventHerp,
            SubEventDerp,
        ];
        type PossibleEvent = InstanceType<ArrayElement<typeof possibleEvents>>;

        class OtherImplementation extends TypedEventTarget<PossibleEvent> {}

        const shouldBeEqualByTypes: typeof ImplementedTypedEventTarget = OtherImplementation;
        // but they are still different classes
        assert.notInstanceOf(new OtherImplementation(), ImplementedTypedEventTarget);
        assert.notInstanceOf(new ImplementedTypedEventTarget(), OtherImplementation);
    });

    it('is constructable', () => {
        const constructed = new TypedEventTarget();
        assert.instanceOf(constructed, TypedEventTarget);
    });

    it('has constructable implementations', () => {
        const constructed = new ImplementedTypedEventTarget();
        assert.instanceOf(constructed, ImplementedTypedEventTarget);
    });

    it('requires dispatches to use correct event types', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.dispatchEvent(new SubEventHerp());
        // @ts-expect-error: wrong event type
        constructed.dispatchEvent(new Event(SubEventTypeEnum.Derp));
        // @ts-expect-error: wrong event type
        constructed.dispatchEvent(new Event('what'));
    });

    it('restricts event listener types', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventTypeEnum.Derp, () => {});
        // @ts-expect-error: wrong event type
        constructed.addEventListener('what', () => {});
        // even if the string exactly matches the enum values the type won't work
        // @ts-expect-error: wrong event type
        constructed.addEventListener('herp', () => {});
    });

    it('provides type information to the event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventTypeEnum.Derp, (event) => {
            const canAssignToExpectedEventType: SubEventDerp = event;
            // @ts-expect-error: wrong event type
            const cannotAssignToOtherEventType: SubEventHerp = event;
        });
    });

    it('restricts event types to removing a listener', () => {
        const constructed = new ImplementedTypedEventTarget();

        const goodListener: TypedEventListener<SubEventDerp> = () => {};
        const plainEventListener: TypedEventListener<Event> = () => {};

        constructed.removeEventListener(SubEventTypeEnum.Derp, goodListener);
        // @ts-expect-error: wrong event type
        constructed.removeEventListener(SubEventTypeEnum.Herp, goodListener);
        // @ts-expect-error: wrong event type
        constructed.removeEventListener('herp', plainEventListener);
        // @ts-expect-error: wrong event type
        constructed.removeEventListener('another string', plainEventListener);
        constructed.removeEventListener(SubEventTypeEnum.Derp, plainEventListener);
        constructed.removeEventListener(SubEventTypeEnum.Herp, plainEventListener);
    });

    it('actually passes events to event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        const caughtEvents: {
            listener: string;
            event: EventTypesFromEventTarget<ImplementedTypedEventTarget>;
        }[] = [];

        try {
            constructed.addEventListener(SubEventTypeEnum.Derp, (event) => {
                caughtEvents.push({
                    listener: 'first-derp',
                    event,
                });
                assert.strictEquals(event.type, SubEventTypeEnum.Derp);
            });

            const firstEvent = new SubEventDerp();
            constructed.dispatchEvent(firstEvent);
            constructed.dispatchEvent(new SubEventHerp());

            constructed.addEventListener(SubEventTypeEnum.Herp, (event) => {
                caughtEvents.push({
                    listener: 'first-herp',
                    event,
                });

                assert.strictEquals(event.type, SubEventTypeEnum.Herp);
            });
            constructed.addEventListener(SubEventTypeEnum.Herp, (event) => {
                caughtEvents.push({
                    listener: 'second-herp',
                    event,
                });

                assert.strictEquals(event.type, SubEventTypeEnum.Herp);
            });

            const doubledEvent = new SubEventHerp();
            constructed.dispatchEvent(doubledEvent);
            const lastEvent = new SubEventDerp();
            constructed.dispatchEvent(lastEvent);

            assert.strictEquals(caughtEvents.length, 4);

            assert.strictEquals(caughtEvents[0]?.event, firstEvent);
            assert.instanceOf(firstEvent, SubEventDerp);

            assert.strictEquals(caughtEvents[1]?.event, doubledEvent);
            assert.strictEquals(caughtEvents[2]?.event, doubledEvent);
            assert.instanceOf(doubledEvent, SubEventHerp);

            assert.strictEquals(caughtEvents[3]?.event, lastEvent);
            assert.instanceOf(lastEvent, SubEventDerp);
        } catch (error) {
            console.error({
                caughtEvents,
            });
            throw error;
        }
    });

    it('removes all listeners', () => {
        const target = new ImplementedTypedEventTarget();
        let listenerCallCount = 0;
        target.addEventListener(SubEventTypeEnum.Herp, () => {
            listenerCallCount++;
        });
        target.addEventListener(SubEventTypeEnum.Herp, () => {
            listenerCallCount++;
        });
        target.addEventListener(SubEventTypeEnum.Herp, {
            handleEvent() {
                listenerCallCount++;
            },
        });
        target.addEventListener(
            SubEventTypeEnum.Herp,
            () => {
                listenerCallCount++;
            },
            {
                capture: true,
            },
        );
        target.addEventListener(
            SubEventTypeEnum.Herp,
            () => {
                listenerCallCount++;
            },
            {
                capture: false,
            },
        );
        target.addEventListener(SubEventTypeEnum.Derp, () => {
            listenerCallCount++;
        });

        target.dispatchEvent(new SubEventHerp());
        assert.strictEquals<number, number>(listenerCallCount, 5);
        target.dispatchEvent(new SubEventDerp());
        assert.strictEquals(listenerCallCount, 6);

        target.removeAllEventListeners();
        listenerCallCount = 0;
        target.dispatchEvent(new SubEventHerp());
        target.dispatchEvent(new SubEventDerp());
        assert.strictEquals(listenerCallCount, 0);
        assert.strictEquals(target.getListenerCount(), 0);
    });

    function createListenerInputs() {
        let callCount = 0;

        const inputs: Parameters<TypedEventTarget<any>['addEventListener']>[] = [
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
            ],
            [
                SubEventTypeEnum.Herp,
                {
                    handleEvent() {
                        callCount++;
                    },
                },
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
                {
                    capture: true,
                },
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
                {
                    capture: false,
                },
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
                true,
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
                false,
            ],
            [
                SubEventTypeEnum.Derp,
                () => {
                    callCount++;
                },
            ],
        ];

        return {
            inputs,
            clearCallCount(this: void) {
                callCount = 0;
            },
            getCallCount(this: void) {
                return callCount;
            },
        };
    }

    it('removes internal listeners one by one', () => {
        const {inputs, clearCallCount, getCallCount} = createListenerInputs();
        const target = new ImplementedTypedEventTarget();

        inputs.forEach((listenerInputs) => {
            target.addEventListener(...listenerInputs);
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());
            assert.strictEquals(getCallCount(), 1);
            assert.strictEquals(target.getListenerCount(), 1);
            clearCallCount();
            target.removeEventListener(...listenerInputs);
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());
            assert.strictEquals(getCallCount(), 0);
            assert.strictEquals(target.getListenerCount(), 0);
        });
    });

    it('removes internal listeners by specific setup inputs', () => {
        const {inputs, clearCallCount, getCallCount} = createListenerInputs();
        const target = new ImplementedTypedEventTarget();

        inputs.forEach((listenerInputs) => {
            // add all listener types
            inputs.forEach((nestedListenerInputs) => {
                target.addEventListener(...nestedListenerInputs);
            });
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());

            assert.strictEquals(target.getListenerCount(), inputs.length);
            assert.strictEquals(getCallCount(), inputs.length);
            clearCallCount();
            target.removeEventListener(...listenerInputs);
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());
            assert.strictEquals(getCallCount(), inputs.length - 1);
            assert.strictEquals(target.getListenerCount(), inputs.length - 1);
            clearCallCount();
            target.removeAllEventListeners();
        });
    });

    it('destroys itself', () => {
        const instance = new TypedEventTarget<SubEventDerp>();
        instance.addEventListener(SubEventTypeEnum.Derp, () => {});
        assert.strictEquals(instance.getListenerCount(), 1);
        instance.destroy();
        assert.strictEquals(instance.getListenerCount(), 0);
    });
});

describe('EventTypesFromEventTarget', () => {
    it('only allows the given event types', () => {
        type AllowedEvent = EventTypesFromEventTarget<ImplementedTypedEventTarget>;

        const validEvent1: AllowedEvent = new SubEventHerp();
        const validEvent2: AllowedEvent = new SubEventDerp();
        // @ts-expect-error: wrong event class
        const invalidEvent1: AllowedEvent = new Event('herp');
        // @ts-expect-error: wrong event class
        const invalidEvent2: AllowedEvent = new Event('derp');
        // @ts-expect-error: wrong event type
        const invalidEvent3: AllowedEvent = new Event('whatever');
    });
});
