import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {TypedEventTarget} from '../typed-event-target.js';
import {defineTypedCustomEvent} from './typed-custom-event.js';

describe(defineTypedCustomEvent.name, () => {
    // the following it call is mostly copied from typed-events.ts
    it('should produce the correct custom event types', () => {
        const thing = defineTypedCustomEvent()('derp');
        const instance = new thing({
            detail: undefined,
        });
        const derpString: 'derp' = instance.type;
        const derpString2: 'derp' = thing.type;
        // @ts-expect-error: test that a plain `string` can't be assigned to a string literal
        const invalidDerpString: 'derp' = 'what' as string;
        // @ts-expect-error: test that a default event's type is not type safe
        const invalidDerpString2: 'derp' = new Event('derp').type;

        const derpTypedEvent = defineTypedCustomEvent()('derp');
        class TestClass extends derpTypedEvent {}

        const stuffInstance = new TestClass({
            detail: undefined,
        });

        assert.instanceOf(stuffInstance, TestClass);
        assert.instanceOf(stuffInstance, derpTypedEvent);
        assert.strictEquals(thing.type, 'derp');
        assert.strictEquals(instance.type, 'derp');
        assert.strictEquals(derpTypedEvent.type, 'derp');
    });

    it('should allow data passed to the custom event', () => {
        type AcceptedData = {
            what: string;
        };

        const myTypedCustomEventConstructor = defineTypedCustomEvent<AcceptedData>()('derp');

        const instanceDetail: AcceptedData = {
            what: 'oh nothing',
        };
        const instance = new myTypedCustomEventConstructor({
            detail: instanceDetail,
        });

        const invalidInstance = new myTypedCustomEventConstructor({
            // @ts-expect-error: wrong detail type
            detail: 'what',
        });

        assert.strictEquals(myTypedCustomEventConstructor.type, 'derp');
        assert.deepEquals(instance.detail, instanceDetail);
    });

    it('should work with a TypedEventTarget', () => {
        class MyCustomEvent extends defineTypedCustomEvent<{stuff: string}>()('my-type') {}

        class MyEventTarget extends TypedEventTarget<MyCustomEvent> {}

        const instance = new MyEventTarget();

        // @ts-expect-error: wrong event
        instance.dispatchEvent(new Event('my-type'));
        instance.dispatchEvent(
            new MyCustomEvent({
                detail: {
                    stuff: 'hello',
                },
            }),
        );
        // @ts-expect-error: wrong event
        instance.dispatchEvent(new MyCustomEvent());
        instance.dispatchEvent(
            new MyCustomEvent({
                // @ts-expect-error: wrong event
                stuff: 'hello',
            }),
        );
        // @ts-expect-error: wrong event
        instance.dispatchEvent(new MyCustomEvent({}));
        instance.dispatchEvent(
            new MyCustomEvent({
                // @ts-expect-error: wrong event
                detail: undefined,
            }),
        );
        instance.dispatchEvent(
            new MyCustomEvent({
                // @ts-expect-error: wrong event
                detail: {},
            }),
        );

        instance.addEventListener('my-type', (event) => {
            const instance: MyCustomEvent = event;
        });
        // @ts-expect-error: wrong type
        instance.addEventListener('my-not-real-type', () => {});
    });
});
