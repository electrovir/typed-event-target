import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {defineTypedEvent} from './typed-event.js';

describe(defineTypedEvent.name, () => {
    it('should produce the correct types', () => {
        const thing = defineTypedEvent('derp');
        const instance = new thing();
        const derpString: 'derp' = instance.type;
        const derpString2: 'derp' = thing.type;
        // @ts-expect-error: wrong string assignment
        const invalidDerpString: 'derp' = 'what' as string;
        // @ts-expect-error: Event type is not typed
        const invalidDerpString2: 'derp' = new Event('derp').type;

        const derpTypedEvent = defineTypedEvent('derp');
        class Stuff extends derpTypedEvent {}

        const stuffInstance = new Stuff();

        assert.instanceOf(stuffInstance, Stuff);
        assert.instanceOf(stuffInstance, derpTypedEvent);
        assert.strictEquals(thing.type, 'derp');
        assert.strictEquals(instance.type, 'derp');
        assert.strictEquals(derpTypedEvent.type, 'derp');
    });
});
