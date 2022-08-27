import {ExtractEventByType, ExtractEventTypes} from './event-types';
import {PossibleEvent, SubEventDerp, SubEventHerp, SubEventType} from './test/test-events';

describe('ExtractEventByType', () => {
    it('should extract event types from a list of possible events', () => {
        const validEvent: PossibleEvent = new SubEventDerp();
        // PossibleEvent can't accept other Event constructors
        // @ts-expect-error
        const invalidEvent: PossibleEvent = new Event('word');
    });

    it('should narrow a union of possible events', () => {
        type NarrowedType = ExtractEventByType<PossibleEvent, typeof SubEventType.Derp>;

        const validInstance: NarrowedType = new SubEventDerp();
        // @ts-expect-error
        const invalidInstance: NarrowedType = new SubEventHerp();
    });

    it('should restrict event dispatches to given types', () => {});
});

describe('ExtractEventTypes', () => {
    it('should extract event types from events', () => {
        type PossibleEventTypes = ExtractEventTypes<PossibleEvent>;

        const validType1: PossibleEventTypes = SubEventType.Derp;
        const validType2: PossibleEventTypes = SubEventType.Herp;
        // @ts-expect-error
        const invalidType1: PossibleEventTypes = '';
        // @ts-expect-error
        const invalidType2: PossibleEventTypes = 'derp';
        // @ts-expect-error
        const invalidType3: PossibleEventTypes = 'whatever';
    });
});
