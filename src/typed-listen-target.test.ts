import {waitUntilTruthy} from '@augment-vir/common';
import {assert} from '@open-wc/testing';
import {assertTypeOf} from 'run-time-assertions';
import {defineTypedCustomEvent} from './events/typed-custom-event';
import {ListenTarget, TypedListenTarget} from './typed-listen-target';

export class TestEvent extends defineTypedCustomEvent<{myData: string}>()('test-event') {}

describe(TypedListenTarget.name, () => {
    it('counts listeners', () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        listenTargetInstance.listen(TestEvent.type, () => {});

        assert.strictEqual(listenTargetInstance.getListenerCount(), 1);
    });

    it('removes listeners', () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        const removeListener = listenTargetInstance.listen(TestEvent.type, () => {});

        assert.strictEqual(removeListener(), true);
        assert.strictEqual(removeListener(), false);
        assert.strictEqual(listenTargetInstance.getListenerCount(), 0);
        assert.strictEqual(listenTargetInstance.removeAllListeners(), 0);
    });

    it('allows dispatching an event without listeners', () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            0,
        );
    });

    it('removes all listeners', () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        assert.strictEqual(listenTargetInstance.removeAllListeners(), 0);
        const removeListener = listenTargetInstance.listen(TestEvent.type, () => {});

        assert.strictEqual(listenTargetInstance.removeAllListeners(), 1);
        assert.strictEqual(listenTargetInstance.getListenerCount(), 0);
        assert.strictEqual(listenTargetInstance.removeAllListeners(), 0);
        assert.strictEqual(removeListener(), false);
    });

    it('allows listeners to remove themselves', async () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        let callCount = 0;

        assert.strictEqual(listenTargetInstance.removeAllListeners(), 0);
        listenTargetInstance.listen(TestEvent.type, (event, removeSelf) => {
            callCount++;
            removeSelf();
        });
        assert.strictEqual(listenTargetInstance.getListenerCount(), 1);
        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            1,
        );

        await waitUntilTruthy(() => {
            return callCount >= 1;
        });

        assert.strictEqual(callCount, 1);
        assert.strictEqual(listenTargetInstance.getListenerCount(), 0);
    });

    it('follows once option', async () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        let callCount = 0;

        listenTargetInstance.listen(
            TestEvent.type,
            () => {
                callCount++;
            },
            {once: true},
        );

        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            1,
        );

        await waitUntilTruthy(() => {
            return callCount >= 1;
        });

        assert.strictEqual(callCount, 1);
        assert.strictEqual(listenTargetInstance.getListenerCount(), 0);
    });

    it('listens to an event with type parameters', async () => {
        class SubEvent<
            TypeParam extends Record<PropertyKey, any> = {},
        > extends defineTypedCustomEvent<unknown>()('sub-event') {
            public declare detail: TypeParam;
        }

        const listenTargetInstance = new TypedListenTarget<TestEvent | SubEvent<{value: string}>>();

        listenTargetInstance.listen(SubEvent, (event) => {
            assertTypeOf(event.detail).toEqualTypeOf<{value: string}>();
        });
    });

    it('listens by the event definition or type', async () => {
        const listenTargetInstance = new TypedListenTarget<TestEvent>();

        let callCount = 0;

        listenTargetInstance.listen(TestEvent, (event) => {
            assertTypeOf(event.detail).toEqualTypeOf<{myData: string}>();
            callCount++;
        });
        listenTargetInstance.listen(TestEvent.type, (event) => {
            assertTypeOf(event.detail).toEqualTypeOf<{myData: string}>();
            callCount++;
        });

        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            2,
        );
        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            2,
        );
        assert.strictEqual(
            listenTargetInstance.dispatch(new TestEvent({detail: {myData: 'hi'}})),
            2,
        );

        await waitUntilTruthy(() => {
            return callCount >= 6;
        });

        assert.strictEqual(callCount, 6);
    });

    it('destroys itself', () => {
        const instance = new TypedListenTarget<TestEvent>();

        const events: TestEvent[] = [];

        instance.listen(TestEvent, (event) => {
            events.push(event);
        });
        assert.strictEqual(instance.getListenerCount(), 1);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);

        instance.destroy();
        assert.strictEqual(instance.getListenerCount(), 0);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);
    });

    it('removes a listener with removeListener and event input', () => {
        const instance = new TypedListenTarget<TestEvent>();

        const events: TestEvent[] = [];

        function listener(event: TestEvent) {
            events.push(event);
        }

        instance.listen(TestEvent, listener);
        assert.strictEqual(instance.getListenerCount(), 1);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);

        assert.isTrue(instance.removeListener(TestEvent, listener));
        assert.strictEqual(instance.getListenerCount(), 0);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);
    });

    it('does not remove a listener with removeListener if none attached', () => {
        const instance = new TypedListenTarget<TestEvent>();

        assert.strictEqual(instance.getListenerCount(), 0);
        assert.isFalse(instance.removeListener(TestEvent, () => {}));
        assert.strictEqual(instance.getListenerCount(), 0);
    });

    it('does not remove a listener with removeListener if already removed', () => {
        const instance = new TypedListenTarget<TestEvent>();

        function listener() {}

        instance.listen(TestEvent, listener);
        assert.isTrue(instance.removeListener(TestEvent, listener));
        assert.strictEqual(instance.getListenerCount(), 0);
        assert.isFalse(instance.removeListener(TestEvent, listener));
        assert.strictEqual(instance.getListenerCount(), 0);
    });

    it('removes a listener with removeListener and event type input', () => {
        const instance = new TypedListenTarget<TestEvent>();

        const events: TestEvent[] = [];

        function listener(event: TestEvent) {
            events.push(event);
        }

        instance.listen(TestEvent, listener);
        assert.strictEqual(instance.getListenerCount(), 1);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);

        assert.isTrue(instance.removeListener(TestEvent.type, listener));
        assert.strictEqual(instance.getListenerCount(), 0);

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));
        assert.lengthOf(events, 1);
    });
});

describe(ListenTarget.name, () => {
    it('is the same as TypedListenTarget', () => {
        const instance = new ListenTarget<TestEvent>();

        const events: TestEvent[] = [];

        instance.listen(TestEvent, (event) => {
            events.push(event);
        });

        instance.dispatch(new TestEvent({detail: {myData: 'hello there'}}));

        assert.lengthOf(events, 1);

        instance.destroy();

        assert.strictEqual(instance.getListenerCount(), 0);
    });
});
