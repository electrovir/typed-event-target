import {assert} from '@open-wc/testing';
import {defineTypedEvent} from './typed-event';

describe(defineTypedEvent.name, () => {
    it('should produce the correct types', () => {
        const thing = defineTypedEvent('derp');
        const instance = new thing();
        const derpString: 'derp' = instance.type;
        const derpString2: 'derp' = thing.type;
        // @ts-expect-error
        const invalidDerpString: 'derp' = 'what' as string;
        // @ts-expect-error
        const invalidDerpString2: 'derp' = new Event('derp').type;

        const derpTypedEvent = defineTypedEvent('derp');
        class stuff extends derpTypedEvent {}

        const stuffInstance = new stuff();

        assert.instanceOf(stuffInstance, stuff);
        assert.instanceOf(stuffInstance, derpTypedEvent);
        assert.strictEqual(thing.type, 'derp');
        assert.strictEqual(instance.type, 'derp');
        assert.strictEqual(derpTypedEvent.type, 'derp');
    });
});
