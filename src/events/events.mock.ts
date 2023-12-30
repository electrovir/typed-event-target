import {ArrayElement} from '@augment-vir/common';
import {Constructed} from '../augments/constructor';
import {defineTypedEvent} from './typed-event';

export enum SubEventTypeEnum {
    Herp = 'herp',
    Derp = 'derp',
}

export class SubEventHerp extends defineTypedEvent(SubEventTypeEnum.Herp) {}
export class SubEventDerp extends defineTypedEvent(SubEventTypeEnum.Derp) {}

export const possibleEvents = [
    SubEventHerp,
    SubEventDerp,
];

export type PossibleEvent = Constructed<ArrayElement<typeof possibleEvents>>;
