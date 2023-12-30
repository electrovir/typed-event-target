import {assert} from '@open-wc/testing';
import {TypedEventTarget} from '../typed-event-target';
import {defineTypedCustomEvent} from './typed-custom-event';

describe(defineTypedCustomEvent.name, () => {
    // the following it call is mostly copied from typed-events.ts
    it('should produce the correct custom event types', () => {
        const thing = defineTypedCustomEvent()('derp');
        const instance = new thing({detail: undefined});
        const derpString: 'derp' = instance.type;
        const derpString2: 'derp' = thing.type;
        // @ts-expect-error
        const invalidDerpString: 'derp' = 'what' as string;
        // @ts-expect-error
        const invalidDerpString2: 'derp' = new Event('derp').type;

        const derpTypedEvent = defineTypedCustomEvent()('derp');
        class stuff extends derpTypedEvent {}

        const stuffInstance = new stuff({detail: undefined});

        assert.instanceOf(stuffInstance, stuff);
        assert.instanceOf(stuffInstance, derpTypedEvent);
        assert.strictEqual(thing.type, 'derp');
        assert.strictEqual(instance.type, 'derp');
        assert.strictEqual(derpTypedEvent.type, 'derp');
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
            // @ts-expect-error
            detail: 'what',
        });

        assert.strictEqual(myTypedCustomEventConstructor.type, 'derp');
        assert.deepStrictEqual(instance.detail, instanceDetail);
    });

    it('should work with a TypedEventTarget', () => {
        class MyCustomEvent extends defineTypedCustomEvent<{stuff: string}>()('my-type') {}

        class MyEventTarget extends TypedEventTarget<MyCustomEvent> {}

        const instance = new MyEventTarget();

        // @ts-expect-error
        instance.dispatchEvent(new Event('my-type'));
        instance.dispatchEvent(new MyCustomEvent({detail: {stuff: 'hello'}}));
        // @ts-expect-error
        instance.dispatchEvent(new MyCustomEvent());
        // @ts-expect-error
        instance.dispatchEvent(new MyCustomEvent({stuff: 'hello'}));
        // @ts-expect-error
        instance.dispatchEvent(new MyCustomEvent({}));
        // @ts-expect-error
        instance.dispatchEvent(new MyCustomEvent({detail: undefined}));
        // @ts-expect-error
        instance.dispatchEvent(new MyCustomEvent({detail: {}}));

        instance.addEventListener('my-type', (event) => {
            const instance: MyCustomEvent = event;
        });
        // @ts-expect-error
        instance.addEventListener('my-not-real-type', () => {});
    });
});
