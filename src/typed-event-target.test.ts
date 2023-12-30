import {ArrayElement} from '@augment-vir/common';
import {assert} from '@open-wc/testing';
import {Constructed} from './augments/constructor';
import {TypedEventListener} from './listener';
import {SubEventDerp, SubEventHerp, SubEventTypeEnum} from './test/test-events';
import {EventTypesFromEventTarget, TypedEventTarget} from './typed-event-target';

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
        constructed.dispatchEvent(new Event(SubEventTypeEnum.Derp));
        // @ts-expect-error
        constructed.dispatchEvent(new Event('what'));
    });

    it('should restrict event listener types', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventTypeEnum.Derp, () => {});
        // @ts-expect-error
        constructed.addEventListener('what', () => {});
        // even if the string exactly matches the enum values the type won't work
        // @ts-expect-error
        constructed.addEventListener('herp', () => {});
    });

    it('should provide type information to the event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        constructed.addEventListener(SubEventTypeEnum.Derp, (event) => {
            const canAssignToExpectedEventType: SubEventDerp = event;
            // @ts-expect-error
            const cannotAssignToOtherEventType: SubEventHerp = event;
        });
    });

    it('should restrict event types to removing a listener', () => {
        const constructed = new ImplementedTypedEventTarget();

        const goodListener: TypedEventListener<SubEventDerp> = () => {};
        const plainEventListener: TypedEventListener<Event> = () => {};

        constructed.removeEventListener(SubEventTypeEnum.Derp, goodListener);
        // @ts-expect-error
        constructed.removeEventListener(SubEventTypeEnum.Herp, goodListener);
        // @ts-expect-error
        constructed.removeEventListener('herp', plainEventListener);
        // @ts-expect-error
        constructed.removeEventListener('another string', plainEventListener);
        constructed.removeEventListener(SubEventTypeEnum.Derp, plainEventListener);
        constructed.removeEventListener(SubEventTypeEnum.Herp, plainEventListener);
    });

    it('should actually pass events to event listeners', () => {
        const constructed = new ImplementedTypedEventTarget();

        const caughtEvents: {
            listener: string;
            event: EventTypesFromEventTarget<ImplementedTypedEventTarget>;
        }[] = [];

        try {
            constructed.addEventListener(SubEventTypeEnum.Derp, (event) => {
                caughtEvents.push({listener: 'first-derp', event});
                assert.strictEqual(event.type, SubEventTypeEnum.Derp);
            });

            const firstEvent = new SubEventDerp();
            constructed.dispatchEvent(firstEvent);
            constructed.dispatchEvent(new SubEventHerp());

            constructed.addEventListener(SubEventTypeEnum.Herp, (event) => {
                caughtEvents.push({listener: 'first-herp', event});

                assert.strictEqual(event.type, SubEventTypeEnum.Herp);
            });
            constructed.addEventListener(SubEventTypeEnum.Herp, (event) => {
                caughtEvents.push({listener: 'second-herp', event});

                assert.strictEqual(event.type, SubEventTypeEnum.Herp);
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
            {capture: true},
        );
        target.addEventListener(
            SubEventTypeEnum.Herp,
            () => {
                listenerCallCount++;
            },
            {capture: false},
        );
        target.addEventListener(SubEventTypeEnum.Derp, () => {
            listenerCallCount++;
        });

        target.dispatchEvent(new SubEventHerp());
        assert.strictEqual(listenerCallCount, 5);
        target.dispatchEvent(new SubEventDerp());
        assert.strictEqual(listenerCallCount, 6);

        target.removeAllEventListeners();
        listenerCallCount = 0;
        target.dispatchEvent(new SubEventHerp());
        target.dispatchEvent(new SubEventDerp());
        assert.strictEqual(listenerCallCount, 0);
        assert.strictEqual(target.getListenerCount(), 0);
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
                {capture: true},
            ],
            [
                SubEventTypeEnum.Herp,
                () => {
                    callCount++;
                },
                {capture: false},
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
            clearCallCount() {
                callCount = 0;
            },
            getCallCount() {
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
            assert.strictEqual(getCallCount(), 1);
            assert.strictEqual(target.getListenerCount(), 1);
            clearCallCount();
            target.removeEventListener(...listenerInputs);
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());
            assert.strictEqual(getCallCount(), 0);
            assert.strictEqual(target.getListenerCount(), 0);
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

            assert.strictEqual(target.getListenerCount(), inputs.length);
            assert.strictEqual(getCallCount(), inputs.length);
            clearCallCount();
            target.removeEventListener(...listenerInputs);
            target.dispatchEvent(new SubEventHerp());
            target.dispatchEvent(new SubEventDerp());
            assert.strictEqual(getCallCount(), inputs.length - 1);
            assert.strictEqual(target.getListenerCount(), inputs.length - 1);
            clearCallCount();
            target.removeAllEventListeners();
        });
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
