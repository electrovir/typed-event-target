import {assert, waitUntil} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {defineTypedCustomEvent} from './events/typed-custom-event.js';
import {defineTypedEvent} from './events/typed-event.js';
import {GenericListenTarget} from './generic-listen-target.js';

class TestEvent extends defineTypedCustomEvent<{myData: string}>()('generic-test-event') {}
class AnotherEvent extends defineTypedEvent('another-event') {}

describe(GenericListenTarget.name, () => {
    it('listens and dispatches by event class', () => {
        const instance = new GenericListenTarget();
        const events: TestEvent[] = [];

        instance.listen(TestEvent, (event) => {
            events.push(event);
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'hello',
                },
            }),
        );

        assert.isLengthExactly(events, 1);
        assert.strictEquals(events[0].detail.myData, 'hello');
    });

    it('does not fire unmatched listeners', () => {
        const instance = new GenericListenTarget();
        let fired = false;

        instance.listen(TestEvent, () => {
            fired = true;
        });

        instance.dispatch(new AnotherEvent());

        assert.isFalse(fired);
    });

    it('fires parent class listener for child class event', () => {
        const instance = new GenericListenTarget();
        const events: Event[] = [];

        instance.listen(Event, (event) => {
            events.push(event);
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'child',
                },
            }),
        );

        assert.isLengthExactly(events, 1);
    });

    it('does not fire child class listener for parent class event', () => {
        const instance = new GenericListenTarget();
        let fired = false;

        instance.listen(CustomEvent, () => {
            fired = true;
        });

        instance.dispatch(new Event('plain'));

        assert.isFalse(fired);
    });

    it('counts listeners', () => {
        const instance = new GenericListenTarget();

        instance.listen(TestEvent, () => {});
        instance.listen(AnotherEvent, () => {});
        instance.listen(TestEvent, () => {});

        assert.strictEquals(instance.getListenerCount(), 3);
    });

    it('removes a listener via the returned callback', () => {
        const instance = new GenericListenTarget();

        const removeListener = instance.listen(TestEvent, () => {});

        assert.strictEquals(instance.getListenerCount(), 1);
        assert.isTrue(removeListener());
        assert.strictEquals(instance.getListenerCount(), 0);
        assert.isFalse(removeListener());
    });

    it('removes a listener via removeListener', () => {
        const instance = new GenericListenTarget();
        const events: TestEvent[] = [];

        function listener(event: TestEvent) {
            events.push(event);
        }

        instance.listen(TestEvent, listener);
        assert.strictEquals(instance.getListenerCount(), 1);

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'first',
                },
            }),
        );
        assert.isLengthExactly(events, 1);

        assert.isTrue(instance.removeListener(TestEvent, listener));
        assert.strictEquals(instance.getListenerCount(), 0);

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'second',
                },
            }),
        );
        assert.isLengthExactly(events, 1);
    });

    it('returns false from removeListener when no listeners exist', () => {
        const instance = new GenericListenTarget();

        assert.isFalse(instance.removeListener(TestEvent, () => {}));
    });

    it('returns false from removeListener when listener already removed', () => {
        const instance = new GenericListenTarget();

        function listener() {}

        instance.listen(TestEvent, listener);
        assert.isTrue(instance.removeListener(TestEvent, listener));
        assert.isFalse(instance.removeListener(TestEvent, listener));
    });

    it('allows listeners to remove themselves', async () => {
        const instance = new GenericListenTarget();
        let callCount = 0;

        instance.listen(TestEvent, (_event, removeSelf) => {
            callCount++;
            removeSelf();
        });

        assert.strictEquals(instance.getListenerCount(), 1);

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'self-remove',
                },
            }),
        );

        await waitUntil.isTruthy(() => {
            return callCount >= 1;
        });

        assert.strictEquals(callCount, 1);
        assert.strictEquals(instance.getListenerCount(), 0);
    });

    it('follows once option', async () => {
        const instance = new GenericListenTarget();
        let callCount = 0;

        instance.listen(
            TestEvent,
            () => {
                callCount++;
            },
            {
                once: true,
            },
        );

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'once-1',
                },
            }),
        );
        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'once-2',
                },
            }),
        );

        await waitUntil.isTruthy(() => {
            return callCount >= 1;
        });

        assert.strictEquals(callCount, 1);
        assert.strictEquals(instance.getListenerCount(), 0);
    });

    it('dispatches with no listeners and returns 0', () => {
        const instance = new GenericListenTarget();

        assert.strictEquals(
            instance.dispatch(
                new TestEvent({
                    detail: {
                        myData: 'nobody home',
                    },
                }),
            ),
            0,
        );
    });

    it('sets event.target to the instance', () => {
        const instance = new GenericListenTarget();
        const events: TestEvent[] = [];

        instance.listen(TestEvent, (event) => {
            events.push(event);
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'target-test',
                },
            }),
        );

        assert.strictEquals(events[0]?.target as unknown, instance);
    });

    it('removes all listeners', () => {
        const instance = new GenericListenTarget();

        instance.listen(TestEvent, () => {});
        instance.listen(AnotherEvent, () => {});
        instance.listen(TestEvent, () => {});

        assert.strictEquals(instance.removeAllListeners(), 3);
        assert.strictEquals(instance.getListenerCount(), 0);
        assert.strictEquals(instance.removeAllListeners(), 0);
    });

    it('destroys itself', () => {
        const instance = new GenericListenTarget();
        const events: TestEvent[] = [];

        instance.listen(TestEvent, (event) => {
            events.push(event);
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'before-destroy',
                },
            }),
        );
        assert.isLengthExactly(events, 1);

        instance.destroy();
        assert.strictEquals(instance.getListenerCount(), 0);

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'after-destroy',
                },
            }),
        );
        assert.isLengthExactly(events, 1);
    });

    it('fires multiple listeners on the same class', () => {
        const instance = new GenericListenTarget();
        let count = 0;

        instance.listen(TestEvent, () => {
            count++;
        });
        instance.listen(TestEvent, () => {
            count++;
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'multi',
                },
            }),
        );

        assert.strictEquals(count, 2);
    });

    it('returns correct fired count from dispatch', () => {
        const instance = new GenericListenTarget();

        instance.listen(TestEvent, () => {});
        instance.listen(TestEvent, () => {});
        instance.listen(AnotherEvent, () => {});

        assert.strictEquals(
            instance.dispatch(
                new TestEvent({
                    detail: {
                        myData: 'count-test',
                    },
                }),
            ),
            2,
        );
    });

    it('fires both parent and child listeners for a child event', () => {
        const instance = new GenericListenTarget();
        let parentFired = false;
        let childFired = false;

        instance.listen(Event, () => {
            parentFired = true;
        });
        instance.listen(TestEvent, () => {
            childFired = true;
        });

        instance.dispatch(
            new TestEvent({
                detail: {
                    myData: 'hierarchy',
                },
            }),
        );

        assert.isTrue(parentFired);
        assert.isTrue(childFired);
    });
});
