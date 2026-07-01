import {describe, it} from '@augment-vir/test';
import {type ExtractEventByType, type ExtractEventTypes} from './event-types.js';
import {type PossibleEvent, SubEventDerp, SubEventHerp, SubEventTypeEnum} from './events.mock.js';

describe('ExtractEventByType', () => {
    it('extracts event types from a list of possible events', () => {
        const validEvent: PossibleEvent = new SubEventDerp();
        // @ts-expect-error: PossibleEvent can't accept other Event constructors
        const invalidEvent: PossibleEvent = new Event('word');
    });

    it('narrows a union of possible events', () => {
        type NarrowedType = ExtractEventByType<PossibleEvent, typeof SubEventTypeEnum.Derp>;

        const validInstance: NarrowedType = new SubEventDerp();
        // @ts-expect-error: SubEventHerp should not be SubEventDerp
        const invalidInstance: NarrowedType = new SubEventHerp();
    });

    it('restricts event dispatches to given types', () => {});
});

describe('ExtractEventTypes', () => {
    it('extracts event types from events', () => {
        type PossibleEventTypes = ExtractEventTypes<PossibleEvent>;

        const validType1: PossibleEventTypes = SubEventTypeEnum.Derp;
        const validType2: PossibleEventTypes = SubEventTypeEnum.Herp;
        // @ts-expect-error: mismatched strings
        const invalidType1: PossibleEventTypes = '';
        // @ts-expect-error: mismatched strings
        const invalidType2: PossibleEventTypes = 'derp';
        // @ts-expect-error: mismatched strings
        const invalidType3: PossibleEventTypes = 'whatever';
    });
});
